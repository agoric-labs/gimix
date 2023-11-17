/* global harden */
// @ts-check
import { assert } from "@agoric/assert";
import { makeNotifierKit } from "@agoric/notifier";
// eslint-disable-next-line node/no-extraneous-import
import { AmountMath } from "@agoric/ertp";
import { iterateLatest, makeFollower, makeLeader } from "@agoric/casting";

/** @typedef {import('@agoric/smart-wallet/src/types.js').Petname} Petname */

/** @typedef {import('@keplr-wallet/types').Coin} Coin */

/**
 * @typedef {{
 *  brand?: unknown,
 *  brandPetname?: Petname,
 *  currentAmount: unknown,
 *  pursePetname?: Petname,
 *  displayInfo?: unknown,
 * }} PurseInfo
 */

/**
 * @typedef {[
 *  string,
 *  {
 *    brand: unknown,
 *    issuerName: string,
 *    displayInfo: unknown
 *  }
 * ][]} VBankAssets
 */

// const POLL_INTERVAL_MS = 6000;

/**
 * @param {any} chainStorageWatcher
 * @param {string} address
 * @param {string} rpc
 */
export const watchWallet = (chainStorageWatcher, address, rpc) => {
  const pursesNotifierKit = makeNotifierKit(
    /** @type {PurseInfo[] | null} */ (null)
  );

  const updatePurses = (brandToPurse) => {
    /** @type {PurseInfo[]} */
    const purses = [];
    for (const [_brand, purse] of brandToPurse.entries()) {
      if (purse.currentAmount && purse.brandPetname) {
        assert(purse.pursePetname, "missing purse.pursePetname");
        purses.push(purse);
      }
    }
    pursesNotifierKit.updater.updateState(harden(purses));
  };

  const publicSubscriberPathsNotifierKit = makeNotifierKit(
    /** @type {  import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord['offerToPublicSubscriberPaths'] | null } */ (
      null
    )
  );

  const walletUpdatesNotifierKit = makeNotifierKit(
    /** @type {  import('@agoric/smart-wallet/src/smartWallet.js').UpdateRecord | null } */ (
      null
    )
  );

  const smartWalletStatusNotifierKit = makeNotifierKit(
    /** @type { {provisioned: boolean} | null } */ (null)
  );

  let lastPaths;
  chainStorageWatcher.watchLatest(
    ["data", `published.wallet.${address}.current`],
    (value) => {
      smartWalletStatusNotifierKit.updater.updateState(
        harden({ provisioned: true })
      );
      const { offerToPublicSubscriberPaths: currentPaths } = value;
      if (currentPaths === lastPaths) return;

      publicSubscriberPathsNotifierKit.updater.updateState(
        harden(currentPaths)
      );
    },
    (err) => {
      if (
        !lastPaths &&
        err === "could not get vstorage path: unknown request"
      ) {
        smartWalletStatusNotifierKit.updater.updateState(
          harden({ provisioned: false })
        );
      } else {
        throw Error(err);
      }
    }
  );

  const watchChainBalances = () => {
    const brandToPurse = new Map();

    {
      /** @type {VBankAssets} */
      let vbankAssets;
      /** @type {Coin[]} */
      let bank;

      const possiblyUpdateBankPurses = () => {
        if (!vbankAssets || !bank) return;

        const bankMap = new Map(
          bank.map(({ denom, amount }) => [denom, amount])
        );

        vbankAssets.forEach(([denom, info]) => {
          const amount = bankMap.get(denom) ?? 0n;
          const purseInfo = {
            brand: info.brand,
            currentAmount: AmountMath.make(info.brand, BigInt(amount)),
            brandPetname: info.issuerName,
            pursePetname: info.issuerName,
            displayInfo: info.displayInfo,
          };
          brandToPurse.set(info.brand, purseInfo);
        });

        updatePurses(brandToPurse);
      };

      const watchVbankAssets = () => {
        chainStorageWatcher.watchLatest(
          ["data", "published.agoricNames.vbankAsset"],
          (value) => {
            vbankAssets = value;
            possiblyUpdateBankPurses();
          }
        );
      };

      void watchVbankAssets();
    }

    {
      /** @type { [string, unknown][] } */
      let agoricBrands;
      /** @type { {balance: unknown, brand: unknown}[] } */
      let nonBankPurses;
      /** @type { Map<unknown, { displayInfo: unknown }> } */
      let brandToBoardAux;

      const possiblyUpdateNonBankPurses = () => {
        if (!agoricBrands || !nonBankPurses || !brandToBoardAux) return;

        nonBankPurses.forEach(({ balance, brand }) => {
          const petname = agoricBrands
            ?.find(([_petname, b]) => b === brand)
            ?.at(0);
          const { displayInfo } = brandToBoardAux.get(brand) ?? {};
          const purseInfo = {
            brand,
            currentAmount: balance,
            brandPetname: petname,
            pursePetname: petname,
            displayInfo,
          };
          brandToPurse.set(brand, purseInfo);
        });

        updatePurses(brandToPurse);
      };

      const watchBrands = () => {
        chainStorageWatcher.watchLatest(
          ["data", "published.agoricNames.brand"],
          (value) => {
            agoricBrands = value;
            possiblyUpdateNonBankPurses();
          }
        );
      };

      const watchPurses = () =>
        chainStorageWatcher.watchLatest(
          ["data", `published.wallet.${address}.current`],
          async (value) => {
            const { purses } = value;
            if (nonBankPurses === purses) return;

            await null;
            if (purses.length !== nonBankPurses?.length) {
              const brands = purses.map((p) => p.brand);
              try {
                const boardAux = await Promise.all(
                  chainStorageWatcher.queryBoardAux(brands)
                );
                brandToBoardAux = new Map(
                  brands.map((brand, index) => [brand, boardAux[index]])
                );
              } catch (e) {
                console.error("Error getting boardAux for brands", brands, e);
              }
            }

            nonBankPurses = purses;
            possiblyUpdateNonBankPurses();
          }
        );

      void watchBrands();
      void watchPurses();
    }
  };

  const watchWalletUpdates = async () => {
    const leader = makeLeader(rpc);
    const follower = makeFollower(`:published.wallet.${address}`, leader, {
      proof: "none",
      unserializer: chainStorageWatcher.marshaller,
    });

    for await (const { value } of iterateLatest(follower)) {
      console.debug("wallet update", value);
      walletUpdatesNotifierKit.updater.updateState(harden(value));
    }
  };

  watchChainBalances();
  watchWalletUpdates();

  return {
    pursesNotifier: pursesNotifierKit.notifier,
    publicSubscribersNotifier: publicSubscriberPathsNotifierKit.notifier,
    walletUpdatesNotifier: walletUpdatesNotifierKit.notifier,
    smartWalletStatusNotifier: smartWalletStatusNotifierKit.notifier,
  };
};

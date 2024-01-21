/* global harden */
import { SigningStargateClient } from "@cosmjs/stargate";
import { subscribeLatest } from "@agoric/notifier";
import { makeInteractiveSigner } from "./makeInteractiveSigner.js";
import { watchWallet } from "./watchWallet.js";
import { ChainStorageWatcher } from "./chainStorageWatcher.js";

export const makeAgoricWalletConnection = async (
  chainStorageWatcher: ChainStorageWatcher,
  rpc: string,
  mnemonic: string
): Promise<{
  makeOffer: (
    invitationSpec: unknown,
    proposal: unknown,
    offerArgs: unknown,
    onStatusChange: (status: { status: string; data?: unknown }) => void,
    id?: number
  ) => Promise<void>;
  address: string;
  provisionSmartWallet: unknown;
  walletUpdatesNotifier: unknown;
}> => {
  const { address, submitSpendAction, provisionSmartWallet } =
    await makeInteractiveSigner(
      rpc,
      mnemonic,
      SigningStargateClient.connectWithSigner
    );

  const walletNotifiers = watchWallet(chainStorageWatcher, address);

  const makeOffer = async (
    invitationSpec: unknown,
    proposal: unknown,
    offerArgs: unknown,
    onStatusChange: (status: { status: string; data?: unknown }) => void,
    id = new Date().getTime()
  ): Promise<void> => {
    const { marshaller } = chainStorageWatcher;
    const spendAction = marshaller.toCapData(
      // @ts-expect-error global harden
      harden({
        method: "executeOffer",
        offer: {
          id,
          invitationSpec,
          proposal,
          offerArgs,
        },
      })
    );

    await null;
    try {
      const txn = await submitSpendAction(JSON.stringify(spendAction));
      onStatusChange({ status: "seated", data: { txn, offerId: id } });
    } catch (e) {
      onStatusChange({ status: "error", data: e });
      return;
    }

    const iterator = subscribeLatest(walletNotifiers.walletUpdatesNotifier);
    for await (const update of iterator) {
      if (update?.updated !== "offerStatus" || update.status.id !== id) {
        continue;
      }
      if (update.status.error !== undefined) {
        onStatusChange({ status: "error", data: update.status.error });
        return;
      }
      if (update.status.numWantsSatisfied === 0) {
        onStatusChange({ status: "refunded" });
        return;
      }
      if (update.status.numWantsSatisfied === 1) {
        onStatusChange({ status: "accepted" });
        return;
      }
    }
  };

  return {
    makeOffer,
    address,
    provisionSmartWallet,
    walletUpdatesNotifier: walletNotifiers.walletUpdatesNotifier,
  };
};

import { fromBech32, toBech32, fromBase64, toBase64 } from "@cosmjs/encoding";
import { Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  createBankAminoConverters,
  createAuthzAminoConverters,
} from "@cosmjs/stargate";
import {
  MsgWalletSpendAction,
  MsgProvision,
} from "@agoric/cosmic-proto/swingset/msgs.js";
import { stableCurrency, bech32Config } from "./chainInfo.js";
import { Errors } from "../errors.js";

/** @typedef {import("@cosmjs/proto-signing").EncodeObject} EncodeObject */
/** @typedef {import("@cosmjs/stargate").AminoConverters} AminoConverters */
/** @typedef {import("@cosmjs/stargate").StdFee} StdFee */
/** @typedef {import('@keplr-wallet/types').ChainInfo} ChainInfo */
/** @typedef {import('@keplr-wallet/types').Keplr} Keplr */

/**
 * @param {string} address
 * @returns {Uint8Array}
 */
const toAccAddress = (address) => {
  return fromBech32(address).data;
};

// XXX domain of @agoric/cosmic-proto
/**
 * non-exhaustive list of powerFlags
 *
 * See also MsgProvision in golang/cosmos/proto/agoric/swingset/msgs.proto
 */
const PowerFlags = {
  SMART_WALLET: "SMART_WALLET",
};

/**
 * `/agoric.swingset.XXX` matches package agoric.swingset in swingset/msgs.proto
 * aminoType taken from Type() in golang/cosmos/x/swingset/types/msgs.go
 */
const SwingsetMsgs = {
  MsgWalletSpendAction: {
    typeUrl: "/agoric.swingset.MsgWalletSpendAction",
    aminoType: "swingset/WalletSpendAction",
  },
  MsgProvision: {
    typeUrl: "/agoric.swingset.MsgProvision",
    aminoType: "swingset/Provision",
  },
};

/** @typedef {{owner: string, spendAction: string}} WalletSpendAction */

const SwingsetRegistry = new Registry([
  ...defaultRegistryTypes,
  // XXX should this list be "upstreamed" to @agoric/cosmic-proto?
  [SwingsetMsgs.MsgWalletSpendAction.typeUrl, MsgWalletSpendAction],
  [SwingsetMsgs.MsgProvision.typeUrl, MsgProvision],
]);

/**
 * @returns {StdFee}
 */
const zeroFee = () => {
  const { coinMinimalDenom: denom } = stableCurrency;
  const fee = {
    amount: [{ amount: "0", denom }],
    gas: "300000", // TODO: estimate gas?
  };
  return fee;
};

const dbg = (label) => (x) => {
  console.log(label, x);
  return x;
};

/**
 * @type {AminoConverters}
 */
const SwingsetConverters = {
  [SwingsetMsgs.MsgWalletSpendAction.typeUrl]: {
    aminoType: SwingsetMsgs.MsgWalletSpendAction.aminoType,
    toAmino: ({ spendAction, owner }) => ({
      spend_action: spendAction,
      owner: toBech32(bech32Config.bech32PrefixAccAddr, fromBase64(owner)),
    }),
    fromAmino: ({ spend_action: spendAction, owner }) => ({
      spendAction,
      owner: toBase64(toAccAddress(owner)),
    }),
  },
  [SwingsetMsgs.MsgProvision.typeUrl]: {
    aminoType: SwingsetMsgs.MsgProvision.aminoType,
    toAmino: (protoVal) => {
      const { nickname, address, powerFlags, submitter } = dbg(
        "provision toAmino protoVal"
      )(protoVal);
      return {
        address: toBech32(
          bech32Config.bech32PrefixAccAddr,
          fromBase64(address)
        ),
        nickname,
        powerFlags,
        submitter: toBech32(
          bech32Config.bech32PrefixAccAddr,
          fromBase64(submitter)
        ),
      };
    },
    fromAmino: (aminoVal) => {
      const { nickname, address, powerFlags, submitter } = dbg(
        "provision fromAmino aminoVal"
      )(aminoVal);
      return {
        address: toBase64(toAccAddress(address)),
        nickname,
        powerFlags,
        submitter: toBase64(toAccAddress(submitter)),
      };
    },
  },
};

/**
 * Use Keplr to sign offers and delegate object messaging to local storage key.
 * @param {string} chainId
 * @param {string} rpc
 * @param {Keplr} keplr
 * @param {typeof import('@cosmjs/stargate').SigningStargateClient.connectWithSigner} connectWithSigner
 * Ref: https://docs.keplr.app/api/
 */
export const makeInteractiveSigner = async (
  chainId,
  rpc,
  keplr,
  connectWithSigner
) => {
  await null;
  try {
    await keplr.enable(chainId);
  } catch {
    throw Error(Errors.enableKeplr);
  }

  const key = await keplr.getKey(chainId);

  // Until we have SIGN_MODE_TEXTUAL,
  // Use Amino because Direct results in ugly protobuf in the keplr UI.
  const offlineSigner = await keplr.getOfflineSignerOnlyAmino(chainId);
  console.debug("InteractiveSigner", { offlineSigner });

  // Currently, Keplr extension manages only one address/public key pair.
  const [account] = await offlineSigner.getAccounts();
  const { address } = account;

  const converters = {
    ...SwingsetConverters,
    ...createBankAminoConverters(),
    ...createAuthzAminoConverters(),
  };
  const signingClient = await connectWithSigner(rpc, offlineSigner, {
    aminoTypes: new AminoTypes(converters),
    registry: SwingsetRegistry,
  });
  console.debug("InteractiveSigner", { signingClient });

  const fee = zeroFee();

  return harden({
    address, // TODO: address can change
    isNanoLedger: key.isNanoLedger,

    /**
     * Sign and broadcast Provision for a new smart wallet
     *
     * @throws if account does not exist on chain, user cancels,
     *         RPC connection fails, RPC service fails to broadcast (
     *         for example, if signature verification fails)
     */
    provisionSmartWallet: async () => {
      const { accountNumber, sequence } = await signingClient.getSequence(
        address
      );
      console.log({ accountNumber, sequence });

      const b64address = toBase64(toAccAddress(address));

      const act1 = {
        typeUrl: SwingsetMsgs.MsgProvision.typeUrl,
        value: {
          address: b64address,
          nickname: "my wallet",
          powerFlags: [PowerFlags.SMART_WALLET],
          submitter: b64address,
        },
      };

      const msgs = [act1];
      console.log("sign provision", { address, msgs, fee });

      const tx = await signingClient.signAndBroadcast(address, msgs, fee);
      console.log("spend action result tx", tx);
      assertIsDeliverTxSuccess(tx);

      return tx;
    },

    /**
     * Sign and broadcast WalletSpendAction
     *
     * @param {string} spendAction marshaled offer
     * @throws if account does not exist on chain, user cancels,
     *         RPC connection fails, RPC service fails to broadcast (
     *         for example, if signature verification fails)
     */
    submitSpendAction: async (spendAction) => {
      const { accountNumber, sequence } = await signingClient.getSequence(
        address
      );
      console.debug({ accountNumber, sequence });

      const act1 = {
        typeUrl: SwingsetMsgs.MsgWalletSpendAction.typeUrl,
        value: {
          owner: toBase64(toAccAddress(address)),
          spendAction,
        },
      };

      const msgs = [act1];
      console.debug("sign spend action", { address, msgs, fee });

      const tx = await signingClient.signAndBroadcast(address, msgs, fee);
      console.debug("spend action result tx", tx);
      assertIsDeliverTxSuccess(tx);

      return tx;
    },
  });
};

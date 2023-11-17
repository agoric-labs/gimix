/* global harden */
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient, defaultRegistryTypes } from "@cosmjs/stargate";
import { MsgWalletSpendAction } from "@agoric/cosmic-proto/swingset/msgs.js";
import { fromBech32, toBase64 } from "@cosmjs/encoding";
import { makeClientMarshaller } from "./marshal.js";
// @ts-expect-error no types
import { makeRpcUtils, getNetworkConfig } from "./agoric-cli-rpc.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { Agoric, hdPath } from "./chainInfo.js";

const toAccAddress = (address: string) => {
  return fromBech32(address).data;
};

type MakeAgoricSignerArgs = {
  mnemonic: string;
  rpcUrl: string;
};

export const makeAgoricSigner = async ({
  mnemonic,
  rpcUrl,
}: MakeAgoricSignerArgs) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: Agoric.Bech32MainPrefix,
    hdPaths: [hdPath(Agoric.CoinType, 0), hdPath(Agoric.CoinType, 1)],
  });
  const [account] = await wallet.getAccounts();

  const registry = new Registry([
    ...defaultRegistryTypes,
    [Agoric.proto.swingset.MsgWalletSpendAction.typeUrl, MsgWalletSpendAction],
  ]);

  const signingClient = await SigningStargateClient.connectWithSigner(
    rpcUrl,
    wallet,
    {
      gasPrice: Agoric.gasPrice,
      registry,
    }
  );
  return { wallet, signingClient, address: account.address };
};

type AcceptOracleInvitationArgs = {
  offerId: string;
  signingClient: SigningStargateClient;
  address: string;
};

export const acceptOracleInvitation = async ({
  offerId,
  signingClient,
  address,
}: AcceptOracleInvitationArgs) => {
  const rpcTools = async () => {
    const utils = await makeRpcUtils({ fetch });
    const lookupInstance = (name = "GiMiX") => {
      const instance = utils.agoricNames.instance[name];
      if (!instance) {
        console.debug("known instances:", utils.agoricNames.instance);
        throw Error(`Unknown instance ${name}`);
      }
      return instance;
    };
    return { ...utils, lookupInstance };
  };
  const { lookupInstance } = await rpcTools();
  const instance = lookupInstance("GiMiX");
  console.debug("instance", instance);

  const marshaller = makeClientMarshaller();
  const spendAction = JSON.stringify(
    marshaller.toCapData(
      // @ts-expect-error harden is global
      harden({
        method: "executeOffer",
        offer: {
          id: offerId,
          invitationSpec: {
            source: "purse",
            instance,
            description: "gimix oracle invitation",
          },
          proposal: {},
        },
      })
    )
  );
  const { accountNumber, sequence } = await signingClient.getSequence(address);
  console.debug({ accountNumber, sequence, spendAction });

  const act1 = {
    typeUrl: Agoric.proto.swingset.MsgWalletSpendAction.typeUrl,
    value: {
      owner: toBase64(toAccAddress(address)),
      spendAction,
    },
  };

  const msgs = [act1];
  const fee = {
    amount: [{ amount: "0", denom: "uist" }],
    gas: "300000", // TODO: estimate gas
  };
  console.debug("sign spend action", { address, msgs, fee });
  try {
    const tx = await signingClient.signAndBroadcast(address, msgs, fee);
    if (tx.code === 0) {
      console.log("sucess!", tx);
      return tx;
    }
  } catch (e) {
    console.error(e);
    throw new Error("Error signing and broadcasting message.");
  }
};

export const makeOracleSigningClient = async () => {
  const networkConfig = await getNetworkConfig(process.env);
  const rpcUrl = networkConfig.rpcAddrs[0];
  const mnemonic = getEnvVar("WALLET_MNEMONIC");
  return makeAgoricSigner({
    mnemonic,
    rpcUrl,
  });
};

import { AgoricChainStoragePathKind as Kind } from "./ui-kit/types.js";
import { getNetworkConfig } from "./networkConfig.js";
import {
  makeAgoricChainStorageWatcher,
  ChainStorageWatcher,
} from "./ui-kit/chainStorageWatcher.js";
import { makeAgoricWalletConnection } from "./ui-kit/walletConnection.js";
import { getEnvVar } from "../utils/getEnvVar.js";

const getNetConfig = async () => {
  const networkConfig = await getNetworkConfig(process.env);
  const { chainName, rpcAddrs } = networkConfig;
  return {
    chainName,
    rpcUrl: rpcAddrs[0],
  };
};

export type OracleService = {
  state: Map<string, unknown>;
  walletConnection: Awaited<ReturnType<typeof makeAgoricWalletConnection>>;
  watcher: ChainStorageWatcher;
  acceptOracleOffer: () => Promise<void>;
  sendJobReport: (issueUrl: string, jobId: bigint) => Promise<void>;
};

let watcher: ChainStorageWatcher;
let walletConnection: Awaited<ReturnType<typeof makeAgoricWalletConnection>>;
let oracleService: OracleService;

export const makeOracleService = async () => {
  if (oracleService) return oracleService;
  const state = new Map();

  const { rpcUrl, chainName } = await getNetConfig();
  watcher = makeAgoricChainStorageWatcher(rpcUrl, chainName);
  const mnemonic = getEnvVar("WALLET_MNEMONIC");
  walletConnection = await makeAgoricWalletConnection(
    watcher,
    rpcUrl,
    mnemonic
  );

  watcher.watchLatest<Array<[string, unknown]>>(
    ["data" as Kind.Data, "published.agoricNames.instance"],
    (instances) => {
      console.log("got instances", instances);
      state.set(
        "instance",
        instances.find(([name]) => name === "GiMiX")!.at(1)
      );
    }
  );

  const acceptOracleOffer = async () => {
    const instance = state.get("instance");
    console.log("instance", instance);
    if (!instance) throw new Error("cannot find contract instance");
    return walletConnection?.makeOffer(
      {
        source: "purse",
        instance: instance,
        description: "gimix oracle invitation",
      },
      {},
      undefined,
      (update: { status: string; data?: unknown }) => {
        if (update.status === "error") {
          console.log(`Offer error: ${update.data}`);
        }
        if (update.status === "accepted") {
          console.log("Offer accepted");
        }
        if (update.status === "refunded") {
          console.log("Offer rejected");
        }
      }
    );
  };

  const sendJobReport = async (_issueUrl: string, _jobId: bigint) => {
    const instance = state.get("instance");
    console.log("instance", instance);
    if (!instance) throw new Error("cannot find contract instance");
    return walletConnection?.makeOffer(
      {
        // source: "purse",
        instance: instance,
        // description: "gimix oracle invitation",
      },
      {},
      undefined,
      (update: { status: string; data?: unknown }) => {
        if (update.status === "error") {
          console.log(`Offer error: ${update.data}`);
        }
        if (update.status === "accepted") {
          console.log("Offer accepted");
        }
        if (update.status === "refunded") {
          console.log("Offer rejected");
        }
      }
    );
  };

  oracleService = {
    state,
    walletConnection,
    watcher,
    acceptOracleOffer,
    sendJobReport,
  };

  return oracleService;
};

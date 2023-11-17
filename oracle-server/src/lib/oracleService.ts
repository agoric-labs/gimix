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

export type JobReport = {
  deliverDepositAddr: string;
  issueURL: string;
  jobID: bigint;
  prURL: string;
};

export type OracleService = {
  walletConnection: Awaited<ReturnType<typeof makeAgoricWalletConnection>>;
  watcher: ChainStorageWatcher;
  acceptOracleOffer: () => Promise<void>;
  sendJobReport: (jobReport: JobReport) => Promise<void>;
};

let watcher: ChainStorageWatcher;
let walletConnection: Awaited<ReturnType<typeof makeAgoricWalletConnection>>;
let oracleService: OracleService;
let acceptId: string; // keeps track of last acceptId. // todo, persist better
export const makeOracleService = async () => {
  if (oracleService) return oracleService;
  const { rpcUrl, chainName } = await getNetConfig();
  watcher = makeAgoricChainStorageWatcher(rpcUrl, chainName);
  const mnemonic = getEnvVar("WALLET_MNEMONIC");
  walletConnection = await makeAgoricWalletConnection(
    watcher,
    rpcUrl,
    mnemonic
  );

  setTimeout(() => {
    console.log("3s timer done");
    const keysArray = Array.from(watcher.watchedPathsToSubscribers.keys());
    console.log("keys", keysArray);
  }, 3000);

  setTimeout(() => {
    console.log("15s timer done");
    const keysArray = Array.from(watcher.watchedPathsToSubscribers.keys());
    console.log("keys", keysArray);
  }, 15000);

  const instance = watcher
    .queryOnce([Kind.Data, "published.agoricNames.instance"])
    .then((x) => Object.fromEntries(x as [string, unknown][])["GiMiX"])
    .catch(console.error);

  console.log("hi from oracleService");

  const acceptOracleOffer = async () => {
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
          console.log("Offer accepted", update);
          /// XXX TODO, save acceptId
          acceptId = update.data as string;
        }
        if (update.status === "refunded") {
          console.log("Offer rejected", update);
        }
      }
    );
  };

  const sendJobReport = async (jobReport: JobReport) => {
    if (!instance) throw new Error("cannot find contract instance");
    if (!acceptId) throw new Error("cannot found oracle acceptId");
    const { deliverDepositAddr, issueURL, jobID, prURL } = jobReport;
    return walletConnection?.makeOffer(
      {
        source: "continuing",
        previousOffer: acceptId,
        invitationMakerName: "JobReport",
        instance: instance,
        invitationArgs: [deliverDepositAddr, issueURL, jobID, prURL],
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
    walletConnection,
    watcher,
    acceptOracleOffer,
    sendJobReport,
  };

  return oracleService;
};

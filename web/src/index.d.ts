import { NetName } from "./contexts/network";
import { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    keplr: Keplr;
  }

  interface NetworkConfig {
    rpc: string;
    api: string[];
    chainName: string;
    netName: string;
    apiAddrs: string[];
  }

  interface QueryParams {
    network: NetName;
    action: "propose" | "claim";
  }
}

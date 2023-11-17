// @ts-expect-error no types
import { NonNullish } from "@agoric/assert";
import { boardSlottingMarshaller } from "@agoric/vats/tools/board-utils.js";

export { boardSlottingMarshaller };

export const networkConfigUrl = (agoricNetSubdomain: string): string =>
  `https://${agoricNetSubdomain}.agoric.net/network-config`;
export const rpcUrl = (agoricNetSubdomain: string): string =>
  `https://${agoricNetSubdomain}.rpc.agoric.net:443`;

export type MinimalNetworkConfig = {
  rpcAddrs: string[];
  chainName: string;
};

const fromAgoricNet = (str: string): Promise<MinimalNetworkConfig> => {
  const [netName, chainName] = str.split(",");
  if (chainName) {
    return Promise.resolve({ chainName, rpcAddrs: [rpcUrl(netName)] });
  }
  return fetch(networkConfigUrl(netName)).then((res) => res.json());
};

export const getNetworkConfig = async (
  env: typeof process.env
): Promise<MinimalNetworkConfig> => {
  if (!("AGORIC_NET" in env) || env.AGORIC_NET === "local") {
    return { rpcAddrs: ["http://0.0.0.0:26657"], chainName: "agoriclocal" };
  }

  return fromAgoricNet(NonNullish(env.AGORIC_NET)).catch((err) => {
    throw Error(
      `cannot get network config (${env.AGORIC_NET || "local"}): ${err.message}`
    );
  });
};

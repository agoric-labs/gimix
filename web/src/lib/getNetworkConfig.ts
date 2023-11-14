import type { NetName } from "../contexts/network";

const getNetConfigUrl = (netName: NetName) =>
  `https://${netName}.agoric.net/network-config`;

const getNetworkConfig = async (netName: NetName): Promise<NetworkConfig> => {
  const response = await fetch(getNetConfigUrl(netName), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");

  const api = Array.isArray(networkConfig.apiAddrs)
    ? (networkConfig.apiAddrs as string[])
    : ["http://localhost:1317"];

  return {
    rpc: networkConfig.rpcAddrs[0],
    api,
    chainName: networkConfig.chainName,
    netName,
    apiAddrs: networkConfig.apiAddrs,
  };
};

export { getNetworkConfig, getNetConfigUrl };

import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { getNetworkConfig } from "../lib/getNetworkConfig";
import { useSearch } from "wouter/use-location";
import qs from "query-string";
import { toast } from "react-toastify";

const _netNames = [
  "local",
  "devnet",
  "ollinet",
  "xnet",
  "emerynet",
  "main",
] as const;
export type NetName = (typeof _netNames)[number];

interface NetworkContext {
  netName: NetName | undefined;
  netNames: NetName[];
  networkConfig: NetworkConfig | null;
  error: string | null;
  api: string | undefined;
}

export const NetworkContext = createContext<NetworkContext>({
  netName: "local",
  netNames: Array.from(_netNames) as NetName[],
  networkConfig: null,
  error: null,
  api: undefined,
});

const getNameName = (netName: string): NetName | undefined =>
  _netNames.includes(netName as NetName) ? (netName as NetName) : undefined;

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { network } = qs.parse(useSearch());
  const [netName, setNameName] = useState<NetName | undefined>(
    network ? getNameName(network as string) : undefined
  );
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(
    null
  );
  const [error, setError] = useState<NetworkContext["error"]>(null);

  useEffect(() => {
    if (netName) {
      getNetworkConfig(netName)
        .then(setNetworkConfig)
        .catch(() => {
          setNetworkConfig(null);
          setError("Failed to fetch network configuration.");
          toast.error("Failed to fetch network configuration.", {
            position: "bottom-center",
            autoClose: 3000,
          });
        });
    }
  }, [netName]);

  useEffect(() => {
    const newNetName = getNameName(network as string);
    if (newNetName !== netName) {
      if (_netNames.includes(newNetName as NetName)) {
        setNameName(newNetName);
      } else {
        toast.error("Invalid network in URL.", {
          position: "bottom-center",
          autoClose: 3000,
        });
      }
    }
  }, [network, netName]);

  const netNames = useMemo(() => Array.from(_netNames), []);

  const api = useMemo(() => {
    if (netName === "local") return "http://localhost:1317";
    return networkConfig?.apiAddrs?.[0];
  }, [networkConfig, netName]);

  return (
    <NetworkContext.Provider
      value={{
        netName,
        netNames,
        networkConfig,
        api,
        error,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

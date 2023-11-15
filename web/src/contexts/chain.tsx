import { createContext, useEffect, useState, ReactNode, useRef } from "react";
import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import { makeAgoricKeplrConnection } from "@agoric/web-components";
import isEqual from "lodash/isEqual";
import { useNetwork } from "../hooks/useNetwork";
import { useWallet } from "../hooks/useWallet";
import { WalletData } from "../types/ertp";

interface ChainContext {
  brands: Array<unknown>;
  purses: Array<unknown>;
  connection: ReturnType<typeof makeAgoricKeplrConnection> | undefined;
}

export const ChainContext = createContext<ChainContext>({
  brands: [],
  purses: [],
  connection: undefined,
});

export const ChainContextProvider = ({ children }: { children: ReactNode }) => {
  const paths = new Set();
  const stoppers = [];
  const { watcher, networkConfig } = useNetwork();
  const [currChainName, setCurrChainName] = useState<string | undefined>(
    undefined
  );
  const [brands, setBrands] = useState([]);
  const { walletAddress } = useWallet();
  const connection = useRef<unknown | undefined>(undefined);
  const [currWalletAddress, setCurrWalletAddress] = useState<
    string | undefined
  >(undefined);
  const [purses, _setPurses] = useState([]);

  useEffect(() => {
    if (
      networkConfig?.chainName &&
      currChainName !== networkConfig?.chainName
    ) {
      setCurrChainName(networkConfig.chainName);
      setBrands([]);
      setCurrWalletAddress(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConfig]);

  const setWalletConnection = async () => {
    connection.current = await makeAgoricKeplrConnection(watcher);
  };

  useEffect(() => {
    if (connection.current) return;
    if (watcher && !connection.current) {
      setWalletConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher]);

  const watchPath = (
    kind: Kind,
    path: string,
    handler: (args: unknown) => void
  ) => {
    if (!watcher) {
      console.error("watcher not initialized");
      return;
    }
    if (!paths.has(path)) {
      paths.add(path);
      stoppers.push(watcher.watchLatest([kind, path], handler));
    }
  };

  useEffect(() => {
    if (watcher && !brands.length) {
      watchPath(Kind.Data, "published.agoricNames.vbankAsset", (data) => {
        console.log("vbankAsset data", data);
        // @ts-expect-error unknown
        const formatted = data.map(([_, d]) => d);
        if (isEqual(formatted, brands)) return;
        setBrands(formatted);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, brands]);

  useEffect(() => {
    if (watcher && walletAddress && walletAddress !== currWalletAddress) {
      setCurrWalletAddress(walletAddress);
      watchPath(
        Kind.Data,
        `published.wallet.${walletAddress}.current`,
        (data) => {
          const walletData = data as WalletData;
          // const { offerToPublicSubscriberPaths } = data;
          console.log("wallet.current data", walletData);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, walletAddress]);

  return (
    <ChainContext.Provider
      value={{
        brands,
        purses,
        connection,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

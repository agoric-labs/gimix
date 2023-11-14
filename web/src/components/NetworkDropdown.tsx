import { useMemo } from "react";
import { useNetwork } from "../hooks/useNetwork";
import { capitalize } from "../utils/capitalize";
import { updateSearchString } from "../utils/updateSearchString";
import { DropdownMenu } from "../components/DropdownMenu";
import { useSearch } from "wouter/use-location";
import { useWallet } from "../hooks/useWallet";

const placeholderText = "Select Network";

const NetworkDropdown = () => {
  const searchString = useSearch();
  const { netName, netNames } = useNetwork();
  const { isLoading, stargateClient, walletAddress } = useWallet();
  const title = netName ? capitalize(netName) : placeholderText;

  const items = useMemo(
    () =>
      netNames.map((network) => ({
        label: capitalize(network),
        href: updateSearchString({ network }),
      })),
    // incl searchString to regenerate links if query params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [netNames, searchString]
  );

  const status = useMemo(() => {
    if (isLoading) return "loading";
    if (stargateClient) return "active";
    if (!walletAddress || !netName) return "default";
    return "error";
  }, [isLoading, stargateClient, walletAddress, netName]);

  return (
    <DropdownMenu
      title={title}
      label={placeholderText}
      items={items}
      status={status}
    />
  );
};

export { NetworkDropdown };

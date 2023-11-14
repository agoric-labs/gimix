import { useContext } from "react";
import { NetworkContext, NetName } from "../contexts/network";

export type { NetName };
export const useNetwork = () => {
  return useContext(NetworkContext);
};

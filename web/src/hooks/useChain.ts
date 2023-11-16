import { useContext } from "react";
import { ChainContext } from "../contexts/chain";

export const useChain = () => {
  return useContext(ChainContext);
};

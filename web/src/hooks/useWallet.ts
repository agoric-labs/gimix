import { useContext } from "react";
import { WalletContext } from "../contexts/wallet";

export const useWallet = () => {
  return useContext(WalletContext);
};

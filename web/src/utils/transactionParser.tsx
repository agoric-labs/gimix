import { NetName } from "../contexts/network";

const blockExplorerUrls: Record<NetName, string | null> = {
  local: null,
  devnet: "https://devnet.explorer.agoric.net/agoric",
  emerynet: "https://emerynet.explorer.agoric.net/agoric",
  xnet: "https://xnet.explorer.agoric.net/agoric",
  ollinet: "https://ollinet.explorer.agoric.net/agoric",
  main: "https://ping.pub/agoric",
};

export const getTxUrl = (netName: NetName, txHash: string) => {
  if (!blockExplorerUrls[netName]) return null;
  return `${blockExplorerUrls[netName]}/tx/${txHash}`;
};

export function parseError(error: Error) {
  if (error.message.includes("does not exist on chain")) {
    // @todo, prompt provisionWallet
    return "Account does not exist. Please provision smart wallet.";
  }
  if (error.message.includes("insufficient funds")) {
    const match = error.message.match(
      /(\d+)(uist|ubld) is smaller than (\d+)(uist|ubld)/
    );
    if (match) {
      const available = BigInt(match[1]) / BigInt(1e6);
      const required = BigInt(match[3]) / BigInt(1e6);
      const currency = match[2].slice(1).toUpperCase();
      return `Insufficient funds. ${required} ${currency} required, only ${available} ${currency} available.`;
    }
  }
  if (error.message.includes("Query failed with")) {
    const match = error.message.match(/desc = ([^:]+):/);
    if (match) {
      const message = match[1].trim();
      return message.charAt(0).toUpperCase() + message.slice(1);
    }
  }
  return error.message;
}

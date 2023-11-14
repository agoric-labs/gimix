import type { Coin } from "../types/bank";

export const Unit6 = 1_000_000;

export const renderCoin = ({ denom, amount }: Coin) => {
  if (denom.startsWith("u")) {
    const bigd = denom.slice(1).toUpperCase();
    const amt = Number(amount) / Unit6;
    return `${amt} ${bigd}`;
  }
  return `${amount} ${denom}`;
};

export const renderCoins = (coins: Coin[]) =>
  coins.length > 0 ? coins.map(renderCoin).join(",") : "empty";

export const coinsUnit = (coins: Coin[] | undefined) =>
  coins && coins.length === 1 ? Number(coins[0].amount) / Unit6 : NaN;

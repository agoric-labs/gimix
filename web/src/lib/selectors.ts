import type { UseQueryResult } from "@tanstack/react-query";
import type { BankBalances } from "../types/bank";

export const selectBldCoins = (
  query: UseQueryResult<BankBalances, unknown>
) => {
  if (!query?.data) return undefined;
  return (query.data as BankBalances).filter((x) => x.denom === "ubld");
};

export const selectIstCoins = (
  query: UseQueryResult<BankBalances, unknown>
) => {
  if (!query?.data) return undefined;
  return (query.data as BankBalances).filter((x) => x.denom === "uist");
};

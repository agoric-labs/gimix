import type { UseQueryOptions } from "@tanstack/react-query";
import type { BankBalanceResponse, BankBalances } from "../types/bank";

export const accountBalancesQuery = (
  api: string | undefined,
  address: string | null
): UseQueryOptions<BankBalances, unknown> => ({
  queryKey: ["accountBalances", api, address],
  queryFn: async (): Promise<BankBalances> => {
    // same as `/cosmos/bank/v1beta1/balances/${addr}` ?
    const res = await fetch(`${api}/bank/balances/${address}`);
    const data: BankBalanceResponse = await res.json();
    return data?.result;
  },
  enabled: !!api && !!address,
});

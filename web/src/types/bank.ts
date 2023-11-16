export type Coin = {
  denom: "ubld" | "uist" | string;
  amount: string;
};

export type BankBalances = Coin[];

export type BankBalanceResponse = {
  pagination: {
    next_key: string | undefined;
    total: string;
  };
  balances: BankBalances;
};

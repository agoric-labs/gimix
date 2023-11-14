export type Coin = {
  denom: "ubld" | "uist" | string;
  amount: string;
};

export type BankBalances = Coin[];

export type BankBalanceResponse = {
  height: string;
  result: BankBalances;
};

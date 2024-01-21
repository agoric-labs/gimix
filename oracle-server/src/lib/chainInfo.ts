import { Decimal } from "@cosmjs/math";
import { stringToPath } from "@cosmjs/crypto";

/** @typedef {import('@keplr-wallet/types').Bech32Config} Bech32Config */
/** @typedef {import('@keplr-wallet/types').FeeCurrency} FeeCurrency */

/** @type {FeeCurrency} */
export const stakeCurrency = {
  coinDenom: "BLD",
  coinMinimalDenom: "ubld",
  coinDecimals: 6,
  coinGeckoId: undefined,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0,
  },
};

/** @type {FeeCurrency} */
export const stableCurrency = {
  coinDenom: "IST",
  coinMinimalDenom: "uist",
  coinDecimals: 6,
  coinGeckoId: undefined,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0,
  },
};

/** @type {Bech32Config} */
export const bech32Config = {
  bech32PrefixAccAddr: "agoric",
  bech32PrefixAccPub: "agoricpub",
  bech32PrefixValAddr: "agoricvaloper",
  bech32PrefixValPub: "agoricvaloperpub",
  bech32PrefixConsAddr: "agoricvalcons",
  bech32PrefixConsPub: "agoricvalconspub",
};

export const Agoric = {
  Bech32MainPrefix: "agoric",
  CoinType: 564,
  proto: {
    swingset: {
      MsgWalletSpendAction: {
        typeUrl: "/agoric.swingset.MsgWalletSpendAction",
      },
    },
  },
  fee: { amount: [], gas: "50000000" }, // arbitrary fee...
  gasPrice: { denom: "uist", amount: Decimal.fromUserInput("50000000", 0) },
};

export const hdPath = (coinType = 118, account = 0) =>
  stringToPath(`m/44'/${coinType}'/${account}'/0/0`);

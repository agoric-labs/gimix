export type Purse = {
  balance: {
    brand: unknown; // 'Alleged: Zoe Invitation brand {}'
    value: unknown[];
  };
};

export type WalletData = {
  purses: Purse[];
  liveOffers: unknown;
  offerToPublicSubscriberPaths: unknown[];
  offerToUsedInvitation: unknown[];
};

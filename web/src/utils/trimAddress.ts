/** formats wallet address for display purposes */
export const trimAddress = (address: string, endLength: number = 6): string => {
  if (typeof address !== "string" || !address.startsWith("agoric1")) {
    throw new Error("Invalid Agoric address format");
  }
  const prefix = address.substring(0, 7);
  const suffix = address.substring(address.length - endLength);
  return `${prefix}...${suffix}`;
};

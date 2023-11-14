// import { CoreEvalProposal } from "@agoric/cosmic-proto/swingset/swingset.js";
// import { MsgInstallBundle } from "@agoric/cosmic-proto/swingset/msgs.js";
import { StdFee } from "@cosmjs/amino";
// import { fromBech32 } from "@cosmjs/encoding";
import { coins, Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { Any } from "cosmjs-types/google/protobuf/any";

export const registry = new Registry([
  ...defaultRegistryTypes,
  // ["/agoric.swingset.MsgInstallBundle", MsgInstallBundle],
]);

interface MakeTextProposalArgs {
  title: string;
  description: string;
  proposer: string;
  deposit?: string | number;
}

// XXXX makeWalletSpendAction
export const makeTextProposalMsg = ({
  title,
  description,
  proposer,
  deposit,
}: MakeTextProposalArgs) => ({
  typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
  value: {
    content: Any.fromPartial({
      typeUrl: "/cosmos.gov.v1beta1.TextProposal",
      value: Uint8Array.from(
        TextProposal.encode(
          TextProposal.fromPartial({
            title,
            description,
          })
        ).finish()
      ),
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  },
});

interface MakeFeeObjectArgs {
  denom?: string;
  amount?: string | number;
  gas?: string | number;
}

export const makeFeeObject = ({ denom, amount, gas }: MakeFeeObjectArgs) =>
  ({
    amount: coins(amount || 0, denom || "uist"),
    gas: gas ? String(gas) : "auto",
  } as StdFee);

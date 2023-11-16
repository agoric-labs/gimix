import { useRef, FormEvent, ReactNode, useMemo } from "react";
import { makeCopyBag } from "@endo/patterns";
import { AmountMath } from "@agoric/ertp";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "react-toastify";
import { useChain } from "../hooks/useChain";
import { Button } from "./Button";
import { TxToastMessage } from "./TxToastMessage";
import { useNetwork, NetName } from "../hooks/useNetwork";
import { accountBalancesQuery } from "../lib/queries";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
import { selectIstCoins } from "../lib/selectors";
import { renderCoins } from "../utils/coin";

interface ProposeBountyFormProps {
  title: ReactNode;
  description: ReactNode;
}

const ProposeBountyForm = ({ title, description }: ProposeBountyFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { brands, connection, instance } = useChain();
  const { api, netName } = useNetwork();
  const { walletAddress } = useWallet();

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));
  const istCoins = useMemo(
    () => selectIstCoins(accountBalances),
    [accountBalances]
  );

  const makeProposal = ({
    issueUrl,
    amount,
    deadlineDate,
  }: {
    issueUrl: string;
    amount: number;
    deadlineDate: string; // datestring
  }) => {
    if (!brands) throw new Error("Unable to fetch brands.");
    if (!connection) throw new Error("Not connected to signer.");
    if (!instance) throw new Error("Contract instance not found.");
    const adjAmount = BigInt(amount) * 10n ** 6n;
    if (adjAmount <= 0n) {
      toast.error("Offer amount must be greater than 0", { autoClose: 3000 });
      throw new Error("Offer amount must be greater than 0");
    }
    const proposedTime = new Date(deadlineDate).getTime();
    if (new Date().getTime() > proposedTime) {
      toast.error("Deadline must be a date in the future.", {
        autoClose: 3000,
      });
      throw new Error("Deadline must be a date in the future.");
    }
    const deadline = proposedTime / 1000;

    const toastId = createId();
    toast.loading("Broadcasting transaction...", {
      toastId,
    });
    connection.makeOffer(
      {
        source: "contract",
        instance: instance,
        publicInvitationMaker: "makeWorkAgreementInvitation",
      },
      {
        give: {
          Acceptance: AmountMath.make(brands.IST, adjAmount),
        },
        want: {
          Stamp: AmountMath.make(
            brands.GimixOracle,
            makeCopyBag([[`Fixed ${issueUrl}`, 1n]])
          ),
        },
        exit: { afterDeadline: { deadline, timer: brands.timer } },
      },
      undefined,
      (update: { status: string; data?: unknown }) => {
        console.info("offer update", update.status, update.data);
        if (update.status === "seated") {
          // @ts-expect-error any
          const { offerId, txn } = update.data;
          if (txn.code === 0) {
            toast.update(toastId, {
              render: ({ closeToast }) => (
                <TxToastMessage
                  transactionHash={txn.transactionHash}
                  offerId={offerId}
                  netName={netName as NetName}
                  closeToast={closeToast as () => void}
                />
              ),
              type: "success",
              isLoading: false,
            });
            formRef.current?.reset();
            accountBalances.refetch();
          }
        }

        if (update.status === "error") {
          console.error(update);
          let message =
            "Error submitting transaction. See developer console for details.";
          // @ts-expect-error any
          if (update?.data?.message === "Request rejected") {
            message = "Transaction cancelled.";
          }
          toast.update(toastId, {
            render: message,
            type: "error",
            isLoading: false,
            autoClose: 10000,
          });
        }
        // if (update.status === "accepted") {}
        // if (update.status === "refunded") {}
      }
    );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) throw new Error("No form data");
    const formData = new FormData(formRef.current);
    const issue = (formData.get("issue") as string) || "";
    const amount = (formData.get("amount") as string) || "";
    const deadline = (formData.get("deadline") as string) || "";
    makeProposal({
      issueUrl: issue,
      amount: Number(amount),
      deadlineDate: deadline,
    });
  };

  return (
    <form ref={formRef} className="py-6 px-8" onSubmit={onSubmit}>
      <div className="space-y-12 sm:space-y-16">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {title}
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="issue"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Issue Url
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="text"
                  name="issue"
                  id="issue"
                  placeholder=""
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-lg sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  Provide a GitHub Issue URL.
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="amount"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Amount
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="1"
                  // placeholder="0"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  Provide an amount you would like to award for this bounty.
                </p>
                <p className="mt-1 text-xs leading-6 text-gray-600">
                  <span>
                    Current balance:{" "}
                    <span className="font-semibold">
                      {istCoins ? renderCoins(istCoins) : "Unavailable"}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="deadline"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Deadline
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="datetime-local"
                  name="deadline"
                  id="deadline"
                  // placeholder="0"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  Select a date for when this bounty will expire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          type="submit"
          Icon={null}
          text="Create Bounty"
          theme="dark"
          layoutStyle="flex w-1/4"
        />
      </div>
    </form>
  );
};

export { ProposeBountyForm };

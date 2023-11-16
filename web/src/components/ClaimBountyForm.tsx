import { useRef, FormEvent, ReactNode } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./Button";
import { useWallet } from "../hooks/useWallet";
import {
  ClaimBountyInput,
  ClaimBountyOutput,
  claimBounty,
} from "../lib/mutations";

interface ClaimBountyFormProps {
  title: ReactNode;
  description: ReactNode;
}

const ClaimBountyForm = ({ title, description }: ClaimBountyFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const walletInputRef = useRef<HTMLInputElement>(null);
  const { walletAddress } = useWallet();

  const mutation = useMutation<ClaimBountyOutput, Error, ClaimBountyInput>({
    mutationFn: claimBounty,
    onSuccess: (data) => {
      // Handle success
      console.log("success", data);
      toast.success("Bounty claimed successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) throw new Error("No form data");
    const formData = new FormData(formRef.current);
    const prUrl = (formData.get("prUrl") as string) || "";
    const jobId = (formData.get("jobId") as string) || "";
    const walletAddress = (formData.get("walletAddress") as string) || "";
    console.log("onSubmit", { prUrl, jobId, walletAddress });
    mutation.mutate({ prUrl, jobId, walletAddress });
  };

  const handlePopulateAddress = () => {
    if (!walletAddress) {
      toast.info("Please connect wallet first!", { autoClose: 3000 });
      return;
    }
    if (!walletInputRef.current) throw new Error("Form input not found");
    walletInputRef.current.value = walletAddress;
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
                htmlFor="prUrl"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Pull Request Url
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="text"
                  name="prUrl"
                  id="prUrl"
                  placeholder=""
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  An approved pull request that closes an issue with a bounty.
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="jobId"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Job ID
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="text"
                  name="jobId"
                  id="jobId"
                  placeholder=""
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  The jobId associated with a particular GitHub issue.
                </p>
              </div>
            </div>

            {/* to do: only prompt for address when the user has a DeliverInvitation */}
            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="walletAddress"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Wallet Address
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  ref={walletInputRef}
                  type="text"
                  name="walletAddress"
                  id="walletAddress"
                  // placeholder="0"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  The wallet address where funds will be disbursed.
                </p>
              </div>
              <div className="mt-2 sm:col-span-1 sm:mt-0 -ml-10 sm:-ml-20">
                <button
                  className="text-xs bg-wild-sand-100 hover:bg-wild-sand-200 items-center justify-center rounded-md px-2 py-2 ml-4 my-auto mt-1"
                  type="button"
                  onClick={handlePopulateAddress}
                >
                  Populate with Keplr
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          type="submit"
          Icon={null}
          text="Request Claim Invitation"
          theme="dark"
          layoutStyle="flex w-1/4"
        />
      </div>
    </form>
  );
};

export { ClaimBountyForm };

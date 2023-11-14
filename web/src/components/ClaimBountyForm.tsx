import { useRef, FormEvent, ReactNode } from "react";
import { toast } from "react-toastify";
import { Button } from "./Button";
import { useWallet } from "../hooks/useWallet";

interface ClaimBountyFormProps {
  title: ReactNode;
  description: ReactNode;
}

const ClaimBountyForm = ({ title, description }: ClaimBountyFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const walletInputRef = useRef<HTMLInputElement>(null);
  const { walletAddress } = useWallet();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) throw new Error("No form data");
    const formData = new FormData(formRef.current);
    const pullRequest = (formData.get("pullRequest") as string) || "";
    const amount = (formData.get("amount") as string) || "";
    console.log("onSubmit", { pullRequest, amount });
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
                htmlFor="pullRequest"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Pull Request Url
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="text"
                  name="pullRequest"
                  id="pullRequest"
                  placeholder=""
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="walletAddress"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Wallet Address
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <div className="flex flex-row">
                  <input
                    ref={walletInputRef}
                    type="string"
                    name="walletAddress"
                    id="walletAddress"
                    // placeholder="0"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
                  />
                  <button
                    className="text-xs bg-wild-sand-100 hover:bg-wild-sand-200 items-center justify-center rounded-md px-2 py-2 ml-4"
                    onClick={handlePopulateAddress}
                  >
                    Populate with Keplr
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          type="submit"
          Icon={null}
          text="Claim Bounty"
          theme="dark"
          layoutStyle="flex w-1/4"
        />
      </div>
    </form>
  );
};

export { ClaimBountyForm };

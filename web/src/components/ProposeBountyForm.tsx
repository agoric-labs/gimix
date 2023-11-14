import { useRef, FormEvent, ReactNode } from "react";
import { Button } from "./Button";

interface ProposeBountyFormProps {
  title: ReactNode;
  description: ReactNode;
}

const ProposeBountyForm = ({ title, description }: ProposeBountyFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) throw new Error("No form data");
    const formData = new FormData(formRef.current);
    const issue = (formData.get("issue") as string) || "";
    const amount = (formData.get("amount") as string) || "";
    console.log("onSubmit", { issue, amount });
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
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
                  // placeholder="0"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
                <p className="mt-3 text-xs leading-6 text-gray-600">
                  Provide an amount you would like to award for this bounty.
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:max-w-sm sm:text-sm sm:leading-6"
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

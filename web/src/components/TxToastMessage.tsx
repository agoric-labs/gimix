import { toast } from "react-toastify";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { NetName } from "../contexts/network";
import { getTxUrl } from "../utils/transactionParser";

const CopyToClipBoard = ({ label, text }: { label: string; text: string }) => (
  <span
    className="text-sm text-blue-500 hover:text-blue-700 underline cursor-pointer"
    onClick={async () => {
      await window.navigator.clipboard.writeText(text);
      toast.info("Copied to clipboard!", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    }}
  >
    {label} <ClipboardDocumentIcon className="inline-block w-4 h-4" />
  </span>
);

export function TxToastMessage({
  offerId,
  transactionHash,
  netName,
  closeToast = () => {},
}: {
  offerId: string;
  transactionHash: string;
  netName: NetName;
  closeToast: () => void;
}) {
  const txUrl = getTxUrl(netName, transactionHash);
  const txString = txUrl ? (
    <a
      className="text-sm text-blue-500 hover:text-blue-700 underline"
      target="_blank"
      rel="noopener noreferrer"
      href={txUrl}
    >
      View Transaction{" "}
      <ArrowTopRightOnSquareIcon className="inline-block w-4 h-4" />
    </a>
  ) : (
    <CopyToClipBoard label="Tx Hash" text={transactionHash} />
  );
  return (
    <div className="flex items-start pointer-events-auto">
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-gray-900">Offer Submitted!</p>
        <span className="mt-3 text-sm text-gray-500">
          {txString}
          <span className="ml-2">
            <CopyToClipBoard label="Offer ID" text={offerId} />
          </span>
        </span>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          onClick={closeToast}
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

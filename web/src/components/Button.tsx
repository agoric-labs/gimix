import { ReactNode } from "react";
import { WalletIcon } from "@heroicons/react/20/solid";
import { classNames } from "../utils/classNames";

export interface ButtonProps {
  onClick?: () => void;
  Icon?: ReactNode;
  text: string;
  theme: "light" | "dark" | "white";
  layoutStyle?: string;
  type?: HTMLButtonElement["type"];
}

const butttonThemeStyles = {
  dark: "text-white bg-emerald-600 focus-visible:outline-emerald-600 hover:opacity-80",
  light:
    "text-black bg-emerald-200 focus-visible:outline-emerald-200 hover:bg-emerald-300",
  white:
    "text-gray-900 bg-white ring-1 ring-inset ring-gray-300 focus-visible:outline-gray-300 hover:bg-gray-50",
};

const Button = ({
  onClick,
  text,
  Icon,
  theme,
  layoutStyle,
  type = "button",
}: ButtonProps): ReactNode => (
  <button
    type={type}
    className={classNames(
      "items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      butttonThemeStyles[theme],
      layoutStyle || "inline-flex w-48"
    )}
    onClick={onClick}
  >
    {Icon}
    {text}
  </button>
);

Button.defaultProps = {
  Icon: <WalletIcon className="mr-1.5 h-5 w-8" aria-hidden="true" />,
  theme: "white",
};

export { Button };

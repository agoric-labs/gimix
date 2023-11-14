import { useWallet } from "../hooks/useWallet";
import { Button, ButtonProps } from "../components/Button";
import { trimAddress } from "../utils/trimAddress";

const WalletConnectButton = ({ theme }: { theme: ButtonProps["theme"] }) => {
  const { connectWallet, walletAddress } = useWallet();

  const connectHandler = () => {
    connectWallet()
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log("connect wallet finished"));
  };

  return (
    <Button
      onClick={connectHandler}
      text={walletAddress ? trimAddress(walletAddress) : "Connect Wallet"}
      theme={theme}
    />
  );
};

export { WalletConnectButton };

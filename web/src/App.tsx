import { ToastContainer } from "react-toastify";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { NetworkDropdown } from "./components/NetworkDropdown";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { Tabs } from "./components/Tabs";
import { GitHubLoginButton } from "./components/GitHubLoginButton";
import { ProposeBountyForm } from "./components/ProposeBountyForm";
import { ClaimBountyForm } from "./components/ClaimBountyForm";
// import { useNetwork } from "./hooks/useNetwork";
// import { useWallet } from "./hooks/useWallet";

const App = () => {
  // const { netName } = useNetwork();
  // const { walletAddress, stargateClient } = useWallet();

  return (
    <div className="flex flex-col min-h-screen">
      <Nav
        title="GiMiX"
        showLogo={false}
        rightContent={
          <>
            <div className="mr-6 relative">
              <NetworkDropdown />
            </div>
            <div className="mr-6 relative">
              <GitHubLoginButton />
            </div>
            <WalletConnectButton theme="white" />
          </>
        }
      />
      <main className="flex-grow mx-auto max-w-7xl min-w-full py-6 sm:px-6 lg:px-8">
        <Tabs
          tabs={[
            {
              title: "Propose Bounty",
              action: "propose",
              content: (
                <div className="flex flex-col mb-6 mt-4">
                  <ProposeBountyForm
                    title="Propose Bounty"
                    description="Attach a bounty or reward to a GitHub Issue. When a Pull Request that marks the issue closed is approved and merged, the bounty will be released to the PR author."
                  />
                </div>
              ),
            },
            {
              title: "Claim Bounty",
              action: "claim",
              content: (
                <div className="flex flex-col mb-6 mt-4">
                  <ClaimBountyForm
                    title="Claim Bounty"
                    description="If you submitted a pull request that closes an issue with a bounty attached to it, use this form to claim the bounty and provide a wallet address for payment."
                  />
                </div>
              ),
            },
          ]}
        />
      </main>
      <Footer />
      <ToastContainer
        autoClose={false}
        position="bottom-right"
        closeOnClick={false}
        closeButton={true}
        bodyClassName="text-sm font-medium text-gray-900"
      />
    </div>
  );
};

export default App;

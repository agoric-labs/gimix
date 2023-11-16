import { LOCAl_STORAGE_KEY } from "../components/GitHubLoginButton";

export interface ClaimBountyInput {
  prUrl: string;
  jobId: string;
  walletAddress: string;
}

export interface ClaimBountyOutput {
  ok: boolean;
  jobId?: string; // Include other fields that your API might return
}

export async function claimBounty({
  prUrl,
  jobId,
  walletAddress,
}: ClaimBountyInput): Promise<ClaimBountyOutput> {
  const accessToken = window.localStorage.getItem(LOCAl_STORAGE_KEY);
  if (!accessToken) throw new Error("GitHub access token not found.");
  if (!prUrl) throw new Error("Pull Request Url not provided.");
  if (!jobId) throw new Error("Job ID not provided.");
  if (!walletAddress) throw new Error("Wallet Address not provided.");

  const response = await fetch("/api/job/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prUrl, jobId, walletAddress }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Network response was not ok");
  }

  return response.json();
}

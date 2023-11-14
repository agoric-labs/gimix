## Server Responsibilities

- Accept invitation to `makeJobReportInvitation` invitationMaker

- Report back on a Pull Request's state, as it related to a specific jobId. 
  - Is it "approved"
  - Is it "merged"
  - Is it associated with issue X, and is issue X closed?

 
 ## Bot Responsibilities

 - Post status updates (tbd) on the GitHub issue.



## Bob the Bounty Hunter

1. Bob Logs in with GitHub
2. Bob Selects a PR from a dropdown
3. Bob connects Keplr to prefill his address
4. Web App sends PR URL + ~~wallet address~~ + bob's GH access token to the server
5. Server does checks:
  1. Access Token Owner = PR Author
  2. PR is associated with a particular issue, does this issue have an active bounty?
  3. If yes, and the PR is approved and merged:
    1. call makeJobReportInvitation, report this good news to the contract
      -> contract sends invitation to Bob. web-app listens for new invitations to continue the flow
6. Bob Submits the invitation with his walletAddress, and prUrl (record keeping only?)

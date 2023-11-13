## Server Responsibilities

- Accept invitation to `makeJobReportInvitation` invitationMaker

- Report back on an Issue's state.
  - Is the issue assigned, who is the assignee
  - * Retrieve the assignee's wallet address (from a GH gist) *
  - Send `DeliveryInvitation` to assignee's deposit facet (wallet address)

- Report back on a Pull Request's state. 
  - Is it "approved"
  - Is it "merged"
  - Is it associated with issue X, and is issue X closed?

 
 ## Bot Responsibilities

 - Post status updates (tbd) on the GitHub issue.

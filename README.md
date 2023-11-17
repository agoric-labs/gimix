# GiMiX - AMiX with GitHub (Prototype)

GiMiX is an Agoric dapp to make a market for completing GitHub issues.

 1. Requestor proposes a bounty by choosing an issue and
    putting the bounty assets in escrow for a period of time.
 2. Responder negotiates an assignment to the issue,
    opens a PR for the work, and negotiates to close
    the issue with the PR.
 3. Responder signs a claim that a PR closes the issue
    while logged in with GitHub credentials.
 4. An oracle server verifies the responder's GitHub credentials
    and that the PR belongs to the responder and
    closes the issue. It then invites the responder to
    claim the bounty.
 5. The responder claims the bounty.
 6. The requestor receives a "stamp" NFT from the oracle,
    attesting to the completion of the issue.

## Getting Started

_TODO: explain credentials needed by the server._

```bash
# start oracle server
yarn dev:server

# start web server (and, proxy to oracle server via /api)
yarn dev:web
```

[README-local-chain](./README-local-chain.md) has details
about starting a testing environment and deploying the contract.

## Background: AMIX: The American Information Exchange

> The American Information Exchange (AMIX) was a platform for the buying and selling of information, goods and services as well as the exchange of information, ideas, and certain kinds of intellectual work product, created ... in the 1980s ... -- [Wikipedia](https://en.wikipedia.org/wiki/American_Information_Exchange)

See also:

 - [What Agoric Learned from the American Information Exchange About Online Markets](https://agoric.com/blog/technology/what-agoric-learned-from-amix)
 - [AMIX: The American Information Exchange](http://erights.org/smart-contracts/history/index.html) on erights

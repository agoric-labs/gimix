# Agoric Local Chain with docker-compose

To start a local agoric blockchain:

```sh
docker-compose up -d
```

Then use `docker-compose logs` etc. as usual.

Some useful recipies are included in `Makefile`.
Use `yarn make:help` to list them.
For example: `yarn docker:make mint4k`.

See also https://github.com/agoric-labs/dapp-game-places

### Deploying the contract

Get the bundle, script, and permit from a release.

Use the [Agoric Gov Proposal Builder](https://cosgov.org/)
for deployment:

1. Use the [Install Bundle](https://cosgov.org/?msgType=installBundle&network=local) tab to install the bundle.
   It will likely say **insufficient balance**.
   To get enough IST:

```sh
yarn docker:make mint4k
```

2. Get ready to vote. To query the status of proposals, use

```sh
yarn docker:make gov-q
```

Then, don't execute this command, but get it ready:

```sh
yarn docker:make vote PROPOSAL=N
```

2. Use the [CoreEval Proposal](https://cosgov.org/?msgType=coreEvalProposal&network=local) tab to make a proposal to
   start the contract using the permit and script.
   Note the **10 second voting period**,
   When you **Sign & Submit** the proposal, you can replace `N`
   above with the proposal number that pops up.

   To verify that the proposal executed correctly:

```sh
docker-compose logs | less -R
```



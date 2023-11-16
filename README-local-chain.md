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

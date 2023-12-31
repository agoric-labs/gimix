/**
 * @file core eval script* to start the GIMiX contract.
 *
 * * to turn this module into a script:
 *   - remove `XMPORT` declarations entirely
 *   - remove `export` keyword from declarations
 *
 * The `permit` export specifies the corresponding permit.
 */
// @ts-check
// REDACTED: { E, Far } from '@endo/far';

const trace = (...args) => console.log("start-gimix", ...args);

const fail = (msg) => {
  throw Error(msg);
};

/**
 * ref https://github.com/Agoric/agoric-sdk/issues/8408#issuecomment-1741445458
 *
 * @param {ERef<XMPORT('@agoric/vats').NameAdmin>} namesByAddressAdmin
 * @param namesByAddressAdminP
 */
const fixHub = async (namesByAddressAdmin) => {
  /** @type {XMPORT('@agoric/vats').NameHub} */
  // @ts-expect-error mock. no has, keys, ...
  const hub = Far("Hub work-around", {
    lookup: async (addr, key, ...rest) => {
      if (!(addr && key && rest.length === 0)) {
        throw Error("unsupported");
      }
      await E(namesByAddressAdmin).reserve(addr);
      const addressAdmin = await E(namesByAddressAdmin).lookupAdmin(addr);
      assert(addressAdmin, "no admin???");
      await E(addressAdmin).reserve(key);
      const addressHub = E(addressAdmin).readonly();
      return E(addressHub).lookup(key);
    },
  });
  return hub;
};

/**
 * @param {BootstrapPowers} powers
 * @param {{ options?: { GiMiX: {
 *   bundleID: string;
 *   oracleAddress: string;
 * }}}} config
 */
const startGiMiX = async (powers, config = {}) => {
  const {
    consume: {
      agoricNames,
      board,
      chainTimerService,
      namesByAddressAdmin,
      zoe,
    },
    instance: {
      // @ts-expect-error going beyond WellKnownName
      produce: { GiMiX: produceInstance },
    },
    issuer: {
      // @ts-expect-error going beyond WellKnownName
      produce: { GimixOracle: produceIssuer },
    },
    brand: {
      // @ts-expect-error going beyond WellKnownName
      produce: { GimixOracle: produceBrand },
    },
  } = powers;
  const {
    bundleID = "b1-5e14e11f4226eae91223c295157fdbe36e403a909b6f138fb48f13f74b2a93d47de4b234bb2383f8dada3adddb86f312e7f971704473a6a85f7178845ccc0232",
    oracleAddress = "agoric1xfa2mphrt6292w5vxvnmjt47tfr7sqp5nd0lcj",
  } = config.options?.GiMiX ?? {};

  const timerId = await E(board).getId(await chainTimerService);
  trace("timer", timerId);

  /** @type {Installation<XMPORT('./gimix').prepare>} */
  const installation = await E(zoe).installBundleID(bundleID);

  const namesByAddress = await fixHub(namesByAddressAdmin);

  const { creatorFacet, instance: gimixInstance } = await E(zoe).startInstance(
    installation,
    { Stable: await E(agoricNames).lookup("issuer", "IST") },
    { namesByAddress, timer: await chainTimerService }
  );
  const { brands, issuers } = await E(zoe).getTerms(gimixInstance);

  const oracleInvitation = await E(creatorFacet).makeOracleInvitation();
  const oracleDepositFacet = await E(namesByAddress).lookup(
    oracleAddress,
    "depositFacet"
  );
  await E(oracleDepositFacet).receive(oracleInvitation);

  produceInstance.resolve(gimixInstance);
  produceIssuer.resolve(issuers.GimixOracle);
  produceBrand.resolve(brands.GimixOracle);

  trace("gimix started!");
};
const manifest = /** @type {const} */ ({
  [startGiMiX.name]: {
    consume: {
      agoricNames: true,
      board: true,
      chainTimerService: true,
      namesByAddress: true,
      namesByAddressAdmin: true,
      zoe: true,
    },
    instance: {
      produce: { GiMiX: true },
    },
    issuer: {
      produce: { GimixOracle: true },
    },
    brand: {
      produce: { GimixOracle: true },
    },
  },
});
const permit = JSON.stringify(Object.values(manifest)[0]);

// script completion value
startGiMiX;

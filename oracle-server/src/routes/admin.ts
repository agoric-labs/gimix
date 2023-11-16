import type { FastifyPluginCallback } from "fastify";
import { makeAgoricSigner, acceptOracleInvitation } from "../lib/stargate.js";
import { getEnvVar } from "../utils/getEnvVar.js";
// @ts-expect-error no types
import { getNetworkConfig } from "../lib/agoric-cli-rpc.js";

export const admin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/admin/accept", async (_, reply) => {
    // TODO: add auth / password
    const networkConfig = await getNetworkConfig(process.env);
    const rpcUrl = networkConfig.rpcAddrs[0];
    const mnemonic = getEnvVar("WALLET_MNEMONIC");
    const { address, signingClient } = await makeAgoricSigner({
      mnemonic,
      rpcUrl,
    });
    console.log("address", address);
    let tx;
    try {
      tx = await acceptOracleInvitation({
        signingClient,
        address,
        offerId: `acceptGiMiX-${new Date().getTime()}`,
      });
    } catch (e) {
      console.error(e);
      return reply.status(500).send("Error broadcasting message");
    }
    if (tx) {
      return reply.status(200).send({ ok: true });
    } else {
      // unreachable
      return reply.status(500).send("Server error.");
    }
  });
  done();
};

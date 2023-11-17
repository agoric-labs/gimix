import type { FastifyPluginCallback } from "fastify";
import {
  acceptOracleInvitation,
  makeOracleSigningClient,
} from "../lib/stargate.js";

export const admin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/admin/accept", async (_, reply) => {
    // TODO: add auth / password protect the route
    const { signingClient, address } = await makeOracleSigningClient();
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

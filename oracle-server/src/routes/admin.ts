import type { FastifyPluginCallback } from "fastify";

export const admin: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/admin/accept", async (_, reply) => {
    // TODO: add auth / password protect the route
    const { acceptOracleOffer } = fastify.oracleService;

    try {
      await acceptOracleOffer();
    } catch (e) {
      console.error(e);
      return reply.status(500).send("Error broadcasting message");
    }
    return reply.status(200).send({ ok: true });
  });
  done();
};

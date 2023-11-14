import type { FastifyPluginCallback } from "fastify";

export const health: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/health-check", async (_, reply) => {
    reply.status(200).send({ ok: true });
  });
  done();
};

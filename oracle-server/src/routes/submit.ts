import type { FastifyPluginCallback } from "fastify";

export const health: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post("/submit-pr", async (_req, _reply) => {
    // XXXX
    // 1. req: { accesToken, prUrl, [jobId], [issueUrl] }
    // 2. check that accessToken == prUrl author
    // 3. check prUrl closes issueUrl
    // 4. check prUrl approved
    // 5. ... ?
    // reply.status(200).send({ ok: true });
  });
  done();
};

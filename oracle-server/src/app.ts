import "./installSesLockdown.js";
import dotenv from "dotenv";
import fastify from "fastify";
import type { FastifyServerOptions } from "fastify";
import { githubOAuthPlugin } from "./plugins/github.js";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { job } from "./routes/job.js";
import { admin } from "./routes/admin.js";
import { makeOracleService, OracleService } from "./lib/oracleService.js";

dotenv.config();
declare module "fastify" {
  interface FastifyInstance {
    oracleService: OracleService;
  }
}

export const makeApp = async (opts: FastifyServerOptions = {}) => {
  const app = fastify(opts);

  app.register(githubOAuthPlugin);

  const oracleService = await makeOracleService();
  app.decorate("oracleService", oracleService);

  app.register(health);
  app.register(auth);
  app.register(job);
  // not secure, testing only!
  app.register(admin);

  return app;
};

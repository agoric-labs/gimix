import "./installSesLockdown.js";
import dotenv from "dotenv";
import fastify from "fastify";
import type { FastifyServerOptions } from "fastify";
import { githubOAuthPlugin } from "./plugins/github.js";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";

dotenv.config();

export const makeApp = (opts: FastifyServerOptions = {}) => {
  const app = fastify(opts);

  app.register(githubOAuthPlugin);

  app.register(health);
  app.register(auth);

  return app;
};

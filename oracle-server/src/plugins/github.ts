import fp from "fastify-plugin";
import oauthPlugin from "@fastify/oauth2";
import cookie from "@fastify/cookie";
import { getEnvVars } from "../utils/getEnvVar.js";

export const REDIRECT_PATH = "/login/github";

export const githubOAuthPlugin = fp(async function (fastify) {
  const [CLIENT_ID, CLIENT_SECRET, CALLBACK_URI] = getEnvVars([
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CALLBACK_URI",
  ]);

  fastify.register(cookie);

  fastify.register(oauthPlugin, {
    name: "githubOAuth2",
    scope: [],
    credentials: {
      client: {
        id: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      // @ts-expect-error 'GITHUB_CONFIGURATION' does not exist on type 'typeof fastifyOauth2'
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: REDIRECT_PATH,
    callbackUri: CALLBACK_URI, // must match what is provided to GitHub
    cookie: {
      secure: true,
      sameSite: "strict",
    },
  });
});

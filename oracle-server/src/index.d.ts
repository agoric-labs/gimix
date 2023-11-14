import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    githubOAuth2: OAuth2Namespace;
  }
}

export interface ProcessEnv {
  PORT: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_CALLBACK_URI: string;
}

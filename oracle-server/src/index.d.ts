import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    githubOAuth2: OAuth2Namespace;
  }
}

export interface ProcessEnv {
  PORT: string;
  GITHUB_APP_ID: string;
  GITHUB_CALLBACK_URI: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_INSTALLATION_ID: string;
  GITHUB_PEM_PATH: string;
}

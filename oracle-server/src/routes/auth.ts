import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import type { Token } from "@fastify/oauth2";
import { saveAccessToken, retrieveAccessToken } from "../lib/store.js";
import { getEnvVars } from "../utils/getEnvVar.js";
import { REDIRECT_PATH } from "../plugins/github.js";

export const auth: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get(`${REDIRECT_PATH}/callback`, async function (request, reply) {
    try {
      const token =
        await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(
          request
        );

      await saveAccessToken(token.token);

      reply.send({ access_token: token.token.access_token });
    } catch (e) {
      console.error(e);
      reply.status(500).send(e);
    }
    
  });

  fastify.get(
    `${REDIRECT_PATH}/refreshAccessToken`,
    async function (request, reply) {
      // we assume the token is passed by authorization header
      const refreshToken = await retrieveAccessToken(
        request.headers.authorization
      );
      const newToken =
        await this.githubOAuth2.getNewAccessTokenUsingRefreshToken(
          refreshToken as Token,
          {}
        );

      // we save the token again
      await saveAccessToken(newToken.token);

      reply.send({ access_token: newToken.token.access_token });
    }
  );

  // Check access token: https://docs.github.com/en/rest/apps/oauth-applications#check-a-token
  fastify.get(
    `${REDIRECT_PATH}/verifyAccessToken`,
    async function (
      request: FastifyRequest<{
        Querystring: { accessToken: string };
      }>,
      reply
    ) {
      const { accessToken } = request.query;
      const [CLIENT_ID, CLIENT_SECRET] = getEnvVars([
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
      ]);
      const response = await fetch(
        `https://api.github.com/applications/${CLIENT_ID}/token`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: accessToken }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        reply.send(data);
        return;
      }
      reply.send(data);
    }
  );

  done();
};

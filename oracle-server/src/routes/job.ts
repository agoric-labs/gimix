import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import { createUserOctokit, queryPullRequest } from "../lib/octokit.js";
import { parseGitHubUrl } from "../utils/job.js";

type ProposeJob = {
  Body: { issueUrl: string; jobId: string };
  Headers: {
    authorization: string;
  };
};
type ClaimJob = {
  Body: {
    prUrl: string;
    walletAddress: string;
    jobId: string;
  };
  Headers: {
    authorization: string;
  };
};

export const job: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post(
    "/job/claim",
    async function (request: FastifyRequest<ClaimJob>, reply) {
      try {
        // TODO get gh access_token from header
        const _userAccessToken = request.headers["authorization"]; // or however you pass the token
        if (!_userAccessToken)
          return reply.status(401).send("GitHub access token is required.");
        const userAccessToken = _userAccessToken.split("Bearer ")[1];
        if (!_userAccessToken)
          return reply.status(401).send("Unable to parse access token.");

        const userOctokit = createUserOctokit(userAccessToken);
        if (!userOctokit) {
          return reply
            .status(401)
            .send("Error validating GitHub access token.");
        }
        const { prUrl, jobId, walletAddress } = request.body;
        const pullParams = parseGitHubUrl(prUrl, "pull");
        if (!pullParams)
          return reply.status(400).send("Invalid pull request url.");
        const query = await queryPullRequest(pullParams);
        if (!query)
          return reply.status(400).send("Unable to fetch PR details.");

        const userData = await userOctokit.rest.users.getAuthenticated();
        if (!userData)
          return reply.status(401).send("Unable to fetch author profile data.");

        const prRef = query.repository.pullRequest;

        // 1. check user's access_token == PR author
        if (userData.data.login !== prRef.author.login) {
          return reply.status(403).send("User is not the pull request author.");
        }

        // 2. Check that PR has an issue
        const issueRef =
          query.repository.pullRequest.closingIssuesReferences.nodes[0];
        if (!issueRef)
          return reply
            .status(400)
            .send("Issue reference not found for this pull request.");

        // 3. check that submitter was assigned the issue
        const assigneeRef = issueRef.assignees.nodes[0];
        if (!assigneeRef)
          return reply.status(400).send("Issue does not have an assignee.");
        if (assigneeRef.resourcePath.replace("/", "") !== prRef.author.login) {
          return reply
            .status(400)
            .send("Issue is not assigned to the pull request author.");
        }

        // 4. check that PR is closed & merged
        if (prRef.state !== "MERGED" || !prRef.merged) {
          return reply.status(400).send("Pull request is not merged.");
        }

        // 5. check the issue is closed and marked completed
        if (
          issueRef.state !== "CLOSED" &&
          issueRef.stateReason !== "COMPLETED"
        ) {
          return reply
            .status(400)
            .send("Issue is still open or not marked completed.");
        }

        // 6. ensure the issue has a bounty
        // 6.1 check that jobId is associated with issueUrl
        /// XXX TODO maybe not a consideration for this application,
        // although it'd be nice

        // 7. sendJobReport, all criteria met
        const jobReport = {
          deliverDepositAddr: walletAddress,
          issueURL: issueRef.url,
          jobID: BigInt(jobId),
          prURL: prUrl,
        };

        console.log("Preparing job report...", jobReport);
        const { sendJobReport } = fastify.oracleService;
        try {
          await sendJobReport(jobReport);
        } catch (e) {
          console.error(e);
          return reply.status(500).send("Error broadcasting message");
        }

        reply.send({ ok: true, jobId });
      } catch (e) {
        console.error("/job/claim error", e);
        reply.status(500).send("Unexpected error.");
      }
    },
  );

  // XXX currently done directly with the contract
  // this can be leveraged if we want the oracle server
  // to be aware of new bounties so it can post comments
  fastify.post(
    "/job/propose",
    async (_req: FastifyRequest<ProposeJob>, _reply) => {
      // const { issueUrl, jobId } = _req.body;
      // XXX TODO
      // 1. verify that issue exists
      // 2. verify jobId is on chain + associated w/ issue
      // 3. comment jobId, amount, + deadline on the issue from bot
    },
  );
  done();
};

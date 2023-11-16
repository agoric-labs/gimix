import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import { queryPullRequest } from "../lib/octokit.js";
import { parseGitHubUrl } from "../utils/job.js";

type ProposeJob = { Body: { issueUrl: string; jobId: string } };
type ClaimJob = {
  Body: {
    prUrl: string;
    walletAddress: string;
    jobId: string;
  };
};

export const job: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post(
    "/job/claim",
    async function (request: FastifyRequest<ClaimJob>, reply) {
      try {
        // TODO get gh access_token from header
        const { prUrl, jobId, walletAddress } = request.body;
        const pullParams = parseGitHubUrl(prUrl, "pull");
        if (!pullParams)
          return reply.status(400).send("Invalid pull request url.");
        const query = await queryPullRequest(pullParams);
        if (!query)
          return reply.status(400).send("Unable to fetch PR details.");
        const prRef = query.repository.pullRequest;
        const issueRef =
          query.repository.pullRequest.closingIssuesReferences.nodes[0];

        // 1. check user's access_token == PR author (pull.data.user.id)
        // XXX TODO

        // 2. Check that PR has an issue
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
        /// XXX TODO, need to query blockchain state
        const _issueUrl = issueRef.url;
        const _issueNumber = issueRef.number;

        // XXX TODO sendJobReport, all criteria met
        // sendJobReport
        const _w = walletAddress;

        reply.send({ ok: true, jobId });
      } catch (e) {
        console.error("/job/claim error", e);
        reply.status(500).send("Unexpected error.");
      }
    }
  );

  fastify.post(
    "/job/propose",
    async (_req: FastifyRequest<ProposeJob>, _reply) => {
      // const { issueUrl, jobId } = _req.body;
      // XXX TODO
      // 1. verify that issue exists
      // 2. verify jobId is on chain + associated w/ issue
      // 3. comment jobId, amount, + deadline on the issue from bot
    }
  );
  done();
};

import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import isEqual from "lodash.isequal";
import { getOctokit } from "../lib/octokit.js";
import { parseGitHubUrl } from "../utils/job.js";

type ProposeJob = { Body: { issueUrl: string; jobId: string } };
type ClaimJob = {
  Body: {
    prUrl: string;
    walletAddress: string;
    jobId: string;
    issueUrl: string;
  };
};

export const job: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post(
    "/job/claim",
    async function (request: FastifyRequest<ClaimJob>, reply) {
      try {
        // TODO get gh access_token from header
        const { prUrl, issueUrl, jobId, walletAddress } = request.body;
        const pullParams = parseGitHubUrl(prUrl, "pull");
        const issueParams = parseGitHubUrl(issueUrl, "issue");
        if (!pullParams)
          return reply.status(400).send("Invalid pull request url.");
        if (!issueParams) return reply.status(400).send("Invalid issue url.");
        const pull = await getOctokit().rest.pulls.get(pullParams);
        const issue = await getOctokit().rest.issues.get(issueParams);
        /// XXX TODO
        // check that jobId is associated with issueUrl

        // 1. check user's access_token == PR author (pull.data.user.id)
        // XXX TODO
        // 2. check that submitter was assigned the issue
        if (!issue.data.assignee)
          return reply.status(400).send("Issue does not have an assignee.");
        if (issue.data.assignee.id !== pull.data.user.id)
          return reply
            .status(400)
            .send("Issue was not assigned to the pull request author.");
        // 3. check that PR is closed & merged
        if (pull.data.state !== "closed" || !pull.data.merged) {
          return reply
            .status(400)
            .send("Pull request has not been merged yet.");
        }
        // 4. check that PR closes provided issue
        // XXX pull.data.issue_url == pull.url. this is not a reliable way to do this.
        // instead, we need to check for github pull request comments and commit
        // if (!pull.data.issue_url)
        //   return reply
        //     .status(400)
        //     .send("Associated issue was not found for this pull request.");

        // const pullIssueParams = parseGitHubUrl(pull.data.issue_url, "issue");
        // if (!isEqual(pullIssueParams, issueParams)) {
        //   return reply
        //     .status(400)
        //     .send(
        //       "Supplied issue does not match the issue associated with the pull request."
        //     );
        // }
        // 5. check the issue is closed and marked completed
        if (
          issue.data.state !== "closed" &&
          issue.data.state_reason !== "completed"
        ) {
          return reply
            .status(400)
            .send("Issue is still open or not marked completed.");
        }

        // XXX TODO sendJobReport, all criteria met
        // sendJobReport
        const _w = walletAddress;

        reply.send({ ok: true, data: pull.data, jobId });
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

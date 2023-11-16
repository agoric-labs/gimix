import { readFileSync } from "fs";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { getEnvVars } from "../utils/getEnvVar.js";
import { GitHubResourceParams } from "../utils/job.js";

let _octokit: InstanceType<typeof Octokit> | undefined;

let appAuth: ReturnType<typeof createAppAuth>;

function getAppAuth() {
  if (appAuth) return appAuth;
  const [APP_ID, PEM_PATH, INSTALLATION_ID] = getEnvVars([
    "GITHUB_APP_ID",
    "GITHUB_PEM_PATH",
    "GITHUB_INSTALLATION_ID",
  ]);
  appAuth = createAppAuth({
    appId: APP_ID,
    // @ts-expect-error string instead of buffer
    privateKey: readFileSync(PEM_PATH),
    installationId: INSTALLATION_ID,
  });
  return appAuth;
}

export function getOctokit() {
  if (_octokit) return _octokit;
  const [APP_ID, PEM_PATH, INSTALLATION_ID] = getEnvVars([
    "GITHUB_APP_ID",
    "GITHUB_PEM_PATH",
    "GITHUB_INSTALLATION_ID",
  ]);

  _octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: APP_ID,
      privateKey: readFileSync(PEM_PATH),
      installationId: INSTALLATION_ID,
    },
  });

  return _octokit;
}

export function getGraphql() {
  return getOctokit().graphql.defaults({
    request: {
      hook: getAppAuth().hook,
    },
  });
}

// octokit instance scoped to the user's PAT
export function createUserOctokit(userAccessToken: string) {
  return new Octokit({
    auth: userAccessToken,
  });
}


interface QueryData {
  repository: {
    pullRequest: {
      merged: boolean;
      state: "MERGED" | "OPEN" | "CLOSED";
      author: { login: string; url: string };
      closingIssuesReferences: {
        nodes: {
          number: number;
          url: string;
          assignees: {
            nodes: {
              resourcePath: string;
              name: string;
            }[];
          };
          state: "OPEN" | "CLOSED";
          closed: boolean;
          stateReason: "COMPLETED" | "REOPENED" | "NOT_PLANNED";
        }[];
      };
    };
  };
}

export async function queryPullRequest({
  owner,
  repo,
  pull_number,
}: GitHubResourceParams<"pull">): Promise<QueryData> {
  try {
    const data = await getGraphql()(
      `
query pullRequest($name: String!, $owner: String!, $num: Int!){
  repository(name: $name, owner: $owner) {
    pullRequest(number: $num) {
      merged
      state
      author {
        __typename
        login
        url
      }
      closingIssuesReferences (first:1) {
        nodes {
          number
          url
          assignees (first:1) {
            nodes {
              resourcePath
              name
            }
          }
          state
          closed
          stateReason
        }
      }
    }
  }
}
`,
      {
        owner,
        name: repo,
        num: pull_number,
      }
    );
    return data as QueryData;
  } catch (e) {
    console.error("Error fetching PR", e);
    throw new Error("Error fetching PR");
  }
}

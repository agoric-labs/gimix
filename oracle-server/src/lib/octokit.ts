import { readFileSync } from "fs";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { getEnvVars } from "../utils/getEnvVar.js";

let _octokit: InstanceType<typeof Octokit> | undefined;

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

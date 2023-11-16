import anyTest, { TestFn } from "ava";
import { parseGitHubUrl } from "../../src/utils/job.js";

const test = anyTest as TestFn;

test("parseGitHubUrl pulls", (t) => {
  const pulls = [
    "https://github.com/user/repo/pull/1",
    "https://api.github.com/repos/user/repo/pulls/1",
  ];
  pulls.forEach((url, i) => {
    const type = i == 0 ? "web" : "api";
    const parsed = parseGitHubUrl(url, "pull");
    t.is(parsed?.owner, "user", `Parse git pull url owner ${type}`);
    t.is(parsed?.pull_number, 1, `Parse git pull url number ${type}`);
    t.is(parsed?.repo, "repo", `Parse git pull url repo ${type}`);
  });
});

test("parseGitHubUrl issues", (t) => {
  const issues = [
    "https://github.com/user/repo/issues/2",
    "https://api.github.com/repos/user/repo/issues/2",
  ];
  issues.forEach((url, i) => {
    const type = i == 0 ? "web" : "api";
    const parsed = parseGitHubUrl(url, "issue");
    t.is(parsed?.owner, "user", `Parse git issue url owner ${type}`);
    t.is(parsed?.issue_number, 2, `Parse git issue url number ${type}`);
    t.is(parsed?.repo, "repo", `Parse git issue url repo ${type}`);
  });
});

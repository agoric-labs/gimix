type GitHubResourceType = "issue" | "pull";

type GitHubResourceParams<T extends GitHubResourceType> = T extends "issue"
  ? { owner: string; repo: string; issue_number: number }
  : { owner: string; repo: string; pull_number: number };

  export function parseGitHubUrl<T extends GitHubResourceType>(
    url: string,
    resourceType: T
  ): GitHubResourceParams<T> | null {
    if (!url) return null;

    const normalizedUrl = url.replace(/^https?:\/\/(api\.)?github\.com\//, "");
    const parts = normalizedUrl.split("/");
    const isApiUrl = parts[0] === "repos";
    const typeSegment = isApiUrl
      ? resourceType === "issue"
        ? "issues"
        : "pulls"
      : resourceType === "issue"
      ? "issues"
      : "pull";
    const typeName = resourceType === "issue" ? "issue_number" : "pull_number";

    // Adjust the index based on whether the URL is from the API or the website
    const [owner, repo, type, idStr] = isApiUrl ? parts.slice(1) : parts;
    const number = Number(idStr);

    if (!isNaN(number) && type === typeSegment) {
      return { owner, repo, [typeName]: number } as GitHubResourceParams<T>;
    }
    return null;
  }
  

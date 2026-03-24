import { SOLAR_SYSTEM_CONFIG } from "#shared/utils/config";
import {
  generateRawPlanets,
  sunPackages,
  type RawPlanet,
  type SolarSystemApiResponse,
  type SunPackage,
} from "#shared/utils/solar-system";

type GitHubRepo = {
  id: number;
  name: string;
  default_branch: string;
};

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
};

type PackageJsonData = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const normalizeVersion = (version: string) => {
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return "0.0.0";
  return `${match[1]}.${match[2]}.${match[3]}`;
};

const parseVersion = (version: string) => {
  const [major, minor, patch] = normalizeVersion(version).split(".").map(Number);
  return {
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
  };
};

const compareVersions = (left: string, right: string) => {
  const a = parseVersion(left);
  const b = parseVersion(right);

  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
};

const createMockPayload = (): SolarSystemApiResponse => ({
  source: "mock",
  generatedAt: new Date().toISOString(),
  sunPackages,
  repositories: generateRawPlanets(),
});

const toRawPlanets = (
  repos: Array<{
    id: string;
    name: string;
    packages: Array<{ name: string; currentVersion: string }>;
  }>
): RawPlanet[] =>
  repos.map((repo, index) => ({
    id: repo.id,
    name: repo.name,
    orbitRadius: 150 + (((index + 3) * 16) % 290),
    orbitDuration: 14 + index * 1.5,
    size: 14 + (index % 10),
    packages: repo.packages,
  }));

export default defineEventHandler(async (): Promise<SolarSystemApiResponse> => {
  const runtimeConfig = useRuntimeConfig();
  const githubToken = (runtimeConfig.githubToken || "").trim();
  const githubOwner = (runtimeConfig.githubOwner || "").trim();
  const githubApiBase = (runtimeConfig.githubApiBase || "https://api.github.com").replace(
    /\/$/,
    ""
  );

  const configuredRepos = (runtimeConfig.githubRepos || "")
    .split(",")
    .map((repo: string) => repo.trim())
    .filter(Boolean);

  const repoNames = configuredRepos.length
    ? configuredRepos
    : SOLAR_SYSTEM_CONFIG.github.defaultRepositories;

  if (!githubToken || !githubOwner || repoNames.length === 0) {
    return createMockPayload();
  }

  try {
    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const repoPayloads = await Promise.all(
      repoNames.map(async (repoName: string) => {
        const repo = await $fetch<GitHubRepo>(`${githubApiBase}/repos/${githubOwner}/${repoName}`, {
          headers,
        });

        const packageJsonFile = await $fetch<GitHubContentResponse>(
          `${githubApiBase}/repos/${githubOwner}/${repoName}/contents/package.json?ref=${repo.default_branch}`,
          { headers }
        );

        const content = packageJsonFile.content || "";
        const encoding = packageJsonFile.encoding || "base64";
        const decoded =
          encoding === "base64"
            ? Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf-8")
            : content;

        const packageJson = JSON.parse(decoded) as PackageJsonData;
        const mergedDependencies = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {}),
        };

        const packages = Object.entries(mergedDependencies)
          .map(([name, version]) => ({
            name,
            currentVersion: normalizeVersion(version),
          }))
          .filter((pkg) => pkg.currentVersion !== "0.0.0")
          .slice(0, SOLAR_SYSTEM_CONFIG.github.maxPackagesPerRepo);

        return {
          id: String(repo.id),
          name: repo.name,
          packages,
        };
      })
    );

    const repositories = repoPayloads.filter(
      (repo: { packages: Array<{ name: string; currentVersion: string }> }) =>
        repo.packages.length > 0
    );
    if (repositories.length === 0) {
      return createMockPayload();
    }

    const latestByPackage = new Map<string, string>();
    for (const repository of repositories) {
      for (const pkg of repository.packages) {
        const existingLatest = latestByPackage.get(pkg.name);
        if (!existingLatest || compareVersions(pkg.currentVersion, existingLatest) > 0) {
          latestByPackage.set(pkg.name, pkg.currentVersion);
        }
      }
    }

    const liveSunPackages: SunPackage[] = Array.from(latestByPackage.entries())
      .map(([name, latestVersion]) => ({ name, latestVersion }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      source: "github",
      generatedAt: new Date().toISOString(),
      sunPackages: liveSunPackages.length ? liveSunPackages : sunPackages,
      repositories: toRawPlanets(repositories),
    };
  } catch {
    return createMockPayload();
  }
});

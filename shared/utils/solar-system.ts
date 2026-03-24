import {
  MOCK_SUN_PACKAGES,
  SOLAR_SYSTEM_CONFIG,
  STATUS_BADGE_CLASSES,
  STATUS_COLORS,
} from "./config";

export type SunPackage = {
  name: string;
  latestVersion: string;
};

export type MoonStatus = "upToDate" | "patchBehind" | "minorBehind" | "majorBehind";

export type Moon = {
  name: string;
  currentVersion: string;
  latestVersion: string;
  status: MoonStatus;
  statusLabel: string;
  orbitRadius: number;
  orbitDuration: number;
};

export type Planet = {
  id: string;
  name: string;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  baseAngle: number;
  moons: Moon[];
};

export type Selection =
  | { type: "sun" }
  | { type: "planet"; planet: Planet }
  | { type: "moon"; planet: Planet; moon: Moon };

export type Point = { x: number; y: number };

export type Star = {
  id: string;
  x: number;
  y: number;
  r: number;
  opacity: number;
};

export type PackageSnapshot = {
  planetId: string;
  planetName: string;
  name: string;
  status: MoonStatus;
  statusLabel: string;
  currentVersion: string;
  latestVersion: string;
};

export type ProjectHealth = {
  id: string;
  name: string;
  total: number;
  outdated: number;
  major: number;
  minor: number;
  patch: number;
  upToDate: number;
  risk: number;
};

export type UpgradeCandidate = {
  name: string;
  latestVersion: string;
  impactedRepos: number;
  impactedPackages: number;
  highestStatus: Exclude<MoonStatus, "upToDate">;
  repos: string[];
};

export type RawPlanetPackage = {
  name: string;
  currentVersion: string;
};

export type RawPlanet = {
  id: string;
  name: string;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  packages: RawPlanetPackage[];
};

export type SolarSystemApiResponse = {
  source: "github" | "mock";
  generatedAt: string;
  sunPackages: SunPackage[];
  repositories: RawPlanet[];
};

export const sunPackages: SunPackage[] = [...MOCK_SUN_PACKAGES];

export const statusPriority: Record<MoonStatus, number> = {
  majorBehind: 3,
  minorBehind: 2,
  patchBehind: 1,
  upToDate: 0,
};

const orbitLayout = SOLAR_SYSTEM_CONFIG.orbitLayout;

export const center = SOLAR_SYSTEM_CONFIG.center;

/**
 * Creates deterministic pseudo-random values so the dashboard data stays stable
 * between refreshes while still looking naturally generated.
 */
const createSeededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

/**
 * Produces an older semantic version by reducing major/minor/patch levels.
 */
const downgradeVersion = (
  latestVersion: string,
  random: () => number,
  forceBehind: boolean
): string => {
  const versionParts = latestVersion.split(".");
  const majorRaw = Number(versionParts[0] ?? 0) || 0;
  const minorRaw = Number(versionParts[1] ?? 0) || 0;
  const patchRaw = Number(versionParts[2] ?? 0) || 0;
  let major = majorRaw;
  let minor = minorRaw;
  let patch = patchRaw;

  const shouldChange = forceBehind || random() < 0.65;
  if (!shouldChange) {
    return `${major}.${minor}.${patch}`;
  }

  const level = Math.floor(random() * 3);
  if (level === 0 && patch > 0) patch -= 1;
  else if (level === 1 && minor > 0) minor -= 1;
  else if (major > 0) major -= 1;

  if (minor > minorRaw) minor = minorRaw;
  if (patch > patchRaw) patch = patchRaw;

  return `${major}.${minor}.${patch}`;
};

/**
 * Chooses a unique subset of packages for each repository.
 */
const pickUniquePackages = (
  random: () => number,
  count: number,
  source: SunPackage[]
): SunPackage[] => {
  const pool = [...source];
  const selectedPackages: SunPackage[] = [];

  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.floor(random() * pool.length);
    const [pkg] = pool.splice(index, 1);
    if (pkg) selectedPackages.push(pkg);
  }

  return selectedPackages;
};

const getOrbitRadius = (index: number, total: number) => {
  if (total <= 1) {
    return (orbitLayout.innerRadius + orbitLayout.outerRadius) / 2;
  }

  const spacing = (orbitLayout.outerRadius - orbitLayout.innerRadius) / (total - 1);
  return orbitLayout.innerRadius + spacing * index;
};

const parseVersion = (version: string) => {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  return {
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
  };
};

export const getStatus = (current: string, latest: string): MoonStatus => {
  const currentParts = parseVersion(current);
  const latestParts = parseVersion(latest);

  if (latestParts.major > currentParts.major) return "majorBehind";
  if (latestParts.minor > currentParts.minor) return "minorBehind";
  if (latestParts.patch > currentParts.patch) return "patchBehind";
  return "upToDate";
};

export const statusToLabel = (status: MoonStatus) => {
  switch (status) {
    case "upToDate":
      return "Up to date";
    case "patchBehind":
      return "Patch behind";
    case "minorBehind":
      return "Minor behind";
    case "majorBehind":
      return "Major behind";
  }
};

export const statusColor = (status: MoonStatus) => STATUS_COLORS[status];

export const badgeClass = (status: MoonStatus) => STATUS_BADGE_CLASSES[status];

/**
 * Generates repositories and attached package versions for the solar system.
 */
export const generateRawPlanets = (
  seed = SOLAR_SYSTEM_CONFIG.defaultSeed,
  count = SOLAR_SYSTEM_CONFIG.defaultRepositoryCount,
  availablePackages: SunPackage[] = sunPackages
): RawPlanet[] => {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }, (_, index) => {
    const packageCount = 2 + Math.floor(random() * 3);
    const selectedPackages = pickUniquePackages(random, packageCount, availablePackages);

    return {
      id: `test-${index + 1}`,
      name: `test-repo-${index + 1}`,
      orbitRadius: 150 + (((index + 3) * 16) % 290),
      orbitDuration: 14 + index * 1.5,
      size: 14 + Math.floor(random() * 10),
      packages: selectedPackages.map((pkg, pkgIndex) => ({
        name: pkg.name,
        currentVersion: downgradeVersion(pkg.latestVersion, random, pkgIndex === 0),
      })),
    };
  });
};

export const buildPlanets = (
  rawPlanets: RawPlanet[],
  packageCatalog: SunPackage[] = sunPackages
): Planet[] =>
  rawPlanets.map((planet, planetIndex) => {
    const moons: Moon[] = planet.packages.map((pkg, index) => {
      const latest =
        packageCatalog.find((item) => item.name === pkg.name)?.latestVersion ?? pkg.currentVersion;
      const status = getStatus(pkg.currentVersion, latest);

      return {
        name: pkg.name,
        currentVersion: pkg.currentVersion,
        latestVersion: latest,
        status,
        statusLabel: statusToLabel(status),
        orbitRadius: 24 + index * 11,
        orbitDuration: 3.5 + index * 1.4,
      };
    });

    return {
      id: planet.id,
      name: planet.name,
      orbitRadius: getOrbitRadius(planetIndex, rawPlanets.length),
      orbitDuration: planet.orbitDuration,
      size: planet.size,
      baseAngle: ((Math.PI * 2) / rawPlanets.length) * planetIndex,
      moons,
    };
  });

export const generateStars = (count = SOLAR_SYSTEM_CONFIG.starsCount): Star[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = (index * 9301 + 49297) % 233280;
    const seed2 = (index * 233 + 719) % 9973;
    return {
      id: `s-${index}`,
      x: 50 + (seed / 233280) * 900,
      y: 50 + ((seed2 % 1000) / 1000) * 900,
      r: index % 5 === 0 ? 1.8 : 1.2,
      opacity: index % 3 === 0 ? 0.65 : 0.35,
    };
  });

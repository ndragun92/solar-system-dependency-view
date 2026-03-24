type SharedMoonStatus = "upToDate" | "patchBehind" | "minorBehind" | "majorBehind";

type SharedSunPackage = {
  name: string;
  latestVersion: string;
};

export const SOLAR_SYSTEM_CONFIG = {
  center: 500,
  starsCount: 120,
  defaultSeed: 20260323,
  defaultRepositoryCount: 5,
  orbitLayout: {
    innerRadius: 140,
    outerRadius: 390,
  },
  github: {
    defaultRepositories: [
      "test-repo-1",
      "test-repo-2",
      "test-repo-3",
      "test-repo-4",
      "test-repo-5",
    ],
    maxPackagesPerRepo: 8,
  },
} as const;

const baseSunPackages: SharedSunPackage[] = [
  { name: "@acme/ui", latestVersion: "3.2.1" },
  { name: "@acme/data", latestVersion: "2.8.0" },
  { name: "@acme/auth", latestVersion: "1.5.4" },
  { name: "@acme/analytics", latestVersion: "4.0.0" },
  { name: "@acme/payments", latestVersion: "2.2.6" },
];

const extraSunPackages: SharedSunPackage[] = [
  { name: "@acme/forms", latestVersion: "1.9.2" },
  { name: "@acme/logger", latestVersion: "2.4.1" },
  { name: "@acme/search", latestVersion: "3.0.5" },
  { name: "@acme/maps", latestVersion: "1.3.7" },
  { name: "@acme/notifications", latestVersion: "2.1.3" },
  { name: "@acme/charts", latestVersion: "5.6.0" },
  { name: "@acme/i18n", latestVersion: "4.2.2" },
  { name: "@acme/cache", latestVersion: "1.8.9" },
  { name: "@acme/http", latestVersion: "3.4.0" },
  { name: "@acme/feature-flags", latestVersion: "2.0.4" },
  { name: "@acme/telemetry", latestVersion: "1.7.6" },
  { name: "@acme/storage", latestVersion: "6.1.1" },
  { name: "@acme/theme", latestVersion: "2.9.8" },
  { name: "@acme/editor", latestVersion: "1.4.4" },
  { name: "@acme/markdown", latestVersion: "3.3.2" },
  { name: "@acme/realtime", latestVersion: "0.9.5" },
  { name: "@acme/scheduler", latestVersion: "2.5.0" },
];

export const MOCK_SUN_PACKAGES: SharedSunPackage[] = [...baseSunPackages, ...extraSunPackages];

export const STATUS_COLORS: Record<SharedMoonStatus, string> = {
  upToDate: "#34d399",
  patchBehind: "#38bdf8",
  minorBehind: "#fbbf24",
  majorBehind: "#f43f5e",
};

export const STATUS_BADGE_CLASSES: Record<SharedMoonStatus, string> = {
  upToDate: "bg-emerald-500/20 text-emerald-300",
  patchBehind: "bg-cyan-500/20 text-cyan-300",
  minorBehind: "bg-amber-500/20 text-amber-300",
  majorBehind: "bg-rose-500/20 text-rose-300",
};

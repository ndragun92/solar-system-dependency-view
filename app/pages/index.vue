<template>
  <main class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article
          class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
        >
          <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Repositories</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ planets.length }}</p>
          <p class="mt-1 text-xs text-slate-400">active projects in orbit</p>
        </article>

        <article
          class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
        >
          <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Tracked packages</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ allPackages.length }}</p>
          <p class="mt-1 text-xs text-slate-400">dependencies mapped in moons</p>
        </article>

        <article
          class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
        >
          <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Outdated packages</p>
          <p class="mt-2 text-2xl font-semibold text-amber-300">{{ outdatedPackages.length }}</p>
          <p class="mt-1 text-xs text-slate-400">
            {{ projectHealth.filter((item) => item.outdated > 0).length }} repos affected
          </p>
        </article>

        <article
          class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
        >
          <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Fleet health</p>
          <p class="mt-2 text-2xl font-semibold text-emerald-300">{{ fleetHealthScore }}%</p>
          <p class="mt-1 text-xs text-slate-400">up-to-date ratio across all moons</p>
        </article>
      </section>

      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 backdrop-blur">
        <div class="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Dependency alert stream</p>
          <div class="hidden items-center gap-2 md:flex">
            <span class="inline-flex items-center gap-1 text-xs text-rose-300">
              <span class="inline-block h-2 w-2 rounded-full bg-rose-400" /> Major
            </span>
            <span class="inline-flex items-center gap-1 text-xs text-amber-300">
              <span class="inline-block h-2 w-2 rounded-full bg-amber-400" /> Minor
            </span>
            <span class="inline-flex items-center gap-1 text-xs text-cyan-300">
              <span class="inline-block h-2 w-2 rounded-full bg-cyan-400" /> Patch
            </span>
          </div>
        </div>

        <div class="ticker mt-2">
          <div class="ticker-track">
            <span
              v-for="(item, index) in marqueeItemsLoop"
              :key="`${item}-${index}`"
              class="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-200"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 md:p-5">
          <svg
            ref="solarSvg"
            viewBox="0 0 1000 1000"
            class="h-auto w-full"
            role="img"
            aria-label="Animated solar system with repositories and package status"
            @pointermove="handlePointerMove"
            @pointerleave="handlePointerLeave"
          >
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stop-color="#fde68a" />
                <stop offset="60%" stop-color="#fb923c" />
                <stop offset="100%" stop-color="#f43f5e" />
              </radialGradient>
              <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#67e8f9" />
                <stop offset="100%" stop-color="#2563eb" />
              </linearGradient>
            </defs>

            <g>
              <circle cx="500" cy="500" r="470" fill="#020617" />
              <circle cx="500" cy="500" r="420" fill="none" stroke="#0f172a" stroke-width="2" />
            </g>

            <circle
              v-for="star in stars"
              :key="star.id"
              :cx="star.x"
              :cy="star.y"
              :r="star.r"
              fill="#e2e8f0"
              :opacity="star.opacity"
            />

            <circle
              v-for="planet in planets"
              :key="`orbit-${planet.id}`"
              cx="500"
              cy="500"
              :r="planet.orbitRadius"
              fill="none"
              stroke="#334155"
              stroke-width="1.5"
              stroke-dasharray="6 10"
            />

            <g class="cursor-pointer" @click="openSelection({ type: 'sun' })">
              <circle cx="500" cy="500" r="58" fill="url(#sunGradient)" class="sun-glow" />
              <text
                x="500"
                y="506"
                text-anchor="middle"
                class="select-none fill-slate-900 text-[20px] font-bold"
              >
                SUN
              </text>
            </g>

            <g v-for="planet in planets" :key="planet.id">
              <g
                :transform="`translate(${planetPosition(planet).x} ${planetPosition(planet).y})`"
                class="cursor-pointer"
                @click="openSelection({ type: 'planet', planet })"
              >
                <circle :r="planet.size" fill="url(#planetGradient)" class="planet-glow" />
                <text
                  y="-22"
                  text-anchor="middle"
                  class="select-none fill-slate-100 text-[15px] font-medium"
                >
                  {{ planet.name }}
                </text>
              </g>

              <g v-for="(moon, moonIndex) in planet.moons" :key="`${planet.id}-${moon.name}`">
                <circle
                  :cx="moonPosition(planet, moon, moonIndex).x"
                  :cy="moonPosition(planet, moon, moonIndex).y"
                  r="6"
                  :fill="statusColor(moon.status)"
                  stroke="#020617"
                  stroke-width="2"
                  class="cursor-pointer"
                  @click.stop="openSelection({ type: 'moon', planet, moon })"
                />
              </g>
            </g>
          </svg>
        </div>

        <aside
          ref="detailsAside"
          class="h-fit max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur"
        >
          <div class="mb-4 border-b border-slate-800 pb-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ selected.type }}</p>
            <h2 class="mt-1 text-xl font-semibold text-white">{{ selectedTitle }}</h2>
          </div>

          <div class="space-y-3 text-sm text-slate-200">
            <template v-if="selected.type === 'sun'">
              <p class="text-slate-300">Available npm packages (latest versions)</p>
              <ul class="space-y-2">
                <li
                  v-for="pkg in sunPackages"
                  :key="pkg.name"
                  class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
                >
                  <span class="font-medium">{{ pkg.name }}</span>
                  <span class="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">{{
                    pkg.latestVersion
                  }}</span>
                </li>
              </ul>
            </template>

            <template v-else-if="selected.type === 'planet'">
              <p class="text-slate-300">Repository packages</p>
              <ul class="space-y-2">
                <li
                  v-for="pkg in selected.planet.moons"
                  :key="pkg.name"
                  class="rounded-lg bg-slate-800/60 px-3 py-2"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-medium">{{ pkg.name }}</span>
                    <span class="rounded-full px-2 py-1 text-xs" :class="badgeClass(pkg.status)">
                      {{ pkg.statusLabel }}
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-slate-400">
                    {{ pkg.currentVersion }} → {{ pkg.latestVersion }}
                  </p>
                </li>
              </ul>
            </template>

            <template v-else>
              <p class="text-slate-300">Package details</p>
              <div class="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <p class="font-medium text-white">{{ selected.moon.name }}</p>
                <p class="mt-2 text-xs text-slate-400">
                  Current: {{ selected.moon.currentVersion }}
                </p>
                <p class="text-xs text-slate-400">Latest: {{ selected.moon.latestVersion }}</p>
                <span
                  class="mt-3 inline-flex rounded-full px-2 py-1 text-xs"
                  :class="badgeClass(selected.moon.status)"
                >
                  {{ selected.moon.statusLabel }}
                </span>
              </div>
            </template>
          </div>

          <div class="mt-6 border-t border-slate-800 pt-4">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Repository watchlist</p>
              <span class="text-xs text-slate-500">highest risk first</span>
            </div>

            <ul class="space-y-2">
              <li
                v-for="item in watchlistProjects"
                :key="item.id"
                class="rounded-lg border border-slate-800 bg-slate-900/80 p-3"
              >
                <div class="flex items-center justify-between gap-2 text-sm">
                  <span class="truncate font-medium text-slate-100">{{ item.name }}</span>
                  <span class="text-xs text-slate-400">{{ item.outdated }}/{{ item.total }}</span>
                </div>

                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    class="h-full rounded-full bg-linear-to-r from-cyan-400 via-amber-400 to-rose-500"
                    :style="{ width: `${Math.round((item.risk / watchlistMaxRisk) * 100)}%` }"
                  />
                </div>

                <p class="mt-1 text-[11px] text-slate-400">
                  {{ item.major }} major · {{ item.minor }} minor · {{ item.patch }} patch
                </p>
              </li>
            </ul>
          </div>

          <div class="mt-6 border-t border-slate-800 pt-4">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-400">
                Fleet upgrade planner
              </p>
              <span class="text-xs text-slate-500">largest impact first</span>
            </div>

            <ul v-if="upgradeCandidates.length" class="space-y-2">
              <li
                v-for="candidate in upgradeCandidates"
                :key="candidate.name"
                class="rounded-lg border border-slate-800 bg-slate-900/80 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-100">{{ candidate.name }}</p>
                    <p class="mt-1 text-[11px] text-slate-400">
                      {{ candidate.impactedRepos }} repos · {{ candidate.impactedPackages }} package
                      instance{{ candidate.impactedPackages > 1 ? "s" : "" }}
                    </p>
                  </div>

                  <span class="rounded-full bg-slate-700 px-2 py-1 text-[11px] text-slate-200">
                    {{ candidate.latestVersion }}
                  </span>
                </div>

                <div class="mt-2 flex items-center justify-between gap-2">
                  <span
                    class="rounded-full px-2 py-1 text-[11px]"
                    :class="badgeClass(candidate.highestStatus)"
                  >
                    {{ statusToLabel(candidate.highestStatus) }}
                  </span>

                  <button
                    type="button"
                    class="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                    @click="inspectCandidate(candidate)"
                  >
                    Inspect
                  </button>
                </div>
              </li>
            </ul>

            <p v-else class="text-xs text-slate-400">No upgrade actions required right now.</p>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
type SunPackage = {
  name: string;
  latestVersion: string;
};

type MoonStatus = "upToDate" | "patchBehind" | "minorBehind" | "majorBehind";

type Moon = {
  name: string;
  currentVersion: string;
  latestVersion: string;
  status: MoonStatus;
  statusLabel: string;
  orbitRadius: number;
  orbitDuration: number;
};

type Planet = {
  id: string;
  name: string;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  baseAngle: number;
  moons: Moon[];
};

type Selection =
  | { type: "sun" }
  | { type: "planet"; planet: Planet }
  | { type: "moon"; planet: Planet; moon: Moon };

type Point = { x: number; y: number };

type PackageSnapshot = {
  planetId: string;
  planetName: string;
  name: string;
  status: MoonStatus;
  statusLabel: string;
  currentVersion: string;
  latestVersion: string;
};

type ProjectHealth = {
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

type UpgradeCandidate = {
  name: string;
  latestVersion: string;
  impactedRepos: number;
  impactedPackages: number;
  highestStatus: Exclude<MoonStatus, "upToDate">;
  repos: string[];
};

type RawPlanetPackage = {
  name: string;
  currentVersion: string;
};

type RawPlanet = {
  id: string;
  name: string;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  packages: RawPlanetPackage[];
};

const baseSunPackages: SunPackage[] = [
  { name: "@acme/ui", latestVersion: "3.2.1" },
  { name: "@acme/data", latestVersion: "2.8.0" },
  { name: "@acme/auth", latestVersion: "1.5.4" },
  { name: "@acme/analytics", latestVersion: "4.0.0" },
  { name: "@acme/payments", latestVersion: "2.2.6" },
];

const extraSunPackages: SunPackage[] = [
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

const sunPackages: SunPackage[] = [...baseSunPackages, ...extraSunPackages];

const createSeededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

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

const random = createSeededRandom(20260323);

const basePlanets: RawPlanet[] = Array.from({ length: 5 }, (_, index) => {
  const packageCount = 2 + Math.floor(random() * 3);
  const selectedPackages = pickUniquePackages(random, packageCount, sunPackages);

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

const rawPlanets: RawPlanet[] = basePlanets;

const orbitLayout = {
  innerRadius: 140,
  outerRadius: 390,
};

const getOrbitRadius = (index: number, total: number) => {
  if (total <= 1) {
    return (orbitLayout.innerRadius + orbitLayout.outerRadius) / 2;
  }

  const spacing = (orbitLayout.outerRadius - orbitLayout.innerRadius) / (total - 1);
  return orbitLayout.innerRadius + spacing * index;
};

const center = 500;
const startTime = Date.now();
const now = ref(startTime);
const selected = ref<Selection>({ type: "sun" });
const solarSvg = ref<SVGSVGElement | null>(null);
const detailsAside = ref<HTMLElement | null>(null);
const mousePoint = ref<Point | null>(null);

let rafId = 0;
let lastFrameTime = 0;

const parseVersion = (version: string) => {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  return {
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
  };
};

const getStatus = (current: string, latest: string): MoonStatus => {
  const currentParts = parseVersion(current);
  const latestParts = parseVersion(latest);

  if (latestParts.major > currentParts.major) return "majorBehind";
  if (latestParts.minor > currentParts.minor) return "minorBehind";
  if (latestParts.patch > currentParts.patch) return "patchBehind";
  return "upToDate";
};

const statusToLabel = (status: MoonStatus) => {
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

const planets: Planet[] = rawPlanets.map((planet, planetIndex) => {
  const moons: Moon[] = planet.packages.map((pkg, index) => {
    const latest =
      sunPackages.find((item) => item.name === pkg.name)?.latestVersion ?? pkg.currentVersion;
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

const allPackages = computed<PackageSnapshot[]>(() =>
  planets.flatMap((planet) =>
    planet.moons.map((moon) => ({
      planetId: planet.id,
      planetName: planet.name,
      name: moon.name,
      status: moon.status,
      statusLabel: moon.statusLabel,
      currentVersion: moon.currentVersion,
      latestVersion: moon.latestVersion,
    }))
  )
);

const outdatedPackages = computed(() =>
  allPackages.value.filter((item) => item.status !== "upToDate")
);

const projectHealth = computed<ProjectHealth[]>(() =>
  planets.map((planet) => {
    const total = planet.moons.length;
    const major = planet.moons.filter((moon) => moon.status === "majorBehind").length;
    const minor = planet.moons.filter((moon) => moon.status === "minorBehind").length;
    const patch = planet.moons.filter((moon) => moon.status === "patchBehind").length;
    const upToDate = planet.moons.filter((moon) => moon.status === "upToDate").length;
    const outdated = major + minor + patch;
    const risk = major * 5 + minor * 3 + patch;

    return {
      id: planet.id,
      name: planet.name,
      total,
      outdated,
      major,
      minor,
      patch,
      upToDate,
      risk,
    };
  })
);

const fleetHealthScore = computed(() => {
  const total = allPackages.value.length;
  if (!total) return 100;
  const upToDate = allPackages.value.filter((item) => item.status === "upToDate").length;
  return Math.round((upToDate / total) * 100);
});

const watchlistProjects = computed(() =>
  projectHealth.value
    .filter((item) => item.outdated > 0)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 6)
);

const watchlistMaxRisk = computed(() => {
  const maxRisk = Math.max(...watchlistProjects.value.map((item) => item.risk), 1);
  return maxRisk;
});

const statusPriority: Record<MoonStatus, number> = {
  majorBehind: 3,
  minorBehind: 2,
  patchBehind: 1,
  upToDate: 0,
};

const upgradeCandidates = computed<UpgradeCandidate[]>(() => {
  const grouped = new Map<
    string,
    {
      name: string;
      latestVersion: string;
      impactedRepos: Set<string>;
      impactedPackages: number;
      highestStatus: Exclude<MoonStatus, "upToDate">;
    }
  >();

  for (const pkg of outdatedPackages.value) {
    const existing = grouped.get(pkg.name);
    const pkgStatus = pkg.status as Exclude<MoonStatus, "upToDate">;

    if (!existing) {
      grouped.set(pkg.name, {
        name: pkg.name,
        latestVersion: pkg.latestVersion,
        impactedRepos: new Set([pkg.planetName]),
        impactedPackages: 1,
        highestStatus: pkgStatus,
      });
      continue;
    }

    existing.impactedRepos.add(pkg.planetName);
    existing.impactedPackages += 1;
    existing.highestStatus =
      statusPriority[pkgStatus] > statusPriority[existing.highestStatus]
        ? pkgStatus
        : existing.highestStatus;
  }

  return Array.from(grouped.values())
    .map((item) => ({
      name: item.name,
      latestVersion: item.latestVersion,
      impactedRepos: item.impactedRepos.size,
      impactedPackages: item.impactedPackages,
      highestStatus: item.highestStatus,
      repos: Array.from(item.impactedRepos).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => {
      if (statusPriority[b.highestStatus] !== statusPriority[a.highestStatus]) {
        return statusPriority[b.highestStatus] - statusPriority[a.highestStatus];
      }
      if (b.impactedRepos !== a.impactedRepos) {
        return b.impactedRepos - a.impactedRepos;
      }
      return b.impactedPackages - a.impactedPackages;
    })
    .slice(0, 6);
});

const marqueeItems = computed(() => {
  const criticalRepos = projectHealth.value
    .filter((item) => item.major > 0)
    .sort((a, b) => b.major - a.major)
    .slice(0, 6)
    .map((item) => `${item.name}: ${item.major} major update${item.major > 1 ? "s" : ""}`);

  const hotPackages = outdatedPackages.value
    .slice()
    .sort((a, b) => statusPriority[b.status] - statusPriority[a.status])
    .slice(0, 12)
    .map(
      (item) =>
        `${item.planetName} • ${item.name} ${item.currentVersion} → ${item.latestVersion} (${item.statusLabel})`
    );

  const combined = [...criticalRepos, ...hotPackages];
  if (combined.length === 0) {
    return ["All repositories are up to date. No dependency upgrades required right now."];
  }
  return combined;
});

const marqueeItemsLoop = computed(() => [...marqueeItems.value, ...marqueeItems.value]);

const stars = Array.from({ length: 120 }, (_, index) => {
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

const orbitAngles = ref<Record<string, number>>(
  planets.reduce(
    (acc, planet) => {
      acc[planet.id] = 0;
      return acc;
    },
    {} as Record<string, number>
  )
);

const elapsedSeconds = computed(() => (now.value - startTime) / 1000);

const planetPosition = (planet: Planet): Point => {
  const angle = planet.baseAngle + (orbitAngles.value[planet.id] ?? 0);
  return {
    x: center + Math.cos(angle) * planet.orbitRadius,
    y: center + Math.sin(angle) * planet.orbitRadius,
  };
};

const isPlanetFrozen = (planet: Planet) => {
  if (!mousePoint.value) return false;
  const pos = planetPosition(planet);
  const dx = mousePoint.value.x - pos.x;
  const dy = mousePoint.value.y - pos.y;
  return Math.hypot(dx, dy) <= planet.size;
};

const moonPosition = (planet: Planet, moon: Moon, moonIndex: number): Point => {
  const planetPos = planetPosition(planet);
  const angle =
    moonIndex + (elapsedSeconds.value / moon.orbitDuration) * Math.PI * 2 + planet.baseAngle * 0.5;
  return {
    x: planetPos.x + Math.cos(angle) * moon.orbitRadius,
    y: planetPos.y + Math.sin(angle) * moon.orbitRadius,
  };
};

const selectedTitle = computed(() => {
  if (selected.value.type === "sun") return "Available packages";
  if (selected.value.type === "planet") return selected.value.planet.name;
  return selected.value.moon.name;
});

const statusColor = (status: MoonStatus) => {
  switch (status) {
    case "upToDate":
      return "#34d399";
    case "patchBehind":
      return "#38bdf8";
    case "minorBehind":
      return "#fbbf24";
    case "majorBehind":
      return "#f43f5e";
  }
};

const badgeClass = (status: MoonStatus) => {
  switch (status) {
    case "upToDate":
      return "bg-emerald-500/20 text-emerald-300";
    case "patchBehind":
      return "bg-cyan-500/20 text-cyan-300";
    case "minorBehind":
      return "bg-amber-500/20 text-amber-300";
    case "majorBehind":
      return "bg-rose-500/20 text-rose-300";
  }
};

const inspectCandidate = (candidate: UpgradeCandidate) => {
  for (const planet of planets) {
    const foundMoon = planet.moons.find(
      (moon) => moon.name === candidate.name && moon.status !== "upToDate"
    );
    if (foundMoon) {
      selected.value = { type: "moon", planet, moon: foundMoon };
      nextTick(() => {
        detailsAside.value?.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }
  }
};

const openSelection = (value: Selection) => {
  selected.value = value;
};

const handlePointerMove = (event: PointerEvent) => {
  if (!solarSvg.value) return;
  const rect = solarSvg.value.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  mousePoint.value = {
    x: ((event.clientX - rect.left) / rect.width) * 1000,
    y: ((event.clientY - rect.top) / rect.height) * 1000,
  };
};

const handlePointerLeave = () => {
  mousePoint.value = null;
};

onMounted(() => {
  lastFrameTime = performance.now();

  const tick = () => {
    const frameTime = performance.now();
    const deltaSeconds = (frameTime - lastFrameTime) / 1000;
    lastFrameTime = frameTime;

    for (const planet of planets) {
      if (isPlanetFrozen(planet)) continue;
      const currentAngle = orbitAngles.value[planet.id] ?? 0;
      orbitAngles.value[planet.id] =
        currentAngle + (deltaSeconds / planet.orbitDuration) * Math.PI * 2;
    }

    now.value = Date.now();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.sun-glow {
  filter: drop-shadow(0 0 18px rgba(251, 146, 60, 0.7));
}

.planet-glow {
  filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.55));
}

.ticker {
  overflow: hidden;
  white-space: nowrap;
}

.ticker-track {
  display: inline-flex;
  min-width: max-content;
  gap: 0.65rem;
  padding-inline-end: 0.65rem;
  animation: ticker-scroll 48s linear infinite;
}

.ticker:hover .ticker-track {
  animation-play-state: paused;
}

@keyframes ticker-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>

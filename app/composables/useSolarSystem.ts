import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import {
  buildPlanets,
  center,
  generateStars,
  statusPriority,
  type Moon,
  type MoonStatus,
  type PackageSnapshot,
  type Planet,
  type Point,
  type ProjectHealth,
  type Selection,
  type SolarSystemApiResponse,
  type UpgradeCandidate,
} from "../../shared/utils/solar-system";

type AlertTickerItem = {
  id: string;
  label: string;
  status: Exclude<MoonStatus, "upToDate">;
  selection: Selection;
};

export const useSolarSystem = (sourceData: Ref<SolarSystemApiResponse | null>) => {
  const now = ref(Date.now());
  const startTime = now.value;
  const selected = ref<Selection>({ type: "sun" });
  const mousePoint = ref<Point | null>(null);

  let rafId = 0;
  let lastFrameTime = 0;

  const packageCatalog = computed(() => sourceData.value?.sunPackages ?? []);
  const rawPlanets = computed(() => sourceData.value?.repositories ?? []);
  const planets = computed(() => buildPlanets(rawPlanets.value, packageCatalog.value));
  const stars = generateStars();

  const orbitAngles = ref<Record<string, number>>({});

  watch(
    planets,
    (nextPlanets) => {
      const nextAngles = { ...orbitAngles.value };

      for (const planet of nextPlanets) {
        if (nextAngles[planet.id] === undefined) {
          nextAngles[planet.id] = 0;
        }
      }

      for (const planetId of Object.keys(nextAngles)) {
        if (!nextPlanets.some((planet) => planet.id === planetId)) {
          delete nextAngles[planetId];
        }
      }

      orbitAngles.value = nextAngles;
    },
    { immediate: true }
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
      moonIndex +
      (elapsedSeconds.value / moon.orbitDuration) * Math.PI * 2 +
      planet.baseAngle * 0.5;

    return {
      x: planetPos.x + Math.cos(angle) * moon.orbitRadius,
      y: planetPos.y + Math.sin(angle) * moon.orbitRadius,
    };
  };

  const allPackages = computed<PackageSnapshot[]>(() =>
    planets.value.flatMap((planet) =>
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
    planets.value.map((planet) => {
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

  const marqueeItems = computed<AlertTickerItem[]>(() => {
    const combined: AlertTickerItem[] = [];

    const criticalRepos = projectHealth.value
      .filter((item) => item.major > 0)
      .sort((a, b) => b.major - a.major)
      .slice(0, 6);

    for (const item of criticalRepos) {
      const planet = planets.value.find((candidate) => candidate.id === item.id);
      if (!planet) continue;

      combined.push({
        id: `repo-${item.id}`,
        label: `${item.name}: ${item.major} major update${item.major > 1 ? "s" : ""}`,
        status: "majorBehind",
        selection: { type: "planet", planet },
      });
    }

    const hotPackages = outdatedPackages.value
      .slice()
      .sort((a, b) => statusPriority[b.status] - statusPriority[a.status])
      .slice(0, 12);

    for (const item of hotPackages) {
      if (item.status === "upToDate") continue;
      const planet = planets.value.find((candidate) => candidate.id === item.planetId);
      if (!planet) continue;

      combined.push({
        id: `pkg-${item.planetId}-${item.name}`,
        label: `${item.planetName} • ${item.name} ${item.currentVersion} → ${item.latestVersion} (${item.statusLabel})`,
        status: item.status,
        selection: { type: "planet", planet },
      });
    }

    if (combined.length === 0) {
      return [
        {
          id: "all-clear",
          label: "All repositories are up to date. No dependency upgrades required right now.",
          status: "patchBehind",
          selection: { type: "sun" },
        },
      ];
    }

    return combined;
  });

  const marqueeItemsLoop = computed(() => [...marqueeItems.value, ...marqueeItems.value]);

  const selectedTitle = computed(() => {
    if (selected.value.type === "sun") return "Available packages";
    if (selected.value.type === "planet") return selected.value.planet.name;
    return selected.value.moon.name;
  });

  const openSelection = (value: Selection) => {
    selected.value = value;
  };

  /**
   * Focuses the details panel on the first outdated moon for a selected package.
   */
  const inspectCandidate = async (candidate: UpgradeCandidate) => {
    for (const planet of planets.value) {
      const foundMoon = planet.moons.find(
        (moon) => moon.name === candidate.name && moon.status !== "upToDate"
      );

      if (foundMoon) {
        selected.value = { type: "moon", planet, moon: foundMoon };
        await nextTick();
        return;
      }
    }
  };

  /**
   * Converts mouse coordinates from screen space into the SVG viewBox space.
   */
  const handlePointerMove = (event: PointerEvent) => {
    const svg = event.currentTarget as SVGSVGElement | null;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
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

    // Animates orbit angles every frame while preserving hover-to-freeze interactions.
    const tick = () => {
      const frameTime = performance.now();
      const deltaSeconds = (frameTime - lastFrameTime) / 1000;
      lastFrameTime = frameTime;

      for (const planet of planets.value) {
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

  return {
    sunPackages: packageCatalog,
    planets,
    stars,
    center,
    selected,
    selectedTitle,
    allPackages,
    outdatedPackages,
    projectHealth,
    fleetHealthScore,
    watchlistProjects,
    watchlistMaxRisk,
    upgradeCandidates,
    marqueeItemsLoop,
    planetPosition,
    moonPosition,
    openSelection,
    inspectCandidate,
    handlePointerMove,
    handlePointerLeave,
  };
};

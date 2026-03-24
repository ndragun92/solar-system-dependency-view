<template>
  <main class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <SolarDashboardStats
        :repositories="planets.length"
        :tracked-packages="allPackages.length"
        :outdated-packages="outdatedPackages.length"
        :repos-affected="reposAffected"
        :fleet-health-score="fleetHealthScore"
      />

      <SolarDependencyAlertTicker :items="marqueeItemsLoop" @open-selection="handleOpenSelection" />

      <section class="grid gap-6 lg:grid-cols-12">
        <SolarSystemChart
          class="lg:col-span-8"
          :planets="planets"
          :stars="stars"
          :center="center"
          :planet-position="planetPosition"
          :moon-position="moonPosition"
          @open-selection="handleOpenSelection"
          @pointer-move="handlePointerMove"
          @pointer-leave="handlePointerLeave"
        />

        <SolarDetailsPanel
          class="lg:col-span-4"
          :watchlist-projects="watchlistProjects"
          :watchlist-max-risk="watchlistMaxRisk"
          @open-project="handleOpenWatchlistProject"
        />
      </section>

      <SolarSelectionModal
        :is-open="isSelectionModalOpen"
        :selected="selected"
        :selected-title="selectedTitle"
        :sun-packages="sunPackages"
        @close="isSelectionModalOpen = false"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { SolarSystemApiResponse } from "#shared/utils/solar-system";

const runtimeConfig = useRuntimeConfig();
const apiEndpoint =
  (runtimeConfig.public as { solarDataEndpoint?: string }).solarDataEndpoint || "/api/solar-system";

const { data } = await useFetch<SolarSystemApiResponse>(apiEndpoint, {
  default: () => ({
    source: "mock" as const,
    generatedAt: new Date().toISOString(),
    sunPackages: [],
    repositories: [],
  }),
});

const solar = useSolarSystem(computed(() => data.value ?? null));

const {
  sunPackages,
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
  marqueeItemsLoop,
  planetPosition,
  moonPosition,
  openSelection,
  handlePointerMove,
  handlePointerLeave,
} = solar;

const isSelectionModalOpen = ref(false);

const handleOpenSelection = (selection: typeof selected.value) => {
  openSelection(selection);
  isSelectionModalOpen.value = true;
};

const handleOpenWatchlistProject = (projectId: string) => {
  const planet = planets.value.find((item) => item.id === projectId);
  if (!planet) return;

  handleOpenSelection({ type: "planet", planet });
};

// Small view-model value for the KPI card section.
const reposAffected = computed(
  () => projectHealth.value.filter((item) => item.outdated > 0).length
);
</script>

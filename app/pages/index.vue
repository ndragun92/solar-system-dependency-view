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

      <SolarDependencyAlertTicker :items="marqueeItemsLoop" />

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SolarSystemChart
          :planets="planets"
          :stars="stars"
          :center="center"
          :planet-position="planetPosition"
          :moon-position="moonPosition"
          @open-selection="openSelection"
          @pointer-move="handlePointerMove"
          @pointer-leave="handlePointerLeave"
        />

        <SolarDetailsPanel
          :selected="selected"
          :selected-title="selectedTitle"
          :sun-packages="sunPackages"
          :watchlist-projects="watchlistProjects"
          :watchlist-max-risk="watchlistMaxRisk"
          :upgrade-candidates="upgradeCandidates"
          @inspect-candidate="inspectCandidate"
        />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSolarSystem } from "../composables/useSolarSystem";

const solar = useSolarSystem();

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
  upgradeCandidates,
  marqueeItemsLoop,
  planetPosition,
  moonPosition,
  openSelection,
  inspectCandidate,
  handlePointerMove,
  handlePointerLeave,
} = solar;

// Small view-model value for the KPI card section.
const reposAffected = computed(
  () => projectHealth.value.filter((item) => item.outdated > 0).length
);
</script>

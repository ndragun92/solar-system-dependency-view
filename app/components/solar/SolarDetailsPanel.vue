<template>
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
          <p class="mt-2 text-xs text-slate-400">Current: {{ selected.moon.currentVersion }}</p>
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
        <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Fleet upgrade planner</p>
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
              @click="$emit('inspect-candidate', candidate)"
            >
              Inspect
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="text-xs text-slate-400">No upgrade actions required right now.</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import {
  badgeClass,
  statusToLabel,
  type ProjectHealth,
  type Selection,
  type SunPackage,
  type UpgradeCandidate,
} from "../../../shared/utils/solar-system";

const props = defineProps<{
  selected: Selection;
  selectedTitle: string;
  sunPackages: SunPackage[];
  watchlistProjects: ProjectHealth[];
  watchlistMaxRisk: number;
  upgradeCandidates: UpgradeCandidate[];
}>();

defineEmits<{
  (event: "inspect-candidate", candidate: UpgradeCandidate): void;
}>();

const detailsAside = ref<HTMLElement | null>(null);

watch(
  () => props.selected,
  async () => {
    // Keep newly selected details visible at the top of the panel.
    await nextTick();
    detailsAside.value?.scrollTo({ top: 0, behavior: "smooth" });
  },
  { deep: true }
);
</script>

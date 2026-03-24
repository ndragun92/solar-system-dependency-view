<template>
  <aside
    class="h-fit max-h-screen overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur"
  >
    <div>
      <div class="mb-3 flex items-center justify-between">
        <p class="text-xs uppercase tracking-widest text-slate-400">Repository watchlist</p>
        <span class="text-xs text-slate-500">highest risk first</span>
      </div>

      <ul class="space-y-2">
        <li
          v-for="item in watchlistProjects"
          :key="item.id"
          class="rounded-lg border border-slate-800 bg-slate-900/80"
        >
          <button
            type="button"
            class="w-full rounded-lg p-3 text-left transition hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            @click="emit('open-project', item.id)"
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

            <p class="mt-1 text-xs text-slate-400">
              {{ item.major }} major · {{ item.minor }} minor · {{ item.patch }} patch
            </p>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { type ProjectHealth } from "../../../shared/utils/solar-system";

defineProps<{
  watchlistProjects: ProjectHealth[];
  watchlistMaxRisk: number;
}>();

const emit = defineEmits<{
  (event: "open-project", projectId: string): void;
}>();
</script>

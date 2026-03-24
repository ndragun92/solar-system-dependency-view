<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
      @click.self="emit('close')"
    >
      <section
        class="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="selectedTitle"
      >
        <div class="mb-4 flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ selected.type }}</p>
            <h2 class="mt-1 text-xl font-semibold text-white">{{ selectedTitle }}</h2>
          </div>

          <button
            type="button"
            class="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            @click="emit('close')"
          >
            Close
          </button>
        </div>

        <div class="max-h-[65vh] space-y-3 overflow-y-auto text-sm text-slate-200">
          <template v-if="selected.type === 'sun'">
            <p class="text-slate-300">Available npm packages (latest versions)</p>
            <ul class="space-y-2">
              <li
                v-for="pkg in sunPackages"
                :key="pkg.name"
                class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
              >
                <span class="font-medium">{{ pkg.name }}</span>
                <span class="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                  {{ pkg.latestVersion }}
                </span>
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
                  <span
                    class="rounded-full px-2 py-1 text-xs"
                    :class="{
                      'bg-emerald-500/20 text-emerald-300': pkg.status === 'upToDate',
                      'bg-cyan-500/20 text-cyan-300': pkg.status === 'patchBehind',
                      'bg-amber-500/20 text-amber-300': pkg.status === 'minorBehind',
                      'bg-rose-500/20 text-rose-300': pkg.status === 'majorBehind',
                    }"
                  >
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
                :class="{
                  'bg-emerald-500/20 text-emerald-300': selected.moon.status === 'upToDate',
                  'bg-cyan-500/20 text-cyan-300': selected.moon.status === 'patchBehind',
                  'bg-amber-500/20 text-amber-300': selected.moon.status === 'minorBehind',
                  'bg-rose-500/20 text-rose-300': selected.moon.status === 'majorBehind',
                }"
              >
                {{ selected.moon.statusLabel }}
              </span>
            </div>
          </template>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { type Selection, type SunPackage } from "../../../shared/utils/solar-system";

defineProps<{
  isOpen: boolean;
  selected: Selection;
  selectedTitle: string;
  sunPackages: SunPackage[];
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();
</script>

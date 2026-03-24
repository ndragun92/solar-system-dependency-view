<template>
  <section class="fixed bottom-0 left-0 right-0 w-full">
    <div class="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
      <p class="text-xs uppercase tracking-[0.16em] text-slate-400 opacity-0">Dependency alert</p>
      <div class="hidden items-center gap-2 md:flex bg-slate-900/70 pr-4">
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
        <button
          v-for="(item, index) in items"
          :key="`${item.id}-${index}`"
          type="button"
          class="inline-flex items-center rounded-full border px-3 py-1 text-xs transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          :class="{
            'bg-cyan-500/20 text-cyan-300': item.status === 'patchBehind',
            'bg-amber-500/20 text-amber-300': item.status === 'minorBehind',
            'bg-rose-500/20 text-rose-300': item.status === 'majorBehind',
          }"
          @click="emit('open-selection', item.selection)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type Selection } from "../../../shared/utils/solar-system";

defineProps<{
  items: {
    id: string;
    label: string;
    status: "majorBehind" | "minorBehind" | "patchBehind";
    selection: Selection;
  }[];
}>();

const emit = defineEmits<{
  (event: "open-selection", payload: Selection): void;
}>();
</script>

<style scoped>
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

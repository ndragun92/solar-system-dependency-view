<template>
  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <article
      class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
    >
      <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Repositories</p>
      <p class="mt-2 text-2xl font-semibold text-white">{{ repositories }}</p>
      <p class="mt-1 text-xs text-slate-400">active projects in orbit</p>
    </article>

    <article
      class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
    >
      <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Tracked packages</p>
      <p class="mt-2 text-2xl font-semibold text-white">{{ trackedPackages }}</p>
      <p class="mt-1 text-xs text-slate-400">dependencies mapped in moons</p>
    </article>

    <article
      class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
    >
      <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Outdated packages</p>
      <p class="mt-2 text-2xl font-semibold text-amber-300">{{ outdatedPackages }}</p>
      <p class="mt-1 text-xs text-slate-400">{{ reposAffected }} repos affected</p>
    </article>

    <article
      class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.02)]"
    >
      <p class="text-xs uppercase tracking-[0.15em] text-slate-400">Fleet health</p>
      <p class="mt-2 text-2xl font-semibold text-emerald-300">{{ fleetHealthScore }}%</p>
      <p class="mt-1 text-xs text-slate-400">up-to-date ratio across all moons</p>
    </article>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  repositories: number;
  trackedPackages: number;
  outdatedPackages: number;
  reposAffected: number;
  fleetHealthScore: number;
}>();
</script>

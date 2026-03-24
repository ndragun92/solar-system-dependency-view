<template>
  <div class="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 md:p-5">
    <svg
      viewBox="0 0 1000 1000"
      class="h-auto w-full"
      role="img"
      aria-label="Animated solar system with repositories and package status"
      @pointermove="$emit('pointer-move', $event)"
      @pointerleave="$emit('pointer-leave')"
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
        <circle :cx="center" :cy="center" r="470" fill="#020617" />
        <circle :cx="center" :cy="center" r="420" fill="none" stroke="#0f172a" stroke-width="2" />
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
        :cx="center"
        :cy="center"
        :r="planet.orbitRadius"
        fill="none"
        stroke="#334155"
        stroke-width="1.5"
        stroke-dasharray="6 10"
      />

      <g class="cursor-pointer" @click="$emit('open-selection', { type: 'sun' })">
        <circle :cx="center" :cy="center" r="58" fill="url(#sunGradient)" class="drop-shadow-2xl" />
        <text
          :x="center"
          :y="center + 6"
          text-anchor="middle"
          class="select-none fill-slate-900 text-xl font-bold"
        >
          SUN
        </text>
      </g>

      <g v-for="planet in planets" :key="planet.id">
        <g
          :transform="`translate(${planetPosition(planet).x} ${planetPosition(planet).y})`"
          class="cursor-pointer"
          @click="$emit('open-selection', { type: 'planet', planet })"
        >
          <circle :r="planet.size" fill="url(#planetGradient)" class="drop-shadow-lg" />
          <text y="-22" text-anchor="middle" class="select-none fill-slate-100 text-sm font-medium">
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
            @click.stop="$emit('open-selection', { type: 'moon', planet, moon })"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import {
  statusColor,
  type Moon,
  type Planet,
  type Point,
  type Selection,
  type Star,
} from "../../../shared/utils/solar-system";

defineProps<{
  planets: Planet[];
  stars: Star[];
  center: number;
  planetPosition: (planet: Planet) => Point;
  moonPosition: (planet: Planet, moon: Moon, moonIndex: number) => Point;
}>();

defineEmits<{
  (event: "open-selection", payload: Selection): void;
  (event: "pointer-move", payload: PointerEvent): void;
  (event: "pointer-leave"): void;
}>();
</script>

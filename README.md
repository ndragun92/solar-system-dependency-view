# Solar System Dependency Dashboard (Nuxt 4)

Interactive dependency dashboard that visualizes repositories as planets and packages as moons.

## Stack

- Nuxt 4 + Nitro
- Vue 3 + TypeScript
- Tailwind CSS 4

## What it does

- Loads dependency data via Nuxt server API route: `/api/solar-system`
- Uses real GitHub repository data when GitHub env config is provided
- Falls back to deterministic mocked data when GitHub config/token is missing
- Renders repository/package status and risk insights in a solar-system UI

## Project structure (important parts)

- `app/pages/index.vue` — page-level `useFetch` and UI composition
- `app/composables/useSolarSystem.ts` — client-side view-model/state logic (no fetching)
- `server/api/solar-system.get.ts` — Nitro API route for GitHub fetching + mock fallback
- `shared/utils/*` — shared types and utility logic for app + server

## Environment variables

See `.env.example`.

Required for live GitHub mode:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPOS` (comma-separated)

Optional:

- `GITHUB_API_BASE` (default: `https://api.github.com`)
- `NUXT_PUBLIC_SOLAR_DATA_ENDPOINT` (default: `/api/solar-system`)

If required GitHub variables are missing, server route returns mocked payload automatically.

## Setup

1. Install dependencies
2. Copy `.env.example` to `.env`
3. (Optional) Fill GitHub variables for live data
4. Run development server

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run typecheck` — Nuxt type checks
- `npm run lint` — ESLint

## Data flow

1. `index.vue` calls `useFetch('/api/solar-system')`
2. Nitro route fetches GitHub repository `package.json` files (if configured)
3. Route normalizes dependency versions and builds API response
4. Route returns mocked data if GitHub config is missing or request fails
5. `useSolarSystem` transforms fetched response into chart-friendly computed data

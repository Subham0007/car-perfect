# Car Perfect

A ratings site for Indian car buyers: pick a model and see it scored on **Reliability**, **Safety**, **Repairability**, and **Value for money**, plus one overall score — with a transparent, expandable breakdown of *why* it scored that way.

This repo is currently the **frontend-only phase**: the UI is fully functional against local mock JSON fixtures shaped exactly like the tables the real backend will use, so wiring up a real data source later touches one file, not the components.

## Stack

Vue 3 (`<script setup>`) + Vite + TypeScript + Vue Router, tested with Vitest and @vue/test-utils.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # run the test suite
npm run build     # type-check + production build
```

## Pages

- **Home** (`/`) — explains why these ratings matter, with a peek-style carousel of cars sorted by overall score
- **Browse** (`/browse`) — filterable grid of all cars, sortable by score
- **Model detail** (`/cars/:id`) — overall score plus four pillar gauges; click a pillar to expand the raw signals behind its score (recalls, NCAP rating, service network, parts pricing, owner sentiment)

## How scoring works (this phase)

Scores are **not** computed in the frontend and **not** produced by a trained model. They're rule-based: recalls, crash-test ratings, service network size, parts pricing, and forum sentiment are combined into transparent, weighted pillar scores. This phase reads pre-computed scores from mock data — the real scoring pipeline (Python, batch) is a later phase. See [`docs/superpowers/specs/2026-09-23-car-rating-scoring-design.md`](docs/superpowers/specs/2026-09-23-car-rating-scoring-design.md) for the full design, including two deliberate missing-data rules:

- A signal that's simply unavailable (e.g. no CSI report on file) is shown as missing, never guessed.
- A car **not** crash-tested by Global NCAP or Bharat NCAP is treated as 0★ for safety — untested is itself a signal worth penalizing, not a gap to ignore.

## Data

`src/services/carDataService.ts` is the **only** file that reads the mock fixtures in `src/data/mock/*.json`. Every function it exports returns a `Promise`, mirroring the shape of the real Supabase calls that will eventually replace it — swapping in a real backend means editing this one file.

The mock dataset covers **10 representative models across 6 companies** (placeholder for the spec's eventual top-25), chosen to exercise the edge cases above (e.g. Baleno and Scorpio-N are NCAP-untested; Seltos has no CSI report on file).

## Project docs

- [`docs/superpowers/specs/2026-09-23-car-rating-scoring-design.md`](docs/superpowers/specs/2026-09-23-car-rating-scoring-design.md) — full design: architecture, data model, scoring formula, missing-data policy
- [`docs/superpowers/plans/2026-09-23-frontend-mock-data.md`](docs/superpowers/plans/2026-09-23-frontend-mock-data.md) — the 13-task implementation plan for this phase

## Status / backlog

Not yet built (by design, out of scope for this phase): real Supabase backend, the Python data pipeline (recalls/NCAP/Team-BHP sentiment scraping and score computation), user-submitted ratings and auth, a Compare page, and the full top-25 model list. See the plan doc's Backlog section for details.

# Car Rating Frontend (Mock Data) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional Vue 3 + Vite + TypeScript frontend for the car rating website, reading from local dummy JSON fixtures shaped exactly like the future Supabase tables, so the UI (Homepage, Browse page, Model detail page) is fully clickable and demoable before any real backend exists.

**Architecture:** A typed data-access layer (`src/services/carDataService.ts`) is the only place that knows about the mock JSON files, and every function returns a `Promise` even though the mock reads are synchronous — this mirrors the shape of the real Supabase client calls that will replace it later, so swapping in real Supabase queries in a future phase means editing only this one file, not any component or view. Views (`HomeView`, `BrowseView`, `ModelDetailView`) call the service in `onMounted` and pass plain data down to small presentational components.

**Tech Stack:** Vue 3 (`<script setup>`), Vite, TypeScript, Vue Router 4, Vitest + @vue/test-utils for testing. No Supabase client, no Python pipeline, no auth in this phase.

**Spec:** `docs/superpowers/specs/2026-09-23-car-rating-scoring-design.md`

## Global Constraints

- Market is India only; the full spec targets the top 25 popular Indian models, but this phase's mock dataset covers 10 representative models across 6 companies (chosen to exercise every edge case: recalls, no recalls, NCAP-tested, NCAP-untested, missing CSI report) — expanding the dataset to the full 25 is a follow-up data task, not a frontend blocker.
- No user-submitted ratings/reviews and no auth in this phase (backlog per spec).
- Sentiment data source is Team-BHP only (mocked here; no Instagram, no live scraping in this phase).
- Scoring is rule-based, not ML-trained (per spec) — this phase does not implement the scoring formula at all; it only *displays* already-computed scores, exactly as the real pipeline will hand them to the frontend later.
- Missing-data policy from the spec applies to how the mock data itself is authored: a genuinely missing signal (e.g. no CSI report) is simply absent/`null`, not defaulted; an NCAP-untested car has `tested: false` and `adultStars`/`childStars` set to `null`, with its `safetyScore` in `computedScores.json` already reflecting the spec's "treat as 0★" rule.
- Frontend framework is Vue 3 + Vite + TypeScript, per explicit user request — no other framework substitutions.

---

## Task 1: Project scaffold (Vite + Vue 3 + TypeScript + Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/vite-env.d.ts`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Test: `src/App.test.ts`

**Interfaces:**
- Produces: a working `npm run dev` / `npm run build` / `npm test` toolchain that every later task relies on.

- [ ] **Step 1: Create the config files**

`package.json`:

```json
{
  "name": "car-perfect-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "@vue/test-utils": "^2.4.5",
    "jsdom": "^24.0.0",
    "typescript": "^5.4.5",
    "vite": "^5.2.8",
    "vitest": "^1.5.0",
    "vue-tsc": "^2.0.11"
  }
}
```

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
  },
})
```

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Car Perfect</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Write the failing smoke test**

`src/App.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders the app title', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Car Perfect')
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run src/App.test.ts`
Expected: FAIL — `App.vue` does not exist yet (module resolution error).

- [ ] **Step 5: Create the minimal App and entry point**

`src/App.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <div id="app-root">
    <h1>Car Perfect</h1>
  </div>
</template>
```

`src/main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/App.test.ts`
Expected: PASS

- [ ] **Step 7: Verify the full toolchain builds**

Run: `npm run build`
Expected: type-checks and builds cleanly, producing a `dist/` directory.

- [ ] **Step 8: Commit**

```bash
git init
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/vite-env.d.ts src/main.ts src/App.vue src/App.test.ts .gitignore
git commit -m "chore: scaffold Vue 3 + Vite + TypeScript + Vitest project"
```

(Create a `.gitignore` first containing at least `node_modules/`, `dist/` if one is not already present.)

---

## Task 2: Domain types + companies/models mock data + core service functions

**Files:**
- Create: `src/types/car.ts`
- Create: `src/data/mock/companies.json`
- Create: `src/data/mock/models.json`
- Create: `src/services/carDataService.ts`
- Test: `src/services/carDataService.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - Types: `Company`, `Model`, `RecallSeverity`, `Recall`, `SafetySource`, `SafetyRating`, `CsiReport`, `DealershipData`, `PartsPrice`, `ForumAspect`, `ForumSentiment`, `ComputedScore`, `ModelRawSignals` (all defined now, used by later tasks).
  - `getCompanies(): Promise<Company[]>`
  - `getModels(): Promise<Model[]>`
  - `getModelById(modelId: string): Promise<Model | null>`

- [ ] **Step 1: Define all domain types**

`src/types/car.ts`:

```ts
export interface Company {
  id: string
  name: string
  logoUrl: string
}

export interface Model {
  id: string
  companyId: string
  name: string
  segment: string
  launchYear: number
  priceMin: number
  priceMax: number
}

export type RecallSeverity = 'low' | 'medium' | 'high'

export interface Recall {
  id: string
  modelId: string
  date: string
  severity: RecallSeverity
  description: string
}

export type SafetySource = 'global_ncap' | 'bharat_ncap'

export interface SafetyRating {
  id: string
  modelId: string
  source: SafetySource
  tested: boolean
  adultStars: number | null
  childStars: number | null
  testedVariant: string | null
  abs: boolean
  esc: boolean
  airbagsCount: number
  adasPresent: boolean
}

export interface CsiReport {
  id: string
  modelId: string
  source: string
  year: number
  score: number
}

export interface DealershipData {
  id: string
  companyId: string
  serviceCenterCount: number
  dealershipCount: number
}

export interface PartsPrice {
  id: string
  modelId: string
  avgPriceIndex: number
}

export type ForumAspect = 'reliability' | 'service' | 'value'

export interface ForumSentiment {
  id: string
  modelId: string
  source: string
  threadUrl: string
  aspect: ForumAspect
  sentimentScore: number
  collectedAt: string
}

export interface ComputedScore {
  modelId: string
  reliabilityScore: number
  safetyScore: number
  repairabilityScore: number
  valueScore: number
  overallScore: number
  lastComputedAt: string
}

export interface ModelRawSignals {
  recalls: Recall[]
  safetyRating: SafetyRating | null
  csiReport: CsiReport | null
  dealership: DealershipData | null
  partsPrice: PartsPrice | null
  forumSentiment: ForumSentiment[]
}
```

- [ ] **Step 2: Create the companies and models mock data**

`src/data/mock/companies.json`:

```json
[
  { "id": "maruti", "name": "Maruti Suzuki", "logoUrl": "/logos/maruti.svg" },
  { "id": "hyundai", "name": "Hyundai", "logoUrl": "/logos/hyundai.svg" },
  { "id": "tata", "name": "Tata Motors", "logoUrl": "/logos/tata.svg" },
  { "id": "mahindra", "name": "Mahindra", "logoUrl": "/logos/mahindra.svg" },
  { "id": "kia", "name": "Kia", "logoUrl": "/logos/kia.svg" },
  { "id": "honda", "name": "Honda", "logoUrl": "/logos/honda.svg" }
]
```

`src/data/mock/models.json`:

```json
[
  { "id": "swift", "companyId": "maruti", "name": "Swift", "segment": "Hatchback", "launchYear": 2024, "priceMin": 649000, "priceMax": 927000 },
  { "id": "brezza", "companyId": "maruti", "name": "Brezza", "segment": "Compact SUV", "launchYear": 2022, "priceMin": 841000, "priceMax": 1379000 },
  { "id": "baleno", "companyId": "maruti", "name": "Baleno", "segment": "Premium Hatchback", "launchYear": 2022, "priceMin": 674000, "priceMax": 977000 },
  { "id": "creta", "companyId": "hyundai", "name": "Creta", "segment": "Compact SUV", "launchYear": 2024, "priceMin": 1110000, "priceMax": 2020000 },
  { "id": "i20", "companyId": "hyundai", "name": "i20", "segment": "Premium Hatchback", "launchYear": 2023, "priceMin": 720000, "priceMax": 1120000 },
  { "id": "nexon", "companyId": "tata", "name": "Nexon", "segment": "Compact SUV", "launchYear": 2023, "priceMin": 800000, "priceMax": 1560000 },
  { "id": "punch", "companyId": "tata", "name": "Punch", "segment": "Micro SUV", "launchYear": 2023, "priceMin": 610000, "priceMax": 1020000 },
  { "id": "scorpio-n", "companyId": "mahindra", "name": "Scorpio-N", "segment": "SUV", "launchYear": 2022, "priceMin": 1370000, "priceMax": 2450000 },
  { "id": "seltos", "companyId": "kia", "name": "Seltos", "segment": "Compact SUV", "launchYear": 2023, "priceMin": 1090000, "priceMax": 2020000 },
  { "id": "city", "companyId": "honda", "name": "City", "segment": "Sedan", "launchYear": 2023, "priceMin": 1180000, "priceMax": 1600000 }
]
```

- [ ] **Step 3: Write the failing service tests**

`src/services/carDataService.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getCompanies, getModels, getModelById } from './carDataService'

describe('carDataService: companies and models', () => {
  it('getCompanies returns all 6 mock companies', async () => {
    const companies = await getCompanies()
    expect(companies).toHaveLength(6)
    expect(companies.map((c) => c.id)).toContain('maruti')
  })

  it('getModels returns all 10 mock models', async () => {
    const models = await getModels()
    expect(models).toHaveLength(10)
  })

  it('getModelById returns the matching model', async () => {
    const model = await getModelById('scorpio-n')
    expect(model?.name).toBe('Scorpio-N')
  })

  it('getModelById returns null for an unknown id', async () => {
    const model = await getModelById('does-not-exist')
    expect(model).toBeNull()
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: FAIL — `./carDataService` does not exist yet.

- [ ] **Step 5: Implement the service functions**

`src/services/carDataService.ts`:

```ts
import companiesData from '../data/mock/companies.json'
import modelsData from '../data/mock/models.json'
import type { Company, Model } from '../types/car'

const companies = companiesData as Company[]
const models = modelsData as Model[]

export async function getCompanies(): Promise<Company[]> {
  return companies
}

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(modelId: string): Promise<Model | null> {
  return models.find((m) => m.id === modelId) ?? null
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/types/car.ts src/data/mock/companies.json src/data/mock/models.json src/services/carDataService.ts src/services/carDataService.test.ts
git commit -m "feat: add domain types, companies/models mock data, and core data service"
```

---

## Task 3: Raw signal mock data + getModelRawSignals

**Files:**
- Create: `src/data/mock/recalls.json`
- Create: `src/data/mock/safetyRatings.json`
- Create: `src/data/mock/csiReports.json`
- Create: `src/data/mock/dealershipData.json`
- Create: `src/data/mock/partsPrice.json`
- Create: `src/data/mock/forumSentiment.json`
- Modify: `src/services/carDataService.ts`
- Modify: `src/services/carDataService.test.ts`

**Interfaces:**
- Consumes: `Model`, `getModelById` from Task 2.
- Produces: `getModelRawSignals(modelId: string): Promise<ModelRawSignals>` — used by `PillarBreakdown`/`ModelDetailView` in later tasks.

- [ ] **Step 1: Create the raw signal mock data**

`src/data/mock/recalls.json` (only 4 of the 10 models have recalls — deliberate, to test the "no recalls" case too):

```json
[
  { "id": "r1", "modelId": "swift", "date": "2023-03-10", "severity": "low", "description": "Fuel pump wiring inspection" },
  { "id": "r2", "modelId": "baleno", "date": "2022-07-01", "severity": "medium", "description": "Airbag control unit software update" },
  { "id": "r3", "modelId": "scorpio-n", "date": "2023-01-15", "severity": "high", "description": "Steering column bolt replacement" },
  { "id": "r4", "modelId": "city", "date": "2021-11-20", "severity": "low", "description": "Fuel pump replacement" }
]
```

`src/data/mock/safetyRatings.json` (note `baleno` and `scorpio-n` are deliberately `tested: false` — the NCAP-untested edge case from the spec):

```json
[
  { "id": "s1", "modelId": "swift", "source": "global_ncap", "tested": true, "adultStars": 2, "childStars": 2, "testedVariant": "base", "abs": true, "esc": false, "airbagsCount": 2, "adasPresent": false },
  { "id": "s2", "modelId": "brezza", "source": "global_ncap", "tested": true, "adultStars": 4, "childStars": 4, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": false },
  { "id": "s3", "modelId": "baleno", "source": "global_ncap", "tested": false, "adultStars": null, "childStars": null, "testedVariant": null, "abs": true, "esc": false, "airbagsCount": 2, "adasPresent": false },
  { "id": "s4", "modelId": "creta", "source": "bharat_ncap", "tested": true, "adultStars": 5, "childStars": 5, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": true },
  { "id": "s5", "modelId": "i20", "source": "global_ncap", "tested": true, "adultStars": 3, "childStars": 3, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": false },
  { "id": "s6", "modelId": "nexon", "source": "global_ncap", "tested": true, "adultStars": 5, "childStars": 5, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": true },
  { "id": "s7", "modelId": "punch", "source": "global_ncap", "tested": true, "adultStars": 5, "childStars": 5, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": false },
  { "id": "s8", "modelId": "scorpio-n", "source": "global_ncap", "tested": false, "adultStars": null, "childStars": null, "testedVariant": null, "abs": true, "esc": true, "airbagsCount": 2, "adasPresent": false },
  { "id": "s9", "modelId": "seltos", "source": "bharat_ncap", "tested": true, "adultStars": 3, "childStars": 4, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": true },
  { "id": "s10", "modelId": "city", "source": "global_ncap", "tested": true, "adultStars": 4, "childStars": 4, "testedVariant": "top", "abs": true, "esc": true, "airbagsCount": 6, "adasPresent": false }
]
```

`src/data/mock/csiReports.json` (note `seltos` is deliberately absent — the "missing data" edge case from the spec):

```json
[
  { "id": "c1", "modelId": "swift", "source": "JD Power India CSI", "year": 2023, "score": 780 },
  { "id": "c2", "modelId": "brezza", "source": "JD Power India CSI", "year": 2023, "score": 820 },
  { "id": "c3", "modelId": "baleno", "source": "JD Power India CSI", "year": 2023, "score": 800 },
  { "id": "c4", "modelId": "creta", "source": "JD Power India CSI", "year": 2023, "score": 810 },
  { "id": "c5", "modelId": "i20", "source": "JD Power India CSI", "year": 2023, "score": 790 },
  { "id": "c6", "modelId": "nexon", "source": "JD Power India CSI", "year": 2023, "score": 770 },
  { "id": "c7", "modelId": "punch", "source": "JD Power India CSI", "year": 2023, "score": 760 },
  { "id": "c8", "modelId": "scorpio-n", "source": "JD Power India CSI", "year": 2023, "score": 800 },
  { "id": "c9", "modelId": "city", "source": "JD Power India CSI", "year": 2023, "score": 830 }
]
```

`src/data/mock/dealershipData.json` (company-level, not per-model):

```json
[
  { "id": "d1", "companyId": "maruti", "serviceCenterCount": 4200, "dealershipCount": 3500 },
  { "id": "d2", "companyId": "hyundai", "serviceCenterCount": 1800, "dealershipCount": 1400 },
  { "id": "d3", "companyId": "tata", "serviceCenterCount": 1600, "dealershipCount": 1200 },
  { "id": "d4", "companyId": "mahindra", "serviceCenterCount": 1200, "dealershipCount": 900 },
  { "id": "d5", "companyId": "kia", "serviceCenterCount": 500, "dealershipCount": 400 },
  { "id": "d6", "companyId": "honda", "serviceCenterCount": 900, "dealershipCount": 700 }
]
```

`src/data/mock/partsPrice.json` (`avgPriceIndex`: 1.0 = segment average, lower is cheaper):

```json
[
  { "id": "p1", "modelId": "swift", "avgPriceIndex": 0.85 },
  { "id": "p2", "modelId": "brezza", "avgPriceIndex": 0.95 },
  { "id": "p3", "modelId": "baleno", "avgPriceIndex": 0.88 },
  { "id": "p4", "modelId": "creta", "avgPriceIndex": 1.10 },
  { "id": "p5", "modelId": "i20", "avgPriceIndex": 1.00 },
  { "id": "p6", "modelId": "nexon", "avgPriceIndex": 1.05 },
  { "id": "p7", "modelId": "punch", "avgPriceIndex": 0.98 },
  { "id": "p8", "modelId": "scorpio-n", "avgPriceIndex": 1.20 },
  { "id": "p9", "modelId": "seltos", "avgPriceIndex": 1.15 },
  { "id": "p10", "modelId": "city", "avgPriceIndex": 1.10 }
]
```

`src/data/mock/forumSentiment.json` (Team-BHP only, three aspects per model):

```json
[
  { "id": "f1", "modelId": "swift", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/swift-review", "aspect": "reliability", "sentimentScore": 72, "collectedAt": "2024-05-01" },
  { "id": "f2", "modelId": "swift", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/swift-service", "aspect": "service", "sentimentScore": 78, "collectedAt": "2024-05-01" },
  { "id": "f3", "modelId": "swift", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/swift-value", "aspect": "value", "sentimentScore": 80, "collectedAt": "2024-05-01" },

  { "id": "f4", "modelId": "brezza", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/brezza-review", "aspect": "reliability", "sentimentScore": 75, "collectedAt": "2024-05-01" },
  { "id": "f5", "modelId": "brezza", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/brezza-service", "aspect": "service", "sentimentScore": 74, "collectedAt": "2024-05-01" },
  { "id": "f6", "modelId": "brezza", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/brezza-value", "aspect": "value", "sentimentScore": 70, "collectedAt": "2024-05-01" },

  { "id": "f7", "modelId": "baleno", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/baleno-review", "aspect": "reliability", "sentimentScore": 68, "collectedAt": "2024-05-01" },
  { "id": "f8", "modelId": "baleno", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/baleno-service", "aspect": "service", "sentimentScore": 71, "collectedAt": "2024-05-01" },
  { "id": "f9", "modelId": "baleno", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/baleno-value", "aspect": "value", "sentimentScore": 73, "collectedAt": "2024-05-01" },

  { "id": "f10", "modelId": "creta", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/creta-review", "aspect": "reliability", "sentimentScore": 80, "collectedAt": "2024-05-01" },
  { "id": "f11", "modelId": "creta", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/creta-service", "aspect": "service", "sentimentScore": 76, "collectedAt": "2024-05-01" },
  { "id": "f12", "modelId": "creta", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/creta-value", "aspect": "value", "sentimentScore": 65, "collectedAt": "2024-05-01" },

  { "id": "f13", "modelId": "i20", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/i20-review", "aspect": "reliability", "sentimentScore": 74, "collectedAt": "2024-05-01" },
  { "id": "f14", "modelId": "i20", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/i20-service", "aspect": "service", "sentimentScore": 72, "collectedAt": "2024-05-01" },
  { "id": "f15", "modelId": "i20", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/i20-value", "aspect": "value", "sentimentScore": 70, "collectedAt": "2024-05-01" },

  { "id": "f16", "modelId": "nexon", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/nexon-review", "aspect": "reliability", "sentimentScore": 66, "collectedAt": "2024-05-01" },
  { "id": "f17", "modelId": "nexon", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/nexon-service", "aspect": "service", "sentimentScore": 60, "collectedAt": "2024-05-01" },
  { "id": "f18", "modelId": "nexon", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/nexon-value", "aspect": "value", "sentimentScore": 75, "collectedAt": "2024-05-01" },

  { "id": "f19", "modelId": "punch", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/punch-review", "aspect": "reliability", "sentimentScore": 70, "collectedAt": "2024-05-01" },
  { "id": "f20", "modelId": "punch", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/punch-service", "aspect": "service", "sentimentScore": 68, "collectedAt": "2024-05-01" },
  { "id": "f21", "modelId": "punch", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/punch-value", "aspect": "value", "sentimentScore": 77, "collectedAt": "2024-05-01" },

  { "id": "f22", "modelId": "scorpio-n", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/scorpio-n-review", "aspect": "reliability", "sentimentScore": 62, "collectedAt": "2024-05-01" },
  { "id": "f23", "modelId": "scorpio-n", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/scorpio-n-service", "aspect": "service", "sentimentScore": 58, "collectedAt": "2024-05-01" },
  { "id": "f24", "modelId": "scorpio-n", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/scorpio-n-value", "aspect": "value", "sentimentScore": 72, "collectedAt": "2024-05-01" },

  { "id": "f25", "modelId": "seltos", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/seltos-review", "aspect": "reliability", "sentimentScore": 71, "collectedAt": "2024-05-01" },
  { "id": "f26", "modelId": "seltos", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/seltos-service", "aspect": "service", "sentimentScore": 69, "collectedAt": "2024-05-01" },
  { "id": "f27", "modelId": "seltos", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/seltos-value", "aspect": "value", "sentimentScore": 60, "collectedAt": "2024-05-01" },

  { "id": "f28", "modelId": "city", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/city-review", "aspect": "reliability", "sentimentScore": 82, "collectedAt": "2024-05-01" },
  { "id": "f29", "modelId": "city", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/city-service", "aspect": "service", "sentimentScore": 80, "collectedAt": "2024-05-01" },
  { "id": "f30", "modelId": "city", "source": "teambhp", "threadUrl": "https://www.team-bhp.com/forum/city-value", "aspect": "value", "sentimentScore": 66, "collectedAt": "2024-05-01" }
]
```

- [ ] **Step 2: Add the failing tests for getModelRawSignals**

Append to `src/services/carDataService.test.ts`:

```ts
import { getModelRawSignals } from './carDataService'

describe('carDataService: getModelRawSignals', () => {
  it('includes recalls for a model that has them', async () => {
    const signals = await getModelRawSignals('scorpio-n')
    expect(signals.recalls).toHaveLength(1)
    expect(signals.recalls[0].severity).toBe('high')
  })

  it('returns an empty recalls array for a model with no recalls', async () => {
    const signals = await getModelRawSignals('brezza')
    expect(signals.recalls).toHaveLength(0)
  })

  it('marks an NCAP-untested model as tested: false with null star ratings', async () => {
    const signals = await getModelRawSignals('baleno')
    expect(signals.safetyRating?.tested).toBe(false)
    expect(signals.safetyRating?.adultStars).toBeNull()
  })

  it('returns null csiReport when the model has no CSI report on file', async () => {
    const signals = await getModelRawSignals('seltos')
    expect(signals.csiReport).toBeNull()
  })

  it('resolves dealership data via the model\'s companyId', async () => {
    const signals = await getModelRawSignals('nexon')
    expect(signals.dealership?.serviceCenterCount).toBe(1600)
  })

  it('includes all three forum sentiment aspects for a model', async () => {
    const signals = await getModelRawSignals('city')
    expect(signals.forumSentiment).toHaveLength(3)
    expect(signals.forumSentiment.map((s) => s.aspect).sort()).toEqual(['reliability', 'service', 'value'])
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: FAIL — `getModelRawSignals` is not exported yet.

- [ ] **Step 4: Implement getModelRawSignals**

Update `src/services/carDataService.ts` to add the new imports and function:

```ts
import companiesData from '../data/mock/companies.json'
import modelsData from '../data/mock/models.json'
import recallsData from '../data/mock/recalls.json'
import safetyRatingsData from '../data/mock/safetyRatings.json'
import csiReportsData from '../data/mock/csiReports.json'
import dealershipDataRaw from '../data/mock/dealershipData.json'
import partsPriceData from '../data/mock/partsPrice.json'
import forumSentimentData from '../data/mock/forumSentiment.json'
import type {
  Company,
  Model,
  Recall,
  SafetyRating,
  CsiReport,
  DealershipData,
  PartsPrice,
  ForumSentiment,
  ModelRawSignals,
} from '../types/car'

const companies = companiesData as Company[]
const models = modelsData as Model[]
const recalls = recallsData as Recall[]
const safetyRatings = safetyRatingsData as SafetyRating[]
const csiReports = csiReportsData as CsiReport[]
const dealershipData = dealershipDataRaw as DealershipData[]
const partsPrice = partsPriceData as PartsPrice[]
const forumSentiment = forumSentimentData as ForumSentiment[]

export async function getCompanies(): Promise<Company[]> {
  return companies
}

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(modelId: string): Promise<Model | null> {
  return models.find((m) => m.id === modelId) ?? null
}

export async function getModelRawSignals(modelId: string): Promise<ModelRawSignals> {
  const model = await getModelById(modelId)
  const companyId = model?.companyId ?? null

  return {
    recalls: recalls.filter((r) => r.modelId === modelId),
    safetyRating: safetyRatings.find((s) => s.modelId === modelId) ?? null,
    csiReport: csiReports.find((c) => c.modelId === modelId) ?? null,
    dealership: dealershipData.find((d) => d.companyId === companyId) ?? null,
    partsPrice: partsPrice.find((p) => p.modelId === modelId) ?? null,
    forumSentiment: forumSentiment.filter((f) => f.modelId === modelId),
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: PASS (10 tests total)

- [ ] **Step 6: Commit**

```bash
git add src/data/mock/recalls.json src/data/mock/safetyRatings.json src/data/mock/csiReports.json src/data/mock/dealershipData.json src/data/mock/partsPrice.json src/data/mock/forumSentiment.json src/services/carDataService.ts src/services/carDataService.test.ts
git commit -m "feat: add raw signal mock data and getModelRawSignals"
```

---

## Task 4: Computed scores mock data + score getters

**Files:**
- Create: `src/data/mock/computedScores.json`
- Modify: `src/services/carDataService.ts`
- Modify: `src/services/carDataService.test.ts`

**Interfaces:**
- Consumes: `ComputedScore` type from Task 2.
- Produces: `getComputedScore(modelId: string): Promise<ComputedScore | null>`, `getAllComputedScores(): Promise<ComputedScore[]>`.

- [ ] **Step 1: Create the computed scores mock data**

These are hand-authored to be consistent with the raw signals above (e.g. `baleno` and `scorpio-n` have low `safetyScore` because they're NCAP-untested; `scorpio-n` also has the lowest `overallScore` because it combines a high-severity recall with untested safety and the highest parts-price index).

`src/data/mock/computedScores.json`:

```json
[
  { "modelId": "swift", "reliabilityScore": 71, "safetyScore": 40, "repairabilityScore": 86, "valueScore": 81, "overallScore": 70, "lastComputedAt": "2024-05-02" },
  { "modelId": "brezza", "reliabilityScore": 84, "safetyScore": 84, "repairabilityScore": 82, "valueScore": 73, "overallScore": 81, "lastComputedAt": "2024-05-02" },
  { "modelId": "baleno", "reliabilityScore": 73, "safetyScore": 14, "repairabilityScore": 83, "valueScore": 77, "overallScore": 62, "lastComputedAt": "2024-05-02" },
  { "modelId": "creta", "reliabilityScore": 85, "safetyScore": 100, "repairabilityScore": 66, "valueScore": 63, "overallScore": 79, "lastComputedAt": "2024-05-02" },
  { "modelId": "i20", "reliabilityScore": 82, "safetyScore": 66, "repairabilityScore": 71, "valueScore": 70, "overallScore": 72, "lastComputedAt": "2024-05-02" },
  { "modelId": "nexon", "reliabilityScore": 79, "safetyScore": 100, "repairabilityScore": 62, "valueScore": 72, "overallScore": 78, "lastComputedAt": "2024-05-02" },
  { "modelId": "punch", "reliabilityScore": 79, "safetyScore": 94, "repairabilityScore": 69, "valueScore": 81, "overallScore": 81, "lastComputedAt": "2024-05-02" },
  { "modelId": "scorpio-n", "reliabilityScore": 63, "safetyScore": 20, "repairabilityScore": 50, "valueScore": 64, "overallScore": 49, "lastComputedAt": "2024-05-02" },
  { "modelId": "seltos", "reliabilityScore": 82, "safetyScore": 82, "repairabilityScore": 51, "valueScore": 59, "overallScore": 69, "lastComputedAt": "2024-05-02" },
  { "modelId": "city", "reliabilityScore": 82, "safetyScore": 78, "repairabilityScore": 63, "valueScore": 62, "overallScore": 71, "lastComputedAt": "2024-05-02" }
]
```

- [ ] **Step 2: Add the failing tests**

Append to `src/services/carDataService.test.ts`:

```ts
import { getComputedScore, getAllComputedScores } from './carDataService'

describe('carDataService: computed scores', () => {
  it('getAllComputedScores returns a score for every model', async () => {
    const scores = await getAllComputedScores()
    expect(scores).toHaveLength(10)
  })

  it('getComputedScore returns the score for a specific model', async () => {
    const score = await getComputedScore('scorpio-n')
    expect(score?.overallScore).toBe(49)
  })

  it('getComputedScore returns null for an unknown model', async () => {
    const score = await getComputedScore('does-not-exist')
    expect(score).toBeNull()
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: FAIL — `getComputedScore`/`getAllComputedScores` are not exported yet.

- [ ] **Step 4: Implement the score getters**

Replace the full contents of `src/services/carDataService.ts` with:

```ts
import companiesData from '../data/mock/companies.json'
import modelsData from '../data/mock/models.json'
import recallsData from '../data/mock/recalls.json'
import safetyRatingsData from '../data/mock/safetyRatings.json'
import csiReportsData from '../data/mock/csiReports.json'
import dealershipDataRaw from '../data/mock/dealershipData.json'
import partsPriceData from '../data/mock/partsPrice.json'
import forumSentimentData from '../data/mock/forumSentiment.json'
import computedScoresData from '../data/mock/computedScores.json'
import type {
  Company,
  Model,
  Recall,
  SafetyRating,
  CsiReport,
  DealershipData,
  PartsPrice,
  ForumSentiment,
  ComputedScore,
  ModelRawSignals,
} from '../types/car'

const companies = companiesData as Company[]
const models = modelsData as Model[]
const recalls = recallsData as Recall[]
const safetyRatings = safetyRatingsData as SafetyRating[]
const csiReports = csiReportsData as CsiReport[]
const dealershipData = dealershipDataRaw as DealershipData[]
const partsPrice = partsPriceData as PartsPrice[]
const forumSentiment = forumSentimentData as ForumSentiment[]
const computedScores = computedScoresData as ComputedScore[]

export async function getCompanies(): Promise<Company[]> {
  return companies
}

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(modelId: string): Promise<Model | null> {
  return models.find((m) => m.id === modelId) ?? null
}

export async function getModelRawSignals(modelId: string): Promise<ModelRawSignals> {
  const model = await getModelById(modelId)
  const companyId = model?.companyId ?? null

  return {
    recalls: recalls.filter((r) => r.modelId === modelId),
    safetyRating: safetyRatings.find((s) => s.modelId === modelId) ?? null,
    csiReport: csiReports.find((c) => c.modelId === modelId) ?? null,
    dealership: dealershipData.find((d) => d.companyId === companyId) ?? null,
    partsPrice: partsPrice.find((p) => p.modelId === modelId) ?? null,
    forumSentiment: forumSentiment.filter((f) => f.modelId === modelId),
  }
}

export async function getComputedScore(modelId: string): Promise<ComputedScore | null> {
  return computedScores.find((c) => c.modelId === modelId) ?? null
}

export async function getAllComputedScores(): Promise<ComputedScore[]> {
  return computedScores
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/services/carDataService.test.ts`
Expected: PASS (13 tests total)

- [ ] **Step 6: Commit**

```bash
git add src/data/mock/computedScores.json src/services/carDataService.ts src/services/carDataService.test.ts
git commit -m "feat: add computed scores mock data and score getters"
```

---

## Task 5: scoreColor util + ScoreBadge + ScoreGauge components

**Files:**
- Create: `src/utils/scoreColor.ts`
- Test: `src/utils/scoreColor.test.ts`
- Create: `src/components/ScoreBadge.vue`
- Test: `src/components/ScoreBadge.test.ts`
- Create: `src/components/ScoreGauge.vue`
- Test: `src/components/ScoreGauge.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure presentational layer).
- Produces:
  - `getScoreTier(score: number): 'green' | 'amber' | 'red'`
  - `<ScoreBadge :score="number" :label="string | undefined" />`
  - `<ScoreGauge :label="string" :score="number" />`

- [ ] **Step 1: Write the failing test for scoreColor**

`src/utils/scoreColor.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getScoreTier } from './scoreColor'

describe('getScoreTier', () => {
  it('returns green for scores >= 75', () => {
    expect(getScoreTier(75)).toBe('green')
    expect(getScoreTier(100)).toBe('green')
  })

  it('returns amber for scores between 50 and 74', () => {
    expect(getScoreTier(50)).toBe('amber')
    expect(getScoreTier(74)).toBe('amber')
  })

  it('returns red for scores below 50', () => {
    expect(getScoreTier(49)).toBe('red')
    expect(getScoreTier(0)).toBe('red')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/scoreColor.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement scoreColor**

`src/utils/scoreColor.ts`:

```ts
export type ScoreTier = 'green' | 'amber' | 'red'

export function getScoreTier(score: number): ScoreTier {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/utils/scoreColor.test.ts`
Expected: PASS

- [ ] **Step 5: Write the failing ScoreBadge test**

`src/components/ScoreBadge.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScoreBadge from './ScoreBadge.vue'

describe('ScoreBadge', () => {
  it('renders the score value', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81 } })
    expect(wrapper.text()).toContain('81')
  })

  it('renders the label when provided', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81, label: 'Overall' } })
    expect(wrapper.text()).toContain('Overall')
  })

  it('applies the green tier class for high scores', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 81 } })
    expect(wrapper.classes()).toContain('score-badge--green')
  })

  it('applies the red tier class for low scores', () => {
    const wrapper = mount(ScoreBadge, { props: { score: 49 } })
    expect(wrapper.classes()).toContain('score-badge--red')
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/components/ScoreBadge.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 7: Implement ScoreBadge**

`src/components/ScoreBadge.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getScoreTier } from '../utils/scoreColor'

const props = defineProps<{
  score: number
  label?: string
}>()

const tier = computed(() => getScoreTier(props.score))
</script>

<template>
  <span class="score-badge" :class="`score-badge--${tier}`" data-testid="score-badge">
    <span v-if="label" class="score-badge__label">{{ label }}</span>
    <span class="score-badge__value">{{ score }}</span>
  </span>
</template>

<style scoped>
.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
}
.score-badge--green {
  background-color: #2e7d32;
}
.score-badge--amber {
  background-color: #b8860b;
}
.score-badge--red {
  background-color: #c62828;
}
</style>
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/components/ScoreBadge.test.ts`
Expected: PASS

- [ ] **Step 9: Write the failing ScoreGauge test**

`src/components/ScoreGauge.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScoreGauge from './ScoreGauge.vue'

describe('ScoreGauge', () => {
  it('renders the label and score', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 82 } })
    expect(wrapper.text()).toContain('Safety')
    expect(wrapper.text()).toContain('82/100')
  })

  it('sets the fill width to match the score', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 82 } })
    const fill = wrapper.get('[data-testid="score-gauge-fill"]')
    expect(fill.attributes('style')).toContain('width: 82%')
  })

  it('applies the red tier class for low scores', () => {
    const wrapper = mount(ScoreGauge, { props: { label: 'Safety', score: 20 } })
    const fill = wrapper.get('[data-testid="score-gauge-fill"]')
    expect(fill.classes()).toContain('score-gauge__fill--red')
  })
})
```

- [ ] **Step 10: Run the test to verify it fails**

Run: `npx vitest run src/components/ScoreGauge.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 11: Implement ScoreGauge**

`src/components/ScoreGauge.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getScoreTier } from '../utils/scoreColor'

const props = defineProps<{
  label: string
  score: number
}>()

const tier = computed(() => getScoreTier(props.score))
const widthPercent = computed(() => `${Math.max(0, Math.min(100, props.score))}%`)
</script>

<template>
  <div class="score-gauge" data-testid="score-gauge">
    <div class="score-gauge__header">
      <span class="score-gauge__label">{{ label }}</span>
      <span class="score-gauge__value">{{ score }}/100</span>
    </div>
    <div class="score-gauge__track">
      <div
        class="score-gauge__fill"
        :class="`score-gauge__fill--${tier}`"
        :style="{ width: widthPercent }"
        data-testid="score-gauge-fill"
      />
    </div>
  </div>
</template>

<style scoped>
.score-gauge__track {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.score-gauge__fill {
  height: 100%;
}
.score-gauge__fill--green {
  background-color: #2e7d32;
}
.score-gauge__fill--amber {
  background-color: #b8860b;
}
.score-gauge__fill--red {
  background-color: #c62828;
}
</style>
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npx vitest run src/components/ScoreGauge.test.ts`
Expected: PASS

- [ ] **Step 13: Commit**

```bash
git add src/utils/scoreColor.ts src/utils/scoreColor.test.ts src/components/ScoreBadge.vue src/components/ScoreBadge.test.ts src/components/ScoreGauge.vue src/components/ScoreGauge.test.ts
git commit -m "feat: add scoreColor util, ScoreBadge, and ScoreGauge components"
```

---

## Task 6: CarCard component

**Files:**
- Create: `src/components/CarCard.vue`
- Test: `src/components/CarCard.test.ts`

**Interfaces:**
- Consumes: `Model`, `Company` types (Task 2), `ScoreBadge` (Task 5).
- Produces: `<CarCard :model="Model" :company="Company" :overall-score="number" />`, a `RouterLink` to `/cars/:id` — consumed by `BrowseView` (Task 8).

- [ ] **Step 1: Write the failing test**

`src/components/CarCard.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import CarCard from './CarCard.vue'
import type { Model, Company } from '../types/car'

const model: Model = {
  id: 'nexon',
  companyId: 'tata',
  name: 'Nexon',
  segment: 'Compact SUV',
  launchYear: 2023,
  priceMin: 800000,
  priceMax: 1560000,
}

const company: Company = { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' }

describe('CarCard', () => {
  it('renders the model name, company name, and price range', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.text()).toContain('Nexon')
    expect(wrapper.text()).toContain('Tata Motors')
    expect(wrapper.text()).toContain('8.00L')
  })

  it('links to the model detail page', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/cars/nexon')
  })

  it('renders the overall score via ScoreBadge', () => {
    const wrapper = mount(CarCard, {
      props: { model, company, overallScore: 78 },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.text()).toContain('78')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/CarCard.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement CarCard**

`src/components/CarCard.vue`:

```vue
<script setup lang="ts">
import ScoreBadge from './ScoreBadge.vue'
import type { Model, Company } from '../types/car'

defineProps<{
  model: Model
  company: Company
  overallScore: number
}>()
</script>

<template>
  <RouterLink :to="`/cars/${model.id}`" class="car-card" data-testid="car-card">
    <div class="car-card__header">
      <span class="car-card__company">{{ company.name }}</span>
      <ScoreBadge :score="overallScore" />
    </div>
    <h3 class="car-card__name">{{ model.name }}</h3>
    <p class="car-card__segment">{{ model.segment }}</p>
    <p class="car-card__price">
      ₹{{ (model.priceMin / 100000).toFixed(2) }}L – ₹{{ (model.priceMax / 100000).toFixed(2) }}L
    </p>
  </RouterLink>
</template>

<style scoped>
.car-card {
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
}
.car-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/CarCard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CarCard.vue src/components/CarCard.test.ts
git commit -m "feat: add CarCard component"
```

---

## Task 7: CompanyFilter component

**Files:**
- Create: `src/components/CompanyFilter.vue`
- Test: `src/components/CompanyFilter.test.ts`

**Interfaces:**
- Consumes: `Company` type (Task 2).
- Produces: `<CompanyFilter :companies="Company[]" v-model="string | null" />`, emitting `update:modelValue` — consumed by `BrowseView` (Task 8).

- [ ] **Step 1: Write the failing test**

`src/components/CompanyFilter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompanyFilter from './CompanyFilter.vue'
import type { Company } from '../types/car'

const companies: Company[] = [
  { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
  { id: 'kia', name: 'Kia', logoUrl: '/logos/kia.svg' },
]

describe('CompanyFilter', () => {
  it('renders an "All" option plus one button per company', () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: null } })
    expect(wrapper.get('[data-testid="company-filter-all"]').text()).toBe('All')
    expect(wrapper.get('[data-testid="company-filter-tata"]').text()).toBe('Tata Motors')
    expect(wrapper.get('[data-testid="company-filter-kia"]').text()).toBe('Kia')
  })

  it('emits update:modelValue with the company id when a company is clicked', async () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: null } })
    await wrapper.get('[data-testid="company-filter-tata"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tata'])
  })

  it('emits update:modelValue with null when "All" is clicked', async () => {
    const wrapper = mount(CompanyFilter, { props: { companies, modelValue: 'tata' } })
    await wrapper.get('[data-testid="company-filter-all"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/CompanyFilter.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement CompanyFilter**

`src/components/CompanyFilter.vue`:

```vue
<script setup lang="ts">
import type { Company } from '../types/car'

defineProps<{
  companies: Company[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

function selectCompany(companyId: string | null) {
  emit('update:modelValue', companyId)
}
</script>

<template>
  <div class="company-filter" data-testid="company-filter">
    <button
      type="button"
      :class="{ active: modelValue === null }"
      data-testid="company-filter-all"
      @click="selectCompany(null)"
    >
      All
    </button>
    <button
      v-for="company in companies"
      :key="company.id"
      type="button"
      :class="{ active: modelValue === company.id }"
      :data-testid="`company-filter-${company.id}`"
      @click="selectCompany(company.id)"
    >
      {{ company.name }}
    </button>
  </div>
</template>

<style scoped>
.company-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.company-filter button.active {
  font-weight: 700;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/CompanyFilter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CompanyFilter.vue src/components/CompanyFilter.test.ts
git commit -m "feat: add CompanyFilter component"
```

---

## Task 8: BrowseView

**Files:**
- Create: `src/views/BrowseView.vue`
- Test: `src/views/BrowseView.test.ts`

**Interfaces:**
- Consumes: `getModels`, `getCompanies`, `getAllComputedScores` (Task 2/4), `CarCard` (Task 6), `CompanyFilter` (Task 7).
- Produces: the `BrowseView` component, mounted at `/browse` in Task 13.

- [ ] **Step 1: Write the failing test**

`src/views/BrowseView.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import BrowseView from './BrowseView.vue'
import type { Model, Company, ComputedScore } from '../types/car'

const models: Model[] = [
  { id: 'nexon', companyId: 'tata', name: 'Nexon', segment: 'Compact SUV', launchYear: 2023, priceMin: 800000, priceMax: 1560000 },
  { id: 'seltos', companyId: 'kia', name: 'Seltos', segment: 'Compact SUV', launchYear: 2023, priceMin: 1090000, priceMax: 2020000 },
]
const companies: Company[] = [
  { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
  { id: 'kia', name: 'Kia', logoUrl: '/logos/kia.svg' },
]
const scores: ComputedScore[] = [
  { modelId: 'nexon', reliabilityScore: 79, safetyScore: 100, repairabilityScore: 62, valueScore: 72, overallScore: 78, lastComputedAt: '2024-05-02' },
  { modelId: 'seltos', reliabilityScore: 82, safetyScore: 82, repairabilityScore: 51, valueScore: 59, overallScore: 69, lastComputedAt: '2024-05-02' },
]

vi.mock('../services/carDataService', () => ({
  getModels: vi.fn().mockResolvedValue(models),
  getCompanies: vi.fn().mockResolvedValue(companies),
  getAllComputedScores: vi.fn().mockResolvedValue(scores),
}))

describe('BrowseView', () => {
  it('renders one CarCard per model once data loads', async () => {
    const wrapper = mount(BrowseView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    expect(wrapper.findAll('[data-testid="car-card"]')).toHaveLength(2)
  })

  it('filters the grid when a company is selected', async () => {
    const wrapper = mount(BrowseView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    await wrapper.get('[data-testid="company-filter-kia"]').trigger('click')
    await flushPromises()
    const cards = wrapper.findAll('[data-testid="car-card"]')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Seltos')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/views/BrowseView.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement BrowseView**

`src/views/BrowseView.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import CarCard from '../components/CarCard.vue'
import CompanyFilter from '../components/CompanyFilter.vue'
import { getModels, getCompanies, getAllComputedScores } from '../services/carDataService'
import type { Model, Company, ComputedScore } from '../types/car'

const models = ref<Model[]>([])
const companies = ref<Company[]>([])
const scores = ref<ComputedScore[]>([])
const selectedCompanyId = ref<string | null>(null)

onMounted(async () => {
  models.value = await getModels()
  companies.value = await getCompanies()
  scores.value = await getAllComputedScores()
})

const cars = computed(() => {
  return models.value
    .filter((model) => selectedCompanyId.value === null || model.companyId === selectedCompanyId.value)
    .map((model) => {
      const company = companies.value.find((c) => c.id === model.companyId)
      const score = scores.value.find((s) => s.modelId === model.id)
      if (!company || !score) return null
      return { model, company, overallScore: score.overallScore }
    })
    .filter((item): item is { model: Model; company: Company; overallScore: number } => item !== null)
    .sort((a, b) => b.overallScore - a.overallScore)
})
</script>

<template>
  <div class="browse-view" data-testid="browse-view">
    <CompanyFilter :companies="companies" v-model="selectedCompanyId" />
    <div class="browse-view__grid">
      <CarCard
        v-for="car in cars"
        :key="car.model.id"
        :model="car.model"
        :company="car.company"
        :overall-score="car.overallScore"
      />
    </div>
  </div>
</template>

<style scoped>
.browse-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/views/BrowseView.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/BrowseView.vue src/views/BrowseView.test.ts
git commit -m "feat: add BrowseView with company filtering"
```

---

## Task 9: PillarBreakdown component

**Files:**
- Create: `src/components/PillarBreakdown.vue`
- Test: `src/components/PillarBreakdown.test.ts`

**Interfaces:**
- Consumes: `ComputedScore`, `ModelRawSignals` types (Task 2), `ScoreGauge` (Task 5).
- Produces: `<PillarBreakdown :computed-score="ComputedScore" :raw-signals="ModelRawSignals" />` — consumed by `ModelDetailView` (Task 10).

- [ ] **Step 1: Write the failing test**

`src/components/PillarBreakdown.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PillarBreakdown from './PillarBreakdown.vue'
import type { ComputedScore, ModelRawSignals } from '../types/car'

const computedScore: ComputedScore = {
  modelId: 'baleno',
  reliabilityScore: 73,
  safetyScore: 14,
  repairabilityScore: 83,
  valueScore: 77,
  overallScore: 62,
  lastComputedAt: '2024-05-02',
}

const rawSignals: ModelRawSignals = {
  recalls: [{ id: 'r2', modelId: 'baleno', date: '2022-07-01', severity: 'medium', description: 'Airbag control unit software update' }],
  safetyRating: {
    id: 's3',
    modelId: 'baleno',
    source: 'global_ncap',
    tested: false,
    adultStars: null,
    childStars: null,
    testedVariant: null,
    abs: true,
    esc: false,
    airbagsCount: 2,
    adasPresent: false,
  },
  csiReport: { id: 'c3', modelId: 'baleno', source: 'JD Power India CSI', year: 2023, score: 800 },
  dealership: { id: 'd1', companyId: 'maruti', serviceCenterCount: 4200, dealershipCount: 3500 },
  partsPrice: { id: 'p3', modelId: 'baleno', avgPriceIndex: 0.88 },
  forumSentiment: [
    { id: 'f7', modelId: 'baleno', source: 'teambhp', threadUrl: 'https://www.team-bhp.com/forum/baleno-review', aspect: 'reliability', sentimentScore: 68, collectedAt: '2024-05-01' },
  ],
}

describe('PillarBreakdown', () => {
  it('renders all four pillar gauges with their scores', () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals } })
    expect(wrapper.text()).toContain('Reliability')
    expect(wrapper.text()).toContain('Safety')
    expect(wrapper.text()).toContain('Repairability')
    expect(wrapper.text()).toContain('Value for money')
  })

  it('shows the NCAP-untested note when the safety pillar is expanded', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals } })
    await wrapper.get('[data-testid="pillar-toggle-safety"]').trigger('click')
    expect(wrapper.get('[data-testid="safety-untested-note"]').text()).toContain('treated as 0★')
  })

  it('shows the recall description when the reliability pillar is expanded', async () => {
    const wrapper = mount(PillarBreakdown, { props: { computedScore, rawSignals } })
    await wrapper.get('[data-testid="pillar-toggle-reliability"]').trigger('click')
    expect(wrapper.get('[data-testid="pillar-detail-reliability"]').text()).toContain('Airbag control unit software update')
  })

  it('shows "No CSI report available" when csiReport is null', async () => {
    const wrapper = mount(PillarBreakdown, {
      props: { computedScore, rawSignals: { ...rawSignals, csiReport: null } },
    })
    await wrapper.get('[data-testid="pillar-toggle-reliability"]').trigger('click')
    expect(wrapper.get('[data-testid="pillar-detail-reliability"]').text()).toContain('No CSI report available')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/PillarBreakdown.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement PillarBreakdown**

`src/components/PillarBreakdown.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ScoreGauge from './ScoreGauge.vue'
import type { ComputedScore, ModelRawSignals } from '../types/car'

defineProps<{
  computedScore: ComputedScore
  rawSignals: ModelRawSignals
}>()

const expandedPillar = ref<string | null>(null)

function toggle(pillar: string) {
  expandedPillar.value = expandedPillar.value === pillar ? null : pillar
}
</script>

<template>
  <div class="pillar-breakdown" data-testid="pillar-breakdown">
    <div class="pillar-breakdown__row">
      <button type="button" data-testid="pillar-toggle-reliability" @click="toggle('reliability')">
        <ScoreGauge label="Reliability" :score="computedScore.reliabilityScore" />
      </button>
      <div v-if="expandedPillar === 'reliability'" data-testid="pillar-detail-reliability">
        <p>Recalls: {{ rawSignals.recalls.length }}</p>
        <ul>
          <li v-for="recall in rawSignals.recalls" :key="recall.id">
            {{ recall.date }} — {{ recall.severity }} — {{ recall.description }}
          </li>
        </ul>
        <p v-if="rawSignals.csiReport">
          CSI report ({{ rawSignals.csiReport.source }}, {{ rawSignals.csiReport.year }}): {{ rawSignals.csiReport.score }}
        </p>
        <p v-else>No CSI report available.</p>
      </div>
    </div>

    <div class="pillar-breakdown__row">
      <button type="button" data-testid="pillar-toggle-safety" @click="toggle('safety')">
        <ScoreGauge label="Safety" :score="computedScore.safetyScore" />
      </button>
      <div v-if="expandedPillar === 'safety'" data-testid="pillar-detail-safety">
        <p v-if="rawSignals.safetyRating?.tested">
          {{ rawSignals.safetyRating.source === 'bharat_ncap' ? 'Bharat NCAP' : 'Global NCAP' }}:
          {{ rawSignals.safetyRating.adultStars }}★ adult / {{ rawSignals.safetyRating.childStars }}★ child
          ({{ rawSignals.safetyRating.testedVariant }} variant)
        </p>
        <p v-else data-testid="safety-untested-note">
          Not crash-tested by Global NCAP/Bharat NCAP — treated as 0★ for safety scoring.
        </p>
        <p>
          Active safety: ABS {{ rawSignals.safetyRating?.abs ? 'yes' : 'no' }},
          ESC {{ rawSignals.safetyRating?.esc ? 'yes' : 'no' }},
          {{ rawSignals.safetyRating?.airbagsCount ?? 0 }} airbags,
          ADAS {{ rawSignals.safetyRating?.adasPresent ? 'yes' : 'no' }}
        </p>
      </div>
    </div>

    <div class="pillar-breakdown__row">
      <button type="button" data-testid="pillar-toggle-repairability" @click="toggle('repairability')">
        <ScoreGauge label="Repairability" :score="computedScore.repairabilityScore" />
      </button>
      <div v-if="expandedPillar === 'repairability'" data-testid="pillar-detail-repairability">
        <p v-if="rawSignals.partsPrice">
          Parts price index: {{ rawSignals.partsPrice.avgPriceIndex }} (1.0 = segment average)
        </p>
        <p>Service centers: {{ rawSignals.dealership?.serviceCenterCount ?? 'N/A' }}</p>
      </div>
    </div>

    <div class="pillar-breakdown__row">
      <button type="button" data-testid="pillar-toggle-value" @click="toggle('value')">
        <ScoreGauge label="Value for money" :score="computedScore.valueScore" />
      </button>
      <div v-if="expandedPillar === 'value'" data-testid="pillar-detail-value">
        <p v-for="sentiment in rawSignals.forumSentiment" :key="sentiment.id">
          {{ sentiment.aspect }} sentiment: {{ sentiment.sentimentScore }}/100
          (<a :href="sentiment.threadUrl" target="_blank" rel="noopener">source</a>)
        </p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/PillarBreakdown.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PillarBreakdown.vue src/components/PillarBreakdown.test.ts
git commit -m "feat: add PillarBreakdown component with expandable why-details"
```

---

## Task 10: ModelDetailView

**Files:**
- Create: `src/views/ModelDetailView.vue`
- Test: `src/views/ModelDetailView.test.ts`

**Interfaces:**
- Consumes: `getModelById`, `getCompanies`, `getComputedScore`, `getModelRawSignals` (Tasks 2–4), `ScoreBadge` (Task 5), `PillarBreakdown` (Task 9), `useRoute` from `vue-router`.
- Produces: the `ModelDetailView` component, mounted at `/cars/:id` in Task 13.

- [ ] **Step 1: Write the failing test**

`src/views/ModelDetailView.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModelDetailView from './ModelDetailView.vue'
import type { Model, Company, ComputedScore, ModelRawSignals } from '../types/car'

const model: Model = { id: 'nexon', companyId: 'tata', name: 'Nexon', segment: 'Compact SUV', launchYear: 2023, priceMin: 800000, priceMax: 1560000 }
const companies: Company[] = [{ id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' }]
const computedScore: ComputedScore = { modelId: 'nexon', reliabilityScore: 79, safetyScore: 100, repairabilityScore: 62, valueScore: 72, overallScore: 78, lastComputedAt: '2024-05-02' }
const rawSignals: ModelRawSignals = { recalls: [], safetyRating: null, csiReport: null, dealership: null, partsPrice: null, forumSentiment: [] }

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'nexon' } }),
}))

vi.mock('../services/carDataService', () => ({
  getModelById: vi.fn().mockResolvedValue(model),
  getCompanies: vi.fn().mockResolvedValue(companies),
  getComputedScore: vi.fn().mockResolvedValue(computedScore),
  getModelRawSignals: vi.fn().mockResolvedValue(rawSignals),
}))

describe('ModelDetailView', () => {
  it('shows a loading state before data resolves', () => {
    const wrapper = mount(ModelDetailView)
    expect(wrapper.get('[data-testid="model-detail-loading"]').exists()).toBe(true)
  })

  it('renders the model name, company, and overall score once loaded', async () => {
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.text()).toContain('Nexon')
    expect(wrapper.text()).toContain('Tata Motors')
    expect(wrapper.text()).toContain('78')
  })

  it('renders the PillarBreakdown once loaded', async () => {
    const wrapper = mount(ModelDetailView)
    await flushPromises()
    expect(wrapper.findComponent({ name: 'PillarBreakdown' }).exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/views/ModelDetailView.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement ModelDetailView**

`src/views/ModelDetailView.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ScoreBadge from '../components/ScoreBadge.vue'
import PillarBreakdown from '../components/PillarBreakdown.vue'
import {
  getModelById,
  getCompanies,
  getComputedScore,
  getModelRawSignals,
} from '../services/carDataService'
import type { Model, Company, ComputedScore, ModelRawSignals } from '../types/car'

const route = useRoute()

const model = ref<Model | null>(null)
const company = ref<Company | null>(null)
const computedScore = ref<ComputedScore | null>(null)
const rawSignals = ref<ModelRawSignals | null>(null)

async function load(modelId: string) {
  const [foundModel, companies, score, signals] = await Promise.all([
    getModelById(modelId),
    getCompanies(),
    getComputedScore(modelId),
    getModelRawSignals(modelId),
  ])
  model.value = foundModel
  company.value = companies.find((c) => c.id === foundModel?.companyId) ?? null
  computedScore.value = score
  rawSignals.value = signals
}

onMounted(() => {
  load(route.params.id as string)
})
</script>

<template>
  <div class="model-detail-view" data-testid="model-detail-view">
    <template v-if="model && company && computedScore && rawSignals">
      <header>
        <p>{{ company.name }}</p>
        <h1>{{ model.name }}</h1>
        <ScoreBadge :score="computedScore.overallScore" label="Overall" />
      </header>
      <PillarBreakdown :computed-score="computedScore" :raw-signals="rawSignals" />
    </template>
    <p v-else data-testid="model-detail-loading">Loading…</p>
  </div>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/views/ModelDetailView.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/ModelDetailView.vue src/views/ModelDetailView.test.ts
git commit -m "feat: add ModelDetailView"
```

---

## Task 11: CarCarousel component (peek style)

**Files:**
- Create: `src/components/CarCarousel.vue`
- Test: `src/components/CarCarousel.test.ts`

**Interfaces:**
- Consumes: `Model`, `Company` types (Task 2), `ScoreBadge` (Task 5).
- Produces: `<CarCarousel :cars="Array<{ model: Model; company: Company; overallScore: number }>" />` — consumed by `HomeView` (Task 12).

- [ ] **Step 1: Write the failing test**

`src/components/CarCarousel.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import CarCarousel from './CarCarousel.vue'
import type { Model, Company } from '../types/car'

function makeCar(id: string, name: string): { model: Model; company: Company; overallScore: number } {
  return {
    model: { id, companyId: 'tata', name, segment: 'SUV', launchYear: 2023, priceMin: 800000, priceMax: 1500000 },
    company: { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
    overallScore: 78,
  }
}

const cars = [makeCar('nexon', 'Nexon'), makeCar('punch', 'Punch'), makeCar('creta', 'Creta')]

describe('CarCarousel', () => {
  it('marks the first slide as active initially and disables the prev button', () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.get('[data-testid="carousel-slide-nexon"]').classes()).toContain('car-carousel__slide--active')
    expect(wrapper.get('[data-testid="carousel-prev"]').attributes('disabled')).toBeDefined()
  })

  it('advances to the next slide when next is clicked', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-slide-punch"]').classes()).toContain('car-carousel__slide--active')
    expect(wrapper.get('[data-testid="carousel-slide-nexon"]').classes()).not.toContain('car-carousel__slide--active')
  })

  it('disables the next button on the last slide', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    await wrapper.get('[data-testid="carousel-next"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-next"]').attributes('disabled')).toBeDefined()
  })

  it('jumps to a slide when a non-active peeking slide is clicked', async () => {
    const wrapper = mount(CarCarousel, { props: { cars }, global: { stubs: { RouterLink: RouterLinkStub } } })
    await wrapper.get('[data-testid="carousel-slide-creta"]').trigger('click')
    expect(wrapper.get('[data-testid="carousel-slide-creta"]').classes()).toContain('car-carousel__slide--active')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/CarCarousel.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement CarCarousel**

`src/components/CarCarousel.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ScoreBadge from './ScoreBadge.vue'
import type { Model, Company } from '../types/car'

interface CarouselItem {
  model: Model
  company: Company
  overallScore: number
}

const props = defineProps<{
  cars: CarouselItem[]
}>()

const currentIndex = ref(0)

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < props.cars.length - 1)

function prev() {
  if (canGoPrev.value) currentIndex.value -= 1
}

function next() {
  if (canGoNext.value) currentIndex.value += 1
}

function goTo(index: number) {
  currentIndex.value = index
}

const trackStyle = computed(() => ({
  transform: `translateX(calc(20% - ${currentIndex.value * 60}%))`,
}))
</script>

<template>
  <div class="car-carousel" data-testid="car-carousel">
    <button type="button" data-testid="carousel-prev" :disabled="!canGoPrev" @click="prev">‹</button>

    <div class="car-carousel__viewport">
      <div class="car-carousel__track" :style="trackStyle">
        <div
          v-for="(item, index) in cars"
          :key="item.model.id"
          class="car-carousel__slide"
          :class="{ 'car-carousel__slide--active': index === currentIndex }"
          :data-testid="`carousel-slide-${item.model.id}`"
          @click="index === currentIndex ? undefined : goTo(index)"
        >
          <RouterLink v-if="index === currentIndex" :to="`/cars/${item.model.id}`" class="car-carousel__link">
            <h3>{{ item.model.name }}</h3>
            <p>{{ item.company.name }}</p>
            <ScoreBadge :score="item.overallScore" />
          </RouterLink>
          <div v-else class="car-carousel__peek">
            <h3>{{ item.model.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <button type="button" data-testid="carousel-next" :disabled="!canGoNext" @click="next">›</button>
  </div>
</template>

<style scoped>
.car-carousel {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.car-carousel__viewport {
  overflow: hidden;
  flex: 1;
}
.car-carousel__track {
  display: flex;
  transition: transform 0.3s ease;
}
.car-carousel__slide {
  flex: 0 0 60%;
  padding: 0 1rem;
  opacity: 0.5;
  cursor: pointer;
}
.car-carousel__slide--active {
  opacity: 1;
  cursor: default;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/CarCarousel.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CarCarousel.vue src/components/CarCarousel.test.ts
git commit -m "feat: add peek-style CarCarousel component"
```

---

## Task 12: HomeView

**Files:**
- Create: `src/views/HomeView.vue`
- Test: `src/views/HomeView.test.ts`

**Interfaces:**
- Consumes: `getModels`, `getCompanies`, `getAllComputedScores` (Tasks 2/4), `CarCarousel` (Task 11).
- Produces: the `HomeView` component, mounted at `/` in Task 13.

- [ ] **Step 1: Write the failing test**

`src/views/HomeView.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import HomeView from './HomeView.vue'
import type { Model, Company, ComputedScore } from '../types/car'

const models: Model[] = [
  { id: 'nexon', companyId: 'tata', name: 'Nexon', segment: 'Compact SUV', launchYear: 2023, priceMin: 800000, priceMax: 1560000 },
  { id: 'brezza', companyId: 'maruti', name: 'Brezza', segment: 'Compact SUV', launchYear: 2022, priceMin: 841000, priceMax: 1379000 },
]
const companies: Company[] = [
  { id: 'tata', name: 'Tata Motors', logoUrl: '/logos/tata.svg' },
  { id: 'maruti', name: 'Maruti Suzuki', logoUrl: '/logos/maruti.svg' },
]
const scores: ComputedScore[] = [
  { modelId: 'nexon', reliabilityScore: 79, safetyScore: 100, repairabilityScore: 62, valueScore: 72, overallScore: 78, lastComputedAt: '2024-05-02' },
  { modelId: 'brezza', reliabilityScore: 84, safetyScore: 84, repairabilityScore: 82, valueScore: 73, overallScore: 81, lastComputedAt: '2024-05-02' },
]

vi.mock('../services/carDataService', () => ({
  getModels: vi.fn().mockResolvedValue(models),
  getCompanies: vi.fn().mockResolvedValue(companies),
  getAllComputedScores: vi.fn().mockResolvedValue(scores),
}))

describe('HomeView', () => {
  it('renders the explainer heading', () => {
    const wrapper = mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.text()).toContain('Know your car before you buy it')
  })

  it('renders the carousel with cars sorted by overall score descending once loaded', async () => {
    const wrapper = mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    await flushPromises()
    const slides = wrapper.findAll('[data-testid^="carousel-slide-"]')
    expect(slides).toHaveLength(2)
    expect(slides[0].attributes('data-testid')).toBe('carousel-slide-brezza')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/views/HomeView.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement HomeView**

`src/views/HomeView.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import CarCarousel from '../components/CarCarousel.vue'
import { getModels, getCompanies, getAllComputedScores } from '../services/carDataService'
import type { Model, Company, ComputedScore } from '../types/car'

const models = ref<Model[]>([])
const companies = ref<Company[]>([])
const scores = ref<ComputedScore[]>([])

onMounted(async () => {
  models.value = await getModels()
  companies.value = await getCompanies()
  scores.value = await getAllComputedScores()
})

const carouselItems = computed(() => {
  return models.value
    .map((model) => {
      const company = companies.value.find((c) => c.id === model.companyId)
      const score = scores.value.find((s) => s.modelId === model.id)
      if (!company || !score) return null
      return { model, company, overallScore: score.overallScore }
    })
    .filter((item): item is { model: Model; company: Company; overallScore: number } => item !== null)
    .sort((a, b) => b.overallScore - a.overallScore)
})
</script>

<template>
  <div class="home-view" data-testid="home-view">
    <section class="home-view__intro">
      <h1>Know your car before you buy it</h1>
      <p>
        Indian car buyers rarely get a straight answer on how safe, reliable, or
        expensive to maintain a car really is. We combine recall records, crash
        test ratings, service network size, parts pricing, and real owner
        discussions from Team-BHP into four transparent scores — Reliability,
        Safety, Repairability, and Value for money — plus one overall score, so
        you can see exactly why a car scored the way it did.
      </p>
    </section>

    <section v-if="carouselItems.length > 0" class="home-view__carousel">
      <CarCarousel :cars="carouselItems" />
    </section>
  </div>
</template>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/views/HomeView.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/HomeView.vue src/views/HomeView.test.ts
git commit -m "feat: add HomeView with explainer and car carousel"
```

---

## Task 13: Router + App shell + navigation + manual verification

**Files:**
- Create: `src/router/index.ts`
- Modify: `src/App.vue`
- Modify: `src/main.ts`
- Modify: `src/App.test.ts`

**Interfaces:**
- Consumes: `HomeView` (Task 12), `BrowseView` (Task 8), `ModelDetailView` (Task 10).
- Produces: the fully wired app — no further tasks depend on this one.

- [ ] **Step 1: Write the failing App test**

Update `src/App.test.ts` to reflect the real nav (replacing the old scaffold-only test):

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router/routes'

describe('App', () => {
  it('renders the site title and nav links', async () => {
    const router = createRouter({ history: createWebHistory(), routes })
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Car Perfect')
    expect(wrapper.get('[data-testid="nav-home"]').text()).toBe('Home')
    expect(wrapper.get('[data-testid="nav-browse"]').text()).toBe('Browse')
  })

  it('renders HomeView content at the root route', async () => {
    const router = createRouter({ history: createWebHistory(), routes })
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Know your car before you buy it')
  })
})
```

Note: routes are pulled from a separate `src/router/routes.ts` module (rather than directly from `src/router/index.ts`, which also creates the router instance for `main.ts`) so this test can build its own isolated router per test instead of importing the app's singleton router — this avoids router state leaking between tests.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/App.test.ts`
Expected: FAIL — `./router/routes` does not exist and `App.vue` has no nav yet.

- [ ] **Step 3: Implement the router**

`src/router/routes.ts`:

```ts
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BrowseView from '../views/BrowseView.vue'
import ModelDetailView from '../views/ModelDetailView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/browse', name: 'browse', component: BrowseView },
  { path: '/cars/:id', name: 'model-detail', component: ModelDetailView },
]

export default routes
```

`src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

- [ ] **Step 4: Update App.vue with navigation**

`src/App.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <div id="app-root">
    <nav class="app-nav">
      <h1>Car Perfect</h1>
      <RouterLink to="/" data-testid="nav-home">Home</RouterLink>
      <RouterLink to="/browse" data-testid="nav-browse">Browse</RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}
</style>
```

- [ ] **Step 5: Wire the router into main.ts**

`src/main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/App.test.ts`
Expected: PASS

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file from Tasks 1–13 passes.

- [ ] **Step 8: Manually verify the running app**

Run: `npm run dev`, then open the printed local URL in a browser and confirm:
- The homepage loads with the explainer text and the peek carousel (one car centered, neighbors partially visible left/right), and clicking a peeking neighbor brings it to center.
- Clicking the centered car, or navigating to `/browse` and clicking a `CarCard`, opens `/cars/:id` and shows the overall score plus all four pillar gauges.
- Clicking a pillar row expands its "why" detail (e.g. clicking Safety on the Baleno or Scorpio-N page shows the "treated as 0★" note; clicking Reliability on the Seltos page shows "No CSI report available").
- `/browse` filters correctly when a company button is clicked.

Stop the dev server afterward.

- [ ] **Step 9: Commit**

```bash
git add src/router/index.ts src/router/routes.ts src/App.vue src/main.ts src/App.test.ts
git commit -m "feat: wire router, navigation, and app shell"
```

---

## Backlog / explicitly out of scope for this plan

- Real Supabase connection (swap `carDataService.ts`'s internals only; component/view code should not need to change).
- The Python data pipeline, live Team-BHP scraping, and sentiment model integration.
- User-submitted ratings/reviews and auth.
- Expanding the mock dataset from 10 models to the full top-25 list.
- The Compare page (stretch goal per the spec).

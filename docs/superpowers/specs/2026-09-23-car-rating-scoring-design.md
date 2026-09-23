# Car Rating Website — Scoring & Data Design

**Status:** In progress (brainstorming) — architecture, scoring formula, pipeline flow, and frontend pages agreed.
**Date:** 2026-09-23

## Purpose

A website where a user picks an Indian car company/model and sees ratings across
several factors (reliability, safety, repairability, value-for-money) plus an
overall score out of 100 — with a transparent breakdown of *why* a car scored
what it did.

## Scope (v1)

- **Market:** India only.
- **Coverage:** Top 25 popular car models in India (curated list, not full market).
- **User-submitted ratings/reviews:** explicitly backlogged. v1 is read-only —
  scores computed from public data sources only, no auth, no submission flow.
- **Review data source:** Team-BHP forums only. Instagram was considered and
  rejected — scraping Instagram violates their ToS and risks IP bans. Team-BHP
  is scraped instead (still respect robots.txt/rate limits).

## Why rule-based scoring, not a trained ML model

Considered training a supervised model to predict scores, but rejected for v1:
- No historical ground-truth outcome data (e.g. verified failure rates) exists
  to train against.
- Only ~25 data points — far too few to train anything meaningful even if
  labels existed.
- A transparent weighted formula is explainable ("why did this car score
  72/100") which matters for user trust and for a hackathon demo.

The only place a "model" is used is an **off-the-shelf pretrained sentiment/NLP
model** to convert Team-BHP forum text into a numeric signal — this is not a
custom-trained scoring model, just a text→number preprocessing step feeding
into the rule-based formula below.

**Future idea (not v1):** once real user ratings accumulate, periodically
correlate pillar weights against user satisfaction and adjust weights over
time. Noted as a backlog enhancement, not built now.

## Architecture

Three pieces, no custom backend server needed for v1:

1. **Data pipeline (Python, offline/batch)** — scrapes Team-BHP threads for the
   25 cars, runs sentiment scoring, and ingests recall data, Global
   NCAP/Bharat NCAP ratings, CSI report figures, dealership/service-center
   counts, and parts price data (manually curated where no clean API exists).
   Writes normalized raw signals + computed scores into Supabase.
2. **Supabase (Postgres)** — stores raw signals per car and computed
   pillar/overall scores. Frontend queries it directly via Supabase's
   auto-generated REST/PostgREST API — no custom API server for v1.
3. **Vue frontend** — user picks a company/model, sees pillar scores and
   overall score, with a breakdown explaining each subscore (e.g. "reliability
   78/100 — 2 recalls in 5 years, CSI score 82, forum sentiment positive").

## Data model (Supabase / Postgres tables)

- `companies` — id, name, logo_url
- `models` — id, company_id, name, segment, launch_year, price_min, price_max
- `recalls` — id, model_id, date, severity, description
- `safety_ratings` — id, model_id, source (global_ncap / bharat_ncap),
  adult_stars, child_stars, tested_variant, abs, esc, airbags_count,
  adas_present
- `csi_reports` — id, model_id, source, year, score
- `dealership_data` — id, company_id, service_center_count, dealership_count
  (company-level stat, not per-model)
- `parts_price` — id, model_id, avg_price_index (normalized index vs. segment
  average, not a full parts catalog)
- `forum_sentiment` — id, model_id, source ("teambhp"), thread_url, aspect
  (reliability / service / value), sentiment_score, collected_at
- `computed_scores` — model_id, reliability_score, safety_score,
  repairability_score, value_score, overall_score, breakdown (jsonb
  explaining each subscore), last_computed_at
- `weights` — config table/JSON holding the tunable weights below, so
  weights can change without redeploying the pipeline

The Python pipeline writes into the raw tables and computes `computed_scores`
from them. The Vue frontend reads mainly from `models` + `computed_scores`,
and can drill into raw tables to show the "why" breakdown.

## Pillars

- **Reliability** — recalls (count/severity), CSI report score, Team-BHP
  sentiment (mechanical issues aspect)
- **Safety** — Global NCAP / Bharat NCAP adult + child occupant star ratings
  (passive safety), plus active safety features present (ABS, ESC, airbag
  count, ADAS)
- **Repairability** — parts price, dealership/service-center density,
  Team-BHP sentiment (service experience aspect)
- **Value-for-money** — price vs. segment average, running cost, ownership
  sentiment (value aspect)
- **Overall** — combination of the four pillars above

## Scoring formula

**Normalization:**
- Already-bounded signals (NCAP stars, feature presence) → fixed mapping
  tables (e.g. 5★ = 100, 4★ = 80, ... 0★ = 0)
- Unbounded signals (recall counts, price index, dealership counts) →
  min-max normalized *relative to the 25-car dataset*, not an absolute global
  scale

**Per-pillar formulas** (weights below are defaults, stored in the `weights`
table/config, tunable without a redeploy):

```
reliability      = 0.4 * recall_score
                  + 0.3 * csi_score
                  + 0.3 * forum_sentiment(reliability aspect)

safety           = 0.6 * ncap_score
                  + 0.4 * active_safety_features_score

repairability    = 0.4 * parts_price_score   (inverted: cheaper parts vs. segment avg = higher score)
                  + 0.3 * service_density_score
                  + 0.3 * forum_sentiment(service aspect)

value_for_money  = 0.5 * price_vs_segment_score
                  + 0.5 * forum_sentiment(value aspect)

overall          = average(reliability, safety, repairability, value_for_money)   -- 25% each by default
```

**Missing-data policy (two different rules — do not conflate them):**

- **General rule:** if a signal is genuinely unavailable (e.g. no CSI report
  for a model), drop that term from the weighted average and re-normalize
  the remaining weights. Do not fabricate a default value. The breakdown UI
  explicitly flags what's missing (e.g. "no CSI report available").
- **Safety-specific exception:** if a model has **not** been crash-tested by
  Global NCAP or Bharat NCAP, `ncap_score` is **not** dropped/re-normalized —
  it is explicitly set to **0** (treated as 0★ equivalent). This is a
  deliberate policy: untested is itself a meaningful signal in the Indian
  market (manufacturers sometimes avoid testing deliberately), so it should
  hurt the score rather than being ignored. The breakdown UI shows: "Not
  crash-tested by Global NCAP/Bharat NCAP — treated as 0★ for safety
  scoring."

## Tech stack

- **Frontend:** Vue
- **Database/backend:** Supabase (Postgres + auto-generated REST API,
  Supabase Auth available later for the backlogged user-review feature)
- **Data pipeline:** Python (scraping via requests/BeautifulSoup, sentiment
  via an off-the-shelf pretrained model/library, writes results to Supabase)

## Pipeline flow

Given how many of these Indian-specific signals (recalls, CSI reports,
dealership counts, parts price index) don't have a clean scrapeable API, the
pipeline is a mix of manual curation and automation, not one big scraper:

1. **Seed reference data** — `companies`/`models` for the top 25, entered
   once as a JSON/CSV seed file, loaded into Supabase by a small `seed.py`.
2. **Manually curated raw signals** — recalls, NCAP/Bharat NCAP ratings, CSI
   report scores, dealership/service-center counts, parts price index.
   Hand-collected into CSV/JSON files (no reliable public API covers all of
   these for India) and loaded via `load_raw_signals.py`.
3. **Automated Team-BHP scraping + sentiment** — `scrape_teambhp.py` fetches
   relevant threads per model, extracts text, and a pretrained sentiment
   model scores it per aspect (reliability/service/value), writing into
   `forum_sentiment`.
4. **Compute scores** — `compute_scores.py` reads all raw tables + the
   `weights` config and (re)computes `computed_scores` per model, applying
   the formula and the missing-data/safety-0★ rules.
5. **Orchestration** — no scheduler/cron needed for v1; a single
   `run_all.py` runs the steps in order. Re-run manually whenever source
   data is updated.
6. **Idempotency/error handling** — every write is an upsert keyed on
   `model_id` so reruns are safe; a failed scrape on one thread logs and
   skips rather than aborting the whole batch; each raw row keeps a
   `collected_at` timestamp for staleness visibility.

## Frontend pages/components

- **Homepage** — the "why this matters" landing page: explains the pain
  points ratings address for Indian buyers (safety in a market with
  historically weak crash testing, hidden repair costs, etc.), briefly
  describes the four pillars and how scores are built (the transparency
  angle), and features a **peek carousel** — one car shown centered/full
  width with ~50% of the neighboring cars visible on either side, click/swipe
  to move through; clicking a car navigates to its detail page.
- **Browse page** — full filterable/sortable grid of all 25 cars. Each card:
  company logo, model name, overall score badge (color-coded —
  green/amber/red).
- **Model detail page** — overall score prominent, four pillar scores shown
  as bars/gauges, and an expandable "why" breakdown per pillar showing the
  raw signals behind it (recall list, NCAP star rating with source,
  sentiment excerpt counts, dealership count, etc.).
- **Compare page** — side-by-side comparison of 2-3 models. Stretch goal, not
  core v1, given hackathon time.
- **Components:** `CarCarousel` (peek-style, homepage only), `CarCard`,
  `ScoreBadge`/`ScoreGauge`, `PillarBreakdown`, `CompanyFilter`.

## Backlog (explicitly deferred from v1)

- User-submitted ratings/reviews (would need Supabase Auth to prevent
  spam/duplicate votes)
- Weight auto-tuning based on correlation with accumulated user ratings
  (Approach C from the original brainstorm — noted as future, not v1)
- Broader coverage beyond the top 25 models
- Instagram or other social sources for sentiment (rejected for ToS/legal
  reasons)


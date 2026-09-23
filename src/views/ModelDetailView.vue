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

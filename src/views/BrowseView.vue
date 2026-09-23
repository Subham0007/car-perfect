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

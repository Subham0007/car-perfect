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

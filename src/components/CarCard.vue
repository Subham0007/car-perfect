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

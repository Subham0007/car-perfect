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

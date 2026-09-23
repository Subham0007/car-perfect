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

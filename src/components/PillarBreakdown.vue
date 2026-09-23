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

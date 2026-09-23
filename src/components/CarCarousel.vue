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

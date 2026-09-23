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

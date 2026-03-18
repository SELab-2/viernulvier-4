<script setup lang="ts">
import { ref } from 'vue'
import { useProductionApi } from '../composables/useProductionApi'
import ProductionViewItem from '../components/productionListViewItem.vue'
import type { ProductionView } from '@repo/common'

const productions = ref<ProductionView[]>([])
const { getAll } = useProductionApi()

const response = await getAll({
  limit: 5,
  lang: 'nl',
})

if (response.data?.objects) {
  productions.value = response.data.objects as ProductionView[]
} else {
  console.error("Failed to load productions:", response.error)
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 px-6 py-12">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Overzicht</p>
        <h1 class="text-2xl font-bold text-zinc-800">Producties</h1>
      </div>

      <!-- List -->
      <div class="flex flex-col gap-2">
        <ProductionViewItem
          v-for="production in productions"
          :key="production.id"
          :productionView="production"
        />
      </div>

      <!-- Footer count -->
      <p class="mt-6 text-xs text-zinc-400 text-right">{{ productions.length }} producties geladen</p>

    </div>
  </div>
</template>

<style scoped>
</style>
<script setup lang="ts">
import { ref } from 'vue'
import { useProductionApi } from '../composables/useProductionApi'
import ProductionViewItem from '../components/productionListViewItem.vue'
import type { ProductionView } from '@repo/common'

const productions = ref<ProductionView[]>([])
const { getAll } = useProductionApi()

const response = await getAll({
  limit: 6,
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
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-2">Overzicht</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-zinc-800">Producties showcase</h1>
        <p class="mt-2 text-sm text-zinc-500">This page previews the new list view item component for production.</p>
      </div>

      <!-- List - each item full width -->
      <div class="flex flex-col items-center gap-3">
        <div v-for="production in productions" :key="production.id" class="w-full">
          <ProductionViewItem :productionView="production" />
        </div>
      </div>

      <!-- Footer count -->
      <p class="mt-8 text-sm text-zinc-400 text-right">{{ productions.length }} producties geladen</p>

    </div>
  </div>
</template>

<style scoped>
</style>
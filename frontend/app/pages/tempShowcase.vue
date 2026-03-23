<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductionApi } from '../composables/useProductionApi'
import ProductionViewItem from '../components/productionListViewItem.vue'
import type { ProductionView } from '@repo/common'

const { locale } = useI18n()
const isDark = ref(false)
const productions = ref<ProductionView[]>([])
const { getAll } = useProductionApi()

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const loadProductions = async () => {
  const response = await getAll({
    limit: 20,
    lang: locale.value as 'nl' | 'en',
  })

  if (response.data?.objects) {
    productions.value = response.data.objects as ProductionView[]
  } else {
    console.error("Failed to load productions:", response.error)
  }
}

await loadProductions()
watch(locale, loadProductions)
</script>

<template>
  <div class="min-h-screen px-6 py-12" :class="isDark ? 'bg-zinc-900' : 'bg-zinc-50'">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-2">Overzicht</p>
          <h1 class="text-3xl sm:text-4xl font-bold text-zinc-800">Producties showcase</h1>
          <p class="mt-2 text-sm text-zinc-500">This page previews the new list view item component for production.</p>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2">
          <button @click="locale = locale === 'nl' ? 'en' : 'nl'" class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer uppercase">
            {{ locale }}
          </button>
          <button @click="toggleDark" class="px-3 py-1.5 rounded-lg text-sm border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
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
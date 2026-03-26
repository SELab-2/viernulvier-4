<!--
  TEMPORARY SHOWCASE PAGE — dev/testing only.
  Displays productions in a grid using ProductionGridItem.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductionApi } from '../composables/useProductionApi'
import ProductionGridItem from '../components/productionGridViewItem.vue'
import type { ProductionView } from '@repo/common'

const { locale } = useI18n()
const { getAll } = useProductionApi()

// ── Dark mode ───────────────────────────────────────────────────────────────
const isDark = ref(document.documentElement.classList.contains('dark'))

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

// ── Productions ─────────────────────────────────────────────────────────────
const productions = ref<ProductionView[]>([])

const loadProductions = async () => {
  const response = await getAll({
    paginationFilters: { limit: 20, page: 1, descending: true },
    languageFilters: { lang: locale.value as 'nl' | 'en' },
  })
  if (response.data?.objects) {
    productions.value = response.data.objects as ProductionView[]
  } else {
    console.error('Failed to load productions:', response.error)
  }
}

await loadProductions()
watch(locale, loadProductions)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-200">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-card-border">
      <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        <div class="flex items-center gap-2">
          <span class="font-brand text-xs font-black px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 uppercase tracking-widest">
            Temp
          </span>
          <span class="text-sm text-muted-foreground">ProductionGridItem showcase</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Language toggle -->
          <button
            @click="locale = locale === 'nl' ? 'en' : 'nl'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest border border-card-border bg-card text-card-foreground hover:bg-card-hover hover:border-ring transition-colors duration-150 cursor-pointer"
          >
            {{ locale }}
          </button>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDark"
            class="w-9 h-9 flex items-center justify-center rounded-lg border border-card-border bg-card text-card-foreground hover:bg-card-hover hover:border-ring transition-colors duration-150 cursor-pointer"
            :title="isDark ? 'Light mode' : 'Dark mode'"
          >
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ── Main ────────────────────────────────────────────────────────── -->
    <main class="max-w-7xl mx-auto px-6 py-10">

      <!-- Page title -->
      <div class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Overzicht</p>
        <h1 class="font-brand text-3xl sm:text-4xl font-black text-foreground">Producties showcase</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Temporary page previewing the <code class="text-xs bg-muted px-1 py-0.5 rounded">ProductionGridItem</code> component.
        </p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductionGridItem
          v-for="production in productions"
          :key="production.id"
          :productionView="production"
        />
      </div>

      <!-- Footer count -->
      <p class="mt-8 text-sm text-muted-foreground text-right">
        {{ productions.length }} producties geladen
      </p>

    </main>
  </div>
</template>

<style scoped>
</style>
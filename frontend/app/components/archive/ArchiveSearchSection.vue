<script setup lang="ts">
import { LayoutGrid, List } from 'lucide-vue-next'
import { useArchiveView } from '../../composables/useArchiveView'

const { t } = useI18n()
const { viewMode, searchQuery } = useArchiveView()
</script>

<template>
  <section class="w-full border-b border-border bg-background">
    <div class="max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">

      <!-- Search -->
      <div class="flex-1 h-12">
        <SearchBar
          v-model="searchQuery"
          :items="[]"
          :placeholder="t('archive.search_placeholder')"
        />
      </div>

      <!-- Filter -->
      <button class="btn-outline h-12 px-4">
        {{ t('archive.filter') }}
      </button>

      <!-- View toggle -->
      <button
        class="w-12 h-12 flex items-center justify-center rounded-md border-2 border-foreground bg-transparent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
      >
        <List v-if="viewMode === 'grid'" class="w-4 h-4" />
        <LayoutGrid v-else class="w-4 h-4" />
      </button>

    </div>
  </section>
</template>

<style scoped>
</style>
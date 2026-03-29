<script setup lang="ts">
import { LayoutGrid, List } from 'lucide-vue-next'
import { useArchiveView } from '../../composables/useArchiveView'

const { t } = useI18n()
const { viewMode, searchQuery } = useArchiveView()
</script>

<template>
  <section class="w-full border-b border-border bg-background">
    <div class="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

      <!-- Searchbar -->
      <div class="flex-1">
        <SearchBar
          v-model="searchQuery"
          :items="[]"
          :placeholder="t('archive.search_placeholder')"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">

        <!-- Filter button -->
        <button class="btn-outline">
          {{ t('archive.filter') }}
        </button>

        <!-- View mode toggle -->
        <button
          class="w-9 h-9 flex items-center justify-center rounded-md border-2 border-foreground transition-colors"
          :class="viewMode === 'grid' ? 'bg-foreground text-background' : 'bg-transparent text-foreground hover:bg-foreground hover:text-background'"
          :aria-label="viewMode === 'grid' ? t('archive.view_list') : t('archive.view_grid')"
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
        >
          <List v-if="viewMode === 'grid'" class="w-4 h-4" />
          <LayoutGrid v-else class="w-4 h-4" />
        </button>

      </div>

    </div>
  </section>
</template>

<style scoped>
</style>
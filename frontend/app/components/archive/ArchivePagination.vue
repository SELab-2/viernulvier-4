<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  currentPage: number
  totalPages: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'go-to-page', page: number): void
}>()

const { t } = useI18n()

const visiblePages = computed(() => {
  const tp = props.totalPages
  const cp = props.currentPage
  const pages: (number | '…')[] = []

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('…')
    const start = Math.max(2, cp - 1)
    const end   = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 2) pages.push('…')
    pages.push(tp)
  }
  return pages
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-10 flex items-center justify-center gap-1"
    :aria-label="t('archive.pagination')"
  >
    <!-- First page -->
    <button
      class="btn-outline px-2.5 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === 1 || loading"
      @click="emit('go-to-page', 1)"
      :aria-label="t('archive.first_page')"
    >««</button>

    <!-- Prev -->
    <button
      class="btn-outline px-3 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === 1 || loading"
      @click="emit('go-to-page', currentPage - 1)"
      :aria-label="t('archive.prev_page')"
    >← {{ t('archive.prev') }}</button>

    <!-- Page numbers -->
    <template v-for="(page, i) in visiblePages" :key="i">
      <span v-if="page === '…'" class="px-2 text-muted-foreground text-sm select-none">…</span>
      <button
        v-else
        class="inline-flex items-center justify-center w-9 h-9 rounded-md border-2 text-xs font-black uppercase transition-all"
        :class="page === currentPage
          ? 'bg-foreground text-background border-foreground cursor-default'
          : 'border-foreground/20 text-foreground hover:border-foreground bg-transparent cursor-pointer'
        "
        :disabled="loading"
        @click="emit('go-to-page', page as number)"
        :aria-current="page === currentPage ? 'page' : undefined"
      >{{ page }}</button>
    </template>

    <!-- Next -->
    <button
      class="btn-outline px-3 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages || loading"
      @click="emit('go-to-page', currentPage + 1)"
      :aria-label="t('archive.next_page')"
    >{{ t('archive.next') }} →</button>

    <!-- Last page -->
    <button
      class="btn-outline px-2.5 py-1.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages || loading"
      @click="emit('go-to-page', totalPages)"
      :aria-label="t('archive.last_page')"
    >»»</button>
  </nav>
</template>

<style scoped>
</style>
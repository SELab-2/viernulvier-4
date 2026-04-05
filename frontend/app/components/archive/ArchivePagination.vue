<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useArchiveView } from '../../composables/useArchiveView'

const { currentPage, totalPages, loading } = useArchiveView()
const { t } = useI18n()

const visiblePages = computed(() => {
  const tp = totalPages.value
  const cp = currentPage.value
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

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value || loading.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center gap-1.5"
    :aria-label="t('archive.pagination')"
  >
    <button
      class="w-9 h-9 flex items-center justify-center rounded-md border-2 border-foreground/20 text-foreground transition-colors hover:border-foreground disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === 1 || loading"
      @click="goToPage(currentPage - 1)"
      :aria-label="t('archive.prev_page')"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <template v-for="(page, i) in visiblePages" :key="i">
      <span
        v-if="page === '…'"
        class="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm select-none"
      >…</span>
      <button
        v-else
        class="w-9 h-9 flex items-center justify-center rounded-md border-2 text-sm font-black transition-all"
        :class="page === currentPage
          ? 'bg-foreground text-background border-foreground cursor-default'
          : 'border-foreground/20 text-foreground hover:border-foreground bg-transparent cursor-pointer'
        "
        :disabled="loading"
        @click="goToPage(page as number)"
        :aria-current="page === currentPage ? 'page' : undefined"
      >{{ page }}</button>
    </template>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md border-2 border-foreground/20 text-foreground transition-colors hover:border-foreground disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages || loading"
      @click="goToPage(currentPage + 1)"
      :aria-label="t('archive.next_page')"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </nav>
</template>
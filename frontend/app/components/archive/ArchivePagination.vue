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
    class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
    :aria-label="t('archive.pagination')"
  >
    <!-- First page -->
    <button
      class="w-12 h-9 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === 1 || loading"
      @click="goToPage(1)"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.65">
        <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
      </svg>
    </button>

    <!-- separator -->
    <span class="w-[2px] bg-foreground"></span>

    <!-- Previous -->
    <button
      class="w-12 h-9 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === 1 || loading"
      @click="goToPage(currentPage - 1)"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.65">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>

    <!-- separator -->
    <span class="w-[2px] bg-foreground"></span>

    <!-- Current page -->
    <span
      class="w-14 h-9 flex items-center justify-center bg-foreground text-background font-black text-sm"
    >
      {{ currentPage }}
    </span>

    <!-- separator -->
    <span class="w-[2px] bg-foreground"></span>

    <!-- Next -->
    <button
      class="w-12 h-9 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages || loading"
      @click="goToPage(currentPage + 1)"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.65">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    <!-- separator -->
    <span class="w-[2px] bg-foreground"></span>

    <!-- Last -->
    <button
      class="w-12 h-9 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages || loading"
      @click="goToPage(totalPages)"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.65">
        <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </nav>
</template>
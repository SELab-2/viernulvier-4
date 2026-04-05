<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArchiveView } from '../../composables/useArchiveView'

const { currentPage, totalPages, loading } = useArchiveView()
const { t } = useI18n()

const jumpInput = ref('')

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value || loading.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleJump() {
  const page = parseInt(jumpInput.value)
  if (!isNaN(page)) goToPage(page)
  jumpInput.value = ''
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm font-black uppercase tracking-wide text-muted-foreground">
      {{ t('archive.page_label') }}
    </span>
    <input
      v-model="jumpInput"
      type="number"
      :min="1"
      :max="totalPages"
      :placeholder="currentPage.toString()"
      :disabled="loading"
      @keydown.enter="handleJump"
      @blur="handleJump"
      class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
    <span class="text-sm font-black uppercase tracking-wide text-muted-foreground">
      {{ t('archive.of_pages', { total: totalPages }) }}
    </span>
  </div>
</template>
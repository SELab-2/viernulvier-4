import { ref } from 'vue'

export type ArchiveViewMode = 'grid' | 'list'

const viewMode    = ref<ArchiveViewMode>('grid')
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages  = ref(1)
const loading     = ref(false)
const sortOrder   = ref<'newest' | 'oldest'>('newest')
const dateFilter  = ref<{ after?: string; before?: string }>({})
const oldestDate  = ref('')
const tagIds      = ref<number[]>([])

export function useArchiveView() {
  return {
    viewMode,
    searchQuery,
    currentPage,
    totalPages,
    loading,
    sortOrder,
    dateFilter,
    oldestDate,
    tagIds,
  }
}
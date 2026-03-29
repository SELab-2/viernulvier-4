import { ref } from 'vue'

export type ArchiveViewMode = 'grid' | 'list'

const viewMode = ref<ArchiveViewMode>('grid')
const searchQuery = ref('')

export function useArchiveView() {
  return { viewMode, searchQuery }
}
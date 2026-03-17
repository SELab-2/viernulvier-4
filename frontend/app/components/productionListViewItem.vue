<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ProductionView, Tag } from '@repo/common'
import { useProductionApi } from '../composables/useProductionApi'

const { productionView } = defineProps<{
  productionView: ProductionView
}>()

const tags = ref<Tag[]>([])
const { getTags } = useProductionApi()

/**
 * Format text:
 *  - vervang backslashes (\) door <br>
 *  - laat HTML-tags intact
 */
function formatText(text: string | null) {
  if (!text) return ''
  return text.replace(/\\+/g, '<br>')
}

// Fetch tags for this production on mount
onMounted(async () => {
  if (productionView && productionView.id) {
    const response = await getTags(productionView.id, 'nl')
    if (response.data) {
      tags.value = response.data as Tag[]
    } else {
      console.error('Failed to load tags:', response.error)
    }
  }
})
</script>

<template>
  <div>
    <h2>------------Titel--------------</h2>
    <h3>{{ productionView.titel }}</h3>

    <h2>----------description-1-formatted--------</h2>
    <p v-html="formatText(productionView.description1)"></p>

    <h2>----------description-1----------</h2>
    <p>{{productionView.description1}}</p>

    <h2>---------description-2----------</h2>
    <p v-html="formatText(productionView.description2)"></p>

    <h2>--------------tagline-------------</h2>
    <p>{{ productionView.tagline }}</p>

    <h2>-------------credits--------------</h2>
    <p>{{ productionView.credits }}</p>

    <h2>-------------artist-------------</h2>
    <p>{{ productionView.artist }}</p>

    <h2>---------------tags---------------</h2>
    <ul>
      <li v-for="tag in tags" :key="tag.id">{{ tag.tag }}</li>
    </ul>
  </div>
</template>

<style scoped>
</style>
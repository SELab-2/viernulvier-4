<script setup lang="ts">
import { ref } from 'vue'
import { useProductionApi } from '../composables/useProductionApi'
import ProductionViewItem from '../components/productionListViewItem.vue'
import type { ProductionView } from '@repo/common'

const productions = ref<ProductionView[]>([])
const { getAll } = useProductionApi()

const response = await getAll({
  limit: 5,
  lang: 'nl',
})

if (response.data?.objects) {
  productions.value = response.data.objects as ProductionView[]
} else {
  console.error("Failed to load productions:", response.error)
}

</script>

<template>
  <div>
    <ProductionViewItem
      v-for="production in productions"
      :key="production.id"
      :productionView="production"
    />
  </div>
</template>

<style scoped>

</style>
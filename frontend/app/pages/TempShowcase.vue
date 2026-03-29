<script setup lang="ts">
import type { StoryItem } from '../types/StoryItem'

const stories: StoryItem[] = [
  {
    id: '1',
    title: 'TITEL 1',
    date: new Date(2025, 2, 15),
    description: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  {
    id: '2',
    title: 'TITEL 2',
    date: new Date(2025, 3, 20),
    description: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb',
  },
  {
    id: '3',
    title: 'TITEL 3',
    date: new Date(2025, 5, 1),
    description: 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
  }
]
</script>

<template>
  <ProductionStoryListView :stories="stories" />
</template>

<style scoped>

</style>
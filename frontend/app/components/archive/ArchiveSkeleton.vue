<!--
ArchiveSkeleton.vue

Skeleton loading UI for the archive page.
Responsible for:
- Displaying placeholder content while archive data is loading
- Supporting both grid and list layout modes
- Matching the visual structure of ArchiveBody items for smooth UX transition
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    viewMode: "grid" | "list";
    pageSize?: number;
  }>(),
  {
    pageSize: 15,
  },
);

const { viewMode, pageSize } = props;
</script>

<template>
  <div
    :class="
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
        : 'flex flex-col gap-3'
    "
  >
    <div
      v-for="n in pageSize"
      :key="n"
      class="rounded-xl border border-card-border bg-card overflow-hidden animate-pulse"
      :class="viewMode === 'list' ? 'h-40.5' : ''"
    >
      <!-- Grid image -->
      <div v-if="viewMode === 'grid'" class="w-full aspect-video bg-muted" />

      <div
        class="p-4 flex gap-3"
        :class="viewMode === 'grid' ? 'flex-col' : 'items-center'"
      >
        <!-- List thumbnail -->
        <div
          v-if="viewMode === 'list'"
          class="w-48 h-32 bg-muted rounded-lg shrink-0"
        />

        <div class="flex flex-col gap-2 flex-1">
          <div class="h-4 w-3/4 bg-muted rounded" />
          <div class="h-3 w-1/2 bg-muted rounded" />
          <div class="h-5 w-1/3 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  </div>
</template>

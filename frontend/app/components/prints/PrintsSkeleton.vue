<!--
  components/prints/PrintsSkeleton.vue
  ====================================
  Animated loading skeleton for the first page fetch.
-->
<template>
  <div class="space-y-8">
    <!-- Simulate 3 category sections -->
    <div v-for="i in 3" :key="i" class="space-y-4">
      <!-- Header skeleton -->
      <div class="flex items-center gap-3 mb-3">
        <div class="h-7 w-32 bg-muted animate-pulse rounded" />
        <div class="h-4 w-16 bg-muted animate-pulse rounded" />
        <div class="flex-1 h-px bg-border" />
      </div>

      <!-- Grid skeleton -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="j in 4" :key="j" class="space-y-2">
          <div class="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
          <div class="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div class="flex gap-2">
            <div class="h-4 bg-muted animate-pulse rounded w-16" />
            <div class="h-4 bg-muted animate-pulse rounded w-20 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
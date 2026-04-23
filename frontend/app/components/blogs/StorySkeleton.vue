<!--
  components/blogs/StorySkeleton.vue
  ====================================
  Animated loading skeleton for the first page fetch.
-->
<template>
  <div class="space-y-12" aria-busy="true" aria-label="Loading stories">
    <div v-for="i in 2" :key="i">
      <div class="flex items-center gap-4 mb-6">
        <div class="h-8 w-16 bg-muted animate-pulse rounded" />
        <div class="h-4 w-24 bg-muted animate-pulse rounded" />
        <div class="flex-1 h-px bg-muted" />
      </div>

      <div class="space-y-6">
        <div v-for="k in 2" :key="k">
          <div class="flex items-center gap-3 mb-3">
            <div class="h-3 w-28 bg-muted animate-pulse rounded" />
            <div class="flex-1 h-px bg-muted" />
          </div>

          <div
            class="border border-border rounded-lg overflow-hidden divide-y divide-border"
          >
            <div v-for="j in 3" :key="j" class="flex animate-pulse">
              <div
                class="w-32 sm:w-40 shrink-0 bg-muted"
                style="aspect-ratio: 4/3; min-height: 88px"
              />
              <div class="flex-1 px-5 py-4 space-y-2.5">
                <div class="h-3.5 bg-muted rounded w-3/4" />
                <div class="h-3 bg-muted rounded w-1/2" />
                <div class="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

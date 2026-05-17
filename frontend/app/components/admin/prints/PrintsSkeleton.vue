<!--
  components/admin/prints/AdminPrintsSkeleton.vue
  ===============================================
  Animated loading skeleton for the first page fetch.
-->
<script lang="ts" setup>
const skel = "bg-muted-foreground/20 animate-pulse rounded";
const skel_muted = "bg-muted animate-pulse rounded";
</script>

<template>
  <div aria-busy="true" aria-label="Loading prints">
    <section class="bg-background w-full h-full pt-6">
      <div class="page-container flex items-center justify-between mb-0">
        <!-- "Results count" -->
        <div :class="`h-7 w-32 ${skel}`" />
        <!-- New print button -->
        <div :class="`h-10 w-32 ${skel}`" />
      </div>

      <!-- File list -->
      <div class="page-container py-6">
        <div class="rounded-lg border border-border overflow-hidden">
          <div
            v-for="i in 15"
            :key="i"
            class="flex items-center gap-4 px-4 py-3 border-t border-border bg-card first:border-t-0"
          >
            <!-- File icon -->
            <div :class="`w-9 h-9 rounded-md shrink-0 ${skel}`" />

            <!-- File info -->
            <div class="flex-1 min-w-0 space-y-1.5">
              <!-- File name -->
              <div :class="`h-3.5 ${skel} w-1/2`" />
              <!-- Type + date -->
              <div :class="`h-2.5 ${skel} w-1/3`" />
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2 shrink-0">
              <div :class="`h-9 w-9 ${skel}`" />
              <div :class="`h-9 w-9 ${skel}`" />
              <div :class="`h-9 w-9 ${skel}`" />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-16">
          <!-- SeriesPageJumper -->
          <div class="flex items-center gap-2">
            <div :class="`h-3 w-10 ${skel}`" />
            <div :class="`w-14 h-9 ${skel} rounded-md`" />
            <div :class="`h-3 w-14 ${skel}`" />
          </div>

          <!-- SeriesPagination -->
          <div
            class="inline-flex items-stretch rounded-md border-2 border-foreground/20 overflow-hidden"
          >
            <div v-for="j in 5" :key="j" class="flex items-center">
              <div :class="`w-11 h-8 ${skel}`" />
              <div v-if="j < 5" class="w-[2px] h-8 bg-foreground/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

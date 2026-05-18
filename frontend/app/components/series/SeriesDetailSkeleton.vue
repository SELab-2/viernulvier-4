<!--
  components/series/SeriesDetailSkeleton.vue
  ==========================================
  Animated loading skeleton for the first page fetch.
-->

<script lang="ts" setup>
const skel = "bg-muted-foreground/20 animate-pulse rounded";
const skel_muted = "bg-muted animate-pulse rounded";
</script>

<template>
  <div
    class="min-h-screen bg-background text-foreground"
    aria-busy="true"
    aria-label="Loading series"
  >
    <!-- Header section -->
    <section class="w-full border-b border-border bg-muted py-16 lg:py-24">
      <div class="page-container w-full">
        <!-- Back button -->
        <div class="flex items-center gap-1 mb-8">
          <div :class="`h-3 w-3 ${skel}`" />
          <div :class="`h-3 w-12 ${skel}`" />
        </div>

        <!-- Title -->
        <div class="space-y-3 mb-6">
          <div :class="`h-14 lg:h-20 w-2/3 ${skel}`" />
        </div>

        <!-- Description -->
        <div class="max-w-5xl space-y-3">
          <div :class="`h-5 w-full ${skel}`" />
          <div :class="`h-5 w-full ${skel}`" />
          <div :class="`h-5 w-4/5  ${skel}`" />
          <div :class="`h-5 w-full ${skel}`" />
        </div>
      </div>
    </section>

    <!-- Content section -->
    <section class="py-20">
      <div class="page-container">
        <!-- Production count -->
        <div :class="`h-3 w-32 ${skel} mb-6`" />

        <!-- Linked productions -->
        <section class="page-container pb-14 pt-10">
          <!-- Title -->
          <div class="mb-6">
            <div :class="`h-6 w-48 ${skel}`" />
          </div>

          <!-- Production list items -->
          <div class="flex flex-col gap-4">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card"
            >
              <!-- Thumbnail -->
              <div :class="`w-48 h-32 ${skel} rounded-lg shrink-0`" />

              <!-- Info -->
              <div :class="`flex-1 min-w-0 space-y-3`">
                <!-- Title -->
                <div :class="`h-7 ${skel} w-2/3`" />
                <!-- Artist -->
                <div :class="`h-4 ${skel} w-1/3`" />
                <!-- Calender icon + date -->
                <div class="flex items-center gap-2 mt-2">
                  <div :class="`w-4 h-4 ${skel}`" />
                  <div :class="`h-4 ${skel} w-40`" />
                </div>
                <!-- Tags -->
                <div class="flex gap-2 mt-2">
                  <div :class="`h-5 w-16 ${skel} rounded-full`" />
                  <div :class="`h-5 w-20 ${skel} rounded-full`" />
                  <div :class="`h-5 w-14 ${skel} rounded-full`" />
                </div>
              </div>
            </div>
          </div>
        </section>

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

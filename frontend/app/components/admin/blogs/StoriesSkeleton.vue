<!--
  components/admin/blogs/StoriesSkeleton.vue
  =====================================================
  Animated loading skeleton for the first page fetch.
-->
<script lang="ts" setup>
const skel = "bg-muted-foreground/20 animate-pulse rounded";
const skel_muted = "bg-muted animate-pulse rounded";
</script>

<template>
  <div aria-busy="true" aria-label="Loading admin stories">
    <section class="bg-background pt-6 pb-6 h-full">
      <div class="page-container">
        <div class="flex items-center justify-between mb-6">
          <!-- "Results count" -->
          <div :class="`h-7 w-32 ${skel}`" />
          <!-- New story button -->
          <div :class="`h-10 w-32 ${skel}`" />
        </div>

        <!-- Story list items (10) -->
        <div class="space-y-3">
          <div
            v-for="i in 10"
            :key="i"
            class="flex overflow-hidden rounded-xl border border-border bg-card h-[136px]"
          >
            <!-- Thumbnail -->
            <div :class="`w-32 sm:w-52 shrink-0 ${skel} rounded-none`" />

            <!-- Info -->
            <div class="flex-1 min-w-0 flex flex-col justify-between px-5 py-4">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-2 flex-1">
                  <!-- Title -->
                  <div :class="`h-4 ${skel} w-3/4`" />
                  <!-- Description -->
                  <div :class="`h-3 ${skel} w-full`" />
                  <div :class="`h-3 ${skel} w-4/5`" />
                </div>

                <!-- Edit + delete buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  <div :class="`h-10 w-10 ${skel}`" />
                  <div :class="`h-10 w-10 ${skel}`" />
                </div>
              </div>

              <!-- Date -->
              <div :class="`h-3 ${skel} w-24`" />
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

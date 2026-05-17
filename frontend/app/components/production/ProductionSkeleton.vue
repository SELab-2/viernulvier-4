<!--
  components/production/ProductionSKeleton.vue
  =======================================
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
    aria-label="Loading production"
  >
    <!-- Hero banner -->
    <section
      class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted animate-pulse"
    >
      <div class="relative z-10 page-container pb-12 w-full">
        <!-- Back link + type display -->
        <div class="flex items-center gap-4 mb-8">
          <div class="h-3 w-14 bg-muted-foreground/20 rounded" />
          <div
            class="h-6 w-24 bg-muted-foreground/20 rounded-sm border border-muted-foreground/20"
          />
        </div>

        <!-- Title -->
        <div class="space-y-3 mb-4">
          <div class="h-14 lg:h-20 w-2/3 bg-muted-foreground/20 rounded" />
        </div>

        <!-- Artist -->
        <div class="h-7 w-48 bg-muted-foreground/20 rounded mb-8" />

        <!-- Tags -->
        <div class="flex gap-3 mt-8">
          <div class="h-8 w-20 bg-muted-foreground/20 rounded-full" />
          <div class="h-8 w-28 bg-muted-foreground/20 rounded-full" />
          <div class="h-8 w-16 bg-muted-foreground/20 rounded-full" />
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="page-container">
        <!-- Tagline -->
        <div class="mb-10 border-l-4 border-accent/30 pl-6">
          <div :class="`h-6 ${skel_muted} w-3/4 mb-2`" />
          <div :class="`h-6 ${skel_muted} w-1/2`" />
        </div>

        <!-- Description "text" -->
        <div class="space-y-4 mb-12">
          <div :class="`h-5 ${skel_muted} w-full`" />
          <div :class="`h-5 ${skel_muted} w-full`" />
          <div :class="`h-5 ${skel_muted} w-5/6`" />
          <div :class="`h-5 ${skel_muted} w-full`" />
          <div :class="`h-5 ${skel_muted} w-4/5`" />
          <div :class="`h-5 ${skel_muted} w-full`" />
          <div :class="`h-5 ${skel_muted} w-3/4`" />
        </div>

        <!-- Events table -->
        <div class="mt-12 mb-16">
          <!-- Title -->
          <div :class="`h-7 w-32 ${skel_muted} mb-4`" />

          <div
            class="overflow-hidden rounded-lg border-[1.5px] border-border bg-card"
          >
            <!-- Table header (icon + title for each)-->
            <!-- Percentages are column sizes -->
            <div
              class="grid bg-muted px-0"
              style="grid-template-columns: 40% 40% 20%"
            >
              <div class="p-4 flex items-center gap-1.5">
                <div
                  class="w-3.5 h-3.5 bg-muted-foreground/30 rounded shrink-0"
                />
                <div class="h-3 w-24 bg-muted-foreground/30 rounded" />
              </div>
              <div class="p-4 flex items-center gap-1.5">
                <div
                  class="w-3.5 h-3.5 bg-muted-foreground/30 rounded shrink-0"
                />
                <div class="h-3 w-20 bg-muted-foreground/30 rounded" />
              </div>
              <div class="p-4 flex items-center gap-1.5">
                <div
                  class="w-3.5 h-3.5 bg-muted-foreground/30 rounded shrink-0"
                />
                <div class="h-3 w-12 bg-muted-foreground/30 rounded" />
              </div>
            </div>

            <!-- Table rows -->
            <div
              v-for="i in 3"
              :key="i"
              class="grid border-t-2 border-border"
              style="grid-template-columns: 40% 40% 20%"
            >
              <!-- Date + time -->
              <div class="p-4 space-y-2">
                <div :class="`h-4 ${skel} w-32`" />
                <div class="flex items-center gap-1">
                  <div :class="`w-3 h-3 ${skel} shrink-0`" />
                  <div :class="`h-3 ${skel} w-20`" />
                </div>
              </div>
              <!-- Location -->
              <div class="p-4">
                <div :class="`h-4 ${skel} w-28`" />
              </div>
              <!-- Price -->
              <div class="p-4 space-y-1.5">
                <div :class="`h-3 ${skel} w-16`" />
                <div :class="`h-4 ${skel} w-12`" />
              </div>
            </div>
          </div>
        </div>

        <!-- Stories -->
        <div class="my-16">
          <!-- Title -->
          <div :class="`h-7 w-24 ${skel} mb-4`" />

          <!-- Story list items -->
          <div class="flex flex-col space-y-2">
            <div
              v-for="i in 3"
              :key="i"
              class="group flex overflow-hidden rounded-lg border border-card-border bg-card h-[120px] sm:h-[136px]"
            >
              <!-- Thumbnail -->
              <div
                class="shrink-0 self-stretch w-36 sm:w-52 bg-muted-foreground/20 animate-pulse"
              />

              <!-- Text -->
              <div
                class="flex-1 min-w-0 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4"
              >
                <div class="space-y-2">
                  <!-- Title -->
                  <div :class="`h-4 ${skel} w-3/4`" />
                  <!-- Description -->
                  <div :class="`h-3 ${skel} w-full mt-1`" />
                  <div :class="`h-3 ${skel} w-4/5`" />
                </div>

                <!-- Date -->
                <div :class="`h-3 ${skel} w-24 mt-2`" />
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery -->
        <div class="my-16">
          <!-- Title -->
          <div :class="`h-7 w-24 ${skel_muted} mb-4`" />

          <div class="flex items-center gap-4 px-4 sm:px-12 md:px-16">
            <!-- Prev arrow -->
            <div :class="`w-10 h-10 ${skel_muted}-full shrink-0`" />

            <!-- Main image -->
            <div :class="`flex-1 aspect-[16/9] ${skel_muted}-2xl`" />

            <!-- Next arrow -->
            <div :class="`w-10 h-10 ${skel_muted}-full shrink-0`" />
          </div>

          <!-- Slide counter -->
          <div class="mt-4 flex justify-center">
            <div :class="`h-3 w-10 ${skel_muted}`" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

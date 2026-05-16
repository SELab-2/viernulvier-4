<!--
  components/stories/StoriesSkeleton.vue
  =======================================
  Animated loading skeleton for the first page fetch.
-->

<template>
  <div
    class="min-h-screen bg-background text-foreground"
    aria-busy="true"
    aria-label="Loading story"
  >
    <!-- Hero banner -->
    <section
      class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted animate-pulse"
    >
      <div class="relative z-10 page-container pb-12 w-full">
        <!-- Back link + reading time row -->
        <div class="flex items-center gap-6 mb-8">
          <div class="h-3 w-14 bg-muted-foreground/20 rounded" />
          <div class="h-3 w-20 bg-muted-foreground/20 rounded" />
        </div>

        <!-- Title -->
        <div class="space-y-3 mb-4">
          <div class="h-14 lg:h-20 w-3/4 bg-muted-foreground/20 rounded" />
        </div>

        <!-- Publication date -->
        <div class="h-5 w-36 bg-muted-foreground/20 rounded" />
      </div>
    </section>

    <!-- Article body -->
    <section class="pt-20 pb-10">
      <div class="page-container">
        <article class="relative w-full">
          <!-- Decorative vertical line on the left -->
          <div
            class="hidden md:block absolute left-0 top-0 bottom-0 w-[2px] opacity-20"
            style="
              background: linear-gradient(
                to bottom,
                transparent,
                #9333ea,
                transparent
              );
            "
            aria-hidden="true"
          />

          <!-- Article body "text" -->
          <div class="md:pl-10 w-full space-y-4">
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-5/6" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-4/5" />

            <div class="pt-2" />

            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-3/4" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-5/6" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-2/3" />

            <div class="pt-2" />

            <div class="h-5 bg-muted animate-pulse rounded w-full" />
            <div class="h-5 bg-muted animate-pulse rounded w-4/5" />
            <div class="h-5 bg-muted animate-pulse rounded w-full" />
          </div>
        </article>
      </div>
    </section>

    <!-- Linked productions -->
    <section class="page-container pb-14 border-t border-border pt-10">
      <!-- Title -->
      <div class="mb-6">
        <div class="h-6 w-48 bg-muted animate-pulse rounded" />
      </div>

      <!-- Production list items -->
      <div class="flex flex-col gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card"
        >
          <!-- Thumbnail -->
          <div class="w-48 h-32 bg-muted animate-pulse rounded-lg shrink-0" />

          <!-- Info -->
          <div class="flex-1 min-w-0 space-y-3">
            <!-- Title -->
            <div class="h-7 bg-muted animate-pulse rounded w-2/3" />
            <!-- Artist -->
            <div class="h-4 bg-muted animate-pulse rounded w-1/3" />
            <!-- Calender icon + data -->
            <div class="flex items-center gap-2 mt-2">
              <div class="w-4 h-4 bg-muted animate-pulse rounded" />
              <div class="h-4 bg-muted animate-pulse rounded w-40" />
            </div>
            <!-- Tags -->
            <div class="flex gap-2 mt-2">
              <div class="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div class="h-5 w-20 bg-muted animate-pulse rounded-full" />
              <div class="h-5 w-14 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article footer -->
    <section class="pb-20">
      <div class="page-container">
        <div
          class="pt-8 border-t border-border flex items-center justify-between"
        >
          <!-- Date -->
          <div class="h-3 w-24 bg-muted animate-pulse rounded" />
          <!-- Back link -->
          <div
            class="h-8 w-20 bg-muted animate-pulse rounded border border-card-border"
          />
        </div>
      </div>
    </section>
  </div>
</template>

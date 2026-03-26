<!--
  components/blogs/StorySkeleton.vue
  ====================================
  This file implements the animated loading skeleton displayed while the first
  page of stories is being fetched from the backend API.

  Structure
  ---------
  Two fake year groups are rendered, each containing two fake month groups,
  each of which contains three fake story cards.  This mirrors the rough shape
  of a real loaded timeline so the page does not shift significantly when the
  real content arrives.

  Animation
  ---------
  All placeholder blocks use Tailwind's `animate-pulse` utility which fades
  the `bg-muted` colour in and out, giving a soft breathing effect that
  communicates loading activity without being distracting.

  Accessibility
  -------------
  The root element carries `aria-busy="true"` and a descriptive `aria-label`
  so assistive technologies can announce that content is loading.  All
  skeleton blocks are purely decorative and carry no ARIA roles of their own.
-->

<template>
  <div class="space-y-12" aria-busy="true" aria-label="Loading stories">

    <!-- Two fake year blocks -->
    <div v-for="i in 2" :key="i">

      <!-- Fake year heading -->
      <div class="flex items-center gap-4 mb-6">
        <div class="h-8 w-16 bg-muted animate-pulse rounded" />
        <div class="h-4 w-24 bg-muted animate-pulse rounded" />
        <div class="flex-1 h-px bg-muted" />
      </div>

      <!-- Two fake month groups per year -->
      <div class="space-y-6">
        <div v-for="k in 2" :key="k">

          <!-- Fake month heading -->
          <div class="flex items-center gap-3 mb-3">
            <div class="h-3 w-28 bg-muted animate-pulse rounded" />
            <div class="flex-1 h-px bg-muted" />
          </div>

          <!-- Three fake story cards per month -->
          <div class="border border-border rounded-lg overflow-hidden divide-y divide-border">
            <div v-for="j in 3" :key="j" class="flex animate-pulse">

              <!-- Fake thumbnail -->
              <div
                class="w-32 sm:w-40 shrink-0 bg-muted"
                style="aspect-ratio: 4/3; min-height: 88px;"
              />

              <!-- Fake text lines -->
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
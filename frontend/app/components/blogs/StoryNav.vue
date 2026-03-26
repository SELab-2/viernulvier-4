<!--
  components/blogs/StoryNav.vue
  ==============================
  This file implements the year-navigation sidebar shown to the left of the
  blog list on all screen sizes.  It is always visible — there is no mobile/
  desktop split; the sidebar simply narrows on small screens.

  Layout
  ------
  A thin vertical rule connects all year markers.  Each year is represented
  by a dot sitting on the line with the year label to its right.  The active
  year dot is filled purple; inactive ones are hollow.  Clicking a marker
  smooth-scrolls the page to the corresponding year section.

  Events
  ------
  @scroll-to(year: string)  Emitted when the user clicks a year marker.
                             The parent (StoryTimeline) scrolls the page to
                             the corresponding year section.
-->

<script lang="ts" setup>
const props = defineProps<{
  years: string[];
  activeYear: string;
}>();

const emit = defineEmits<{
  (e: "scroll-to", year: string): void;
}>();
</script>

<template>
  <!-- Render as soon as there is at least one year -->
  <nav
    v-if="years.length >= 1"
    class="w-14 sm:w-16 shrink-0"
    aria-label="Year navigation"
  >
    <div class="sticky top-24">
      <div class="relative flex flex-col items-center py-2 gap-0">

        <!-- Vertical connecting rule -->
        <div
          class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border"
          aria-hidden="true"
        />

        <!-- One marker per year -->
        <button
          v-for="year in years"
          :key="year"
          class="
            relative flex flex-col items-center w-full py-3
            group focus-visible:outline-none
          "
          :aria-label="`Scroll to ${year}`"
          :aria-current="activeYear === year ? 'true' : undefined"
          @click="emit('scroll-to', year)"
        >
          <!-- Dot on the rule -->
          <div
            class="
              w-4 h-4 rounded-full border-2 z-10 transition-all duration-200
            "
            :class="
              activeYear === year
                ? 'bg-purple-500 border-purple-500 scale-125'
                : 'bg-background border-muted-foreground/40 group-hover:border-purple-400'
            "
          />

          <!-- Year label -->
          <span
            class="
              mt-1.5 font-brand font-black text-[9px] uppercase tracking-widest
              transition-colors duration-150 select-none leading-none
            "
            :class="
              activeYear === year
                ? 'text-purple-500'
                : 'text-muted-foreground/50 group-hover:text-foreground'
            "
          >
            {{ year }}
          </span>
        </button>

      </div>
    </div>
  </nav>
</template>
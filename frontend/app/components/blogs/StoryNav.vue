<!--
  components/blogs/StoryNav.vue
  ------------------------------
  Year-navigation rail.

  Layout
  ------
  Mobile  (< lg) : a horizontally scrollable row of year pills pinned just
                   below the toolbar.  Always visible, never hidden.
  Desktop (≥ lg) : the existing vertical sidebar with the dot-and-line rail.

  The active year is highlighted in both layouts.
-->

<script lang="ts" setup>
const props = defineProps<{
  years: string[];
  activeYear: string;
}>();

const emit = defineEmits<{
  (e: "scroll-to", year: string): void;
}>();

const { t } = useI18n();
</script>

<template>
  <!-- Desktop only — mobile pills are rendered inline in StoryTimeline -->
  <nav
    v-if="years.length > 1"
    class="hidden lg:block w-16 shrink-0"
    aria-label="Jaar navigatie"
  >
    <div class="sticky top-24">
      <div class="relative flex flex-col items-center py-2">
        <div class="blog-nav-rail" aria-hidden="true" />
        <button
          v-for="year in years"
          :key="year"
          class="blog-nav-year-btn font-brand"
          :aria-label="`Scroll naar ${year}`"
          :aria-current="activeYear === year ? 'true' : undefined"
          @click="emit('scroll-to', year)"
        >
          <div
            class="blog-nav-dot"
            :class="{ 'blog-nav-dot--active': activeYear === year }"
          />
          <span
            class="blog-nav-label"
            :class="{ 'blog-nav-label--active': activeYear === year }"
          >
            {{ year }}
          </span>
          <div v-if="activeYear === year" class="blog-nav-pill">
            {{ t("stories.now") }}
          </div>
        </button>
      </div>
    </div>
  </nav>
</template>
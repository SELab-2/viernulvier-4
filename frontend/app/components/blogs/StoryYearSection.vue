<!--
  components/blogs/StoryYearSection.vue
  =======================================
  This file implements one year bucket inside the timeline.
  It receives all stories that belong to a single calendar year, groups them
  further by month, and renders a StoryMonthGroup for each month found.

  Structure
  ---------
  1. Year heading  – a bold year label with an accent bar, a story-count badge
                     and a horizontal rule stretching to the right edge.
  2. Month groups  – one StoryMonthGroup per month present in the data, sorted
                     according to the active sortOrder prop.

  Grouping
  --------
  Stories are grouped into "YYYY-MM" keys client-side.  The keys are then
  sorted ascending (oldest) or descending (newest) before being passed down.

  i18n
  ----
  The story-count badge uses locale-aware singular / plural labels via the
  storySingular and storyPlural keys in the active locale file.

  Events
  ------
  @story-click(story)  Bubbled up from StoryMonthGroup → StoryListItem.
                        The parent (StoryTimeline / pages/stories/index.vue)
                        handles the actual navigation.
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryMonthGroup from "~/components/blogs/StoryMonthGroup.vue";

const props = defineProps<{
  year: string;
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t } = useI18n();

// ── Group stories by month ───────────────────────────────────────────────────
const byMonth = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const s of props.stories) {
    const d = new Date(s.created_at ?? 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  const keys = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((key) => ({ key, stories: map.get(key)! }));
});

/** Locale-aware singular/plural story count label, e.g. "3 stories". */
const storyCount = computed(() => {
  const n = props.stories.length;
  const word = n === 1 ? t("stories.storySingular") : t("stories.storyPlural");
  return `${n} ${word}`;
});
</script>

<template>
  <!--
    The section id is used by the IntersectionObserver in StoryTimeline to
    track which year is currently in view and highlight the correct sidebar dot.
  -->
  <section :id="`story-year-${year}`" class="blog-year-section">

    <!-- Year heading row -->
    <div class="blog-year-heading">
      <div class="blog-year-accent" aria-hidden="true" />
      <span class="blog-year-label font-brand">{{ year }}</span>
      <div class="blog-year-badge font-brand">{{ storyCount }}</div>
      <div class="blog-year-rule" />
    </div>

    <!-- Month groups stacked with generous spacing -->
    <div class="space-y-8">
      <StoryMonthGroup
        v-for="month in byMonth"
        :key="month.key"
        :month-key="month.key"
        :stories="month.stories"
        :sort-order="sortOrder"
        @story-click="emit('story-click', $event)"
      />
    </div>

  </section>
</template>
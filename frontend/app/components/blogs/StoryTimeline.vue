<!--
  components/blogs/StoryTimeline.vue
  ====================================
  This file implements the main timeline layout for the stories overview page.
  It groups the incoming blog posts first by year, then passes each year group
  to StoryYearSection which further splits them by month.

  Structure
  ---------
  1. StoryNav  – vertical year-dot sidebar, always visible on every screen
                 size (narrow on mobile, slightly wider on sm+).  Clicking a
                 dot smooth-scrolls to that year.
  2. StoryYearSection (one per year) – year heading + month groups + cards.

  There is no separate mobile pill strip; the sidebar handles all screen sizes.

  Active-year tracking
  --------------------
  An IntersectionObserver watches each year <section> element.  When a section
  enters the upper third of the viewport its year becomes "active" in StoryNav.
  The observer is re-attached whenever `allYears` changes (i.e. after a new
  page of stories is appended by the infinite-scroll loader in the parent).
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryNav from "~/components/blogs/StoryNav.vue";
import StoryYearSection from "~/components/blogs/StoryYearSection.vue";

const props = defineProps<{
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t } = useI18n();

// ── Group stories by year ────────────────────────────────────────────────────
const grouped = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const s of props.stories) {
    const year = new Date(s.created_at ?? 0).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(s);
  }
  // Sort years according to the current sort direction.
  const years = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest"
      ? parseInt(a) - parseInt(b)
      : parseInt(b) - parseInt(a),
  );
  return years.map((year) => ({ year, stories: map.get(year)! }));
});

const allYears = computed(() => grouped.value.map((g) => g.year));

// ── Active-year tracking via IntersectionObserver ───────────────────────────
const activeYear = ref<string>("");
let yearObserver: IntersectionObserver | null = null;

const attachObserver = () => {
  yearObserver?.disconnect();

  yearObserver = new IntersectionObserver(
    (entries) => {
      // Pick the topmost section that is currently intersecting the viewport.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const first = visible[0];
      if (first) {
        activeYear.value = first.target.id.replace("story-year-", "");
      }
    },
    // rootMargin keeps the active highlight stable: trigger when the section
    // is in the top ~30% of the viewport.
    { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
  );

  for (const year of allYears.value) {
    const el = document.getElementById(`story-year-${year}`);
    if (el) yearObserver.observe(el);
  }

  // Default to the first year until the observer fires.
  if (!activeYear.value && allYears.value[0]) {
    activeYear.value = allYears.value[0];
  }
};

// Re-attach whenever the year list grows (infinite-scroll appends).
watch(allYears, async () => {
  await nextTick();
  attachObserver();
}, { immediate: false });

onMounted(() => nextTick(attachObserver));
onUnmounted(() => yearObserver?.disconnect());

/** Smooth-scroll to a year section and immediately mark it active. */
const scrollToYear = (year: string) => {
  const el = document.getElementById(`story-year-${year}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  activeYear.value = year;
};
</script>

<template>
  <div>
    <!-- Sidebar + content in a flex row on all screen sizes -->
    <div class="flex gap-4 sm:gap-6">

      <!-- Year navigation sidebar — always visible -->
      <StoryNav
        :years="allYears"
        :active-year="activeYear"
        @scroll-to="scrollToYear"
      />

      <!-- Main content column -->
      <div class="flex-1 min-w-0">

        <!-- Empty state -->
        <div v-if="grouped.length === 0" class="py-24 text-center">
          <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2">
            {{ t("stories.noStories") }}
          </p>
          <p class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
            {{ t("stories.noStoriesDesc") }}
          </p>
        </div>

        <!-- One section per year -->
        <div v-else class="space-y-0">
          <StoryYearSection
            v-for="group in grouped"
            :key="group.year"
            :year="group.year"
            :stories="group.stories"
            :sort-order="sortOrder"
            @story-click="emit('story-click', $event)"
          />
        </div>

      </div>
    </div>
  </div>
</template>
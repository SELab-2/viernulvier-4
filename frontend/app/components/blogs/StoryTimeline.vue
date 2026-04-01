<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import StoryNav from "~/components/blogs/StoryNav.vue";
import StoryYearSection from "~/components/blogs/StoryYearSection.vue";

const props = defineProps<{
  stories: BlogView[];
  sortOrder: "newest" | "oldest";
  /** Full year range, discovered via two cheap API calls on the parent. */
  availableYears: string[];
  /** Currently filtered year, or null for "all years". */
  selectedYear: string | null;
}>();

const emit = defineEmits<{
  (e: "year-select", year: string): void;
}>();

const { t } = useI18n();

// Group by year — backend already returns stories in the correct order,
// so we just bucket them without re-sorting.
const grouped = computed(() => {
  const map = new Map<string, BlogView[]>();
  for (const s of props.stories) {
    const year = new Date(s.created_at ?? 0).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(s);
  }
  return [...map.keys()].map((year) => ({ year, stories: map.get(year)! }));
});

// Active year for the nav highlight — tracks scroll position when showing
// all years, or is pinned to selectedYear when a filter is active.
const activeYear = ref<string>("");
let yearObserver: IntersectionObserver | null = null;

const attachObserver = () => {
  yearObserver?.disconnect();

  // When filtering, the nav dot is always pinned to the selected year.
  if (props.selectedYear) {
    activeYear.value = props.selectedYear;
    return;
  }

  yearObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activeYear.value = visible[0].target.id.replace("story-year-", "");
    },
    { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
  );

  for (const { year } of grouped.value) {
    const el = document.getElementById(`story-year-${year}`);
    if (el) yearObserver.observe(el);
  }
  if (!activeYear.value && grouped.value[0]) {
    activeYear.value = grouped.value[0].year;
  }
};

watch(
  () => props.selectedYear,
  async (y) => {
    if (y) activeYear.value = y;
    await nextTick();
    attachObserver();
  },
  { immediate: true },
);

watch(grouped, async () => {
  await nextTick();
  attachObserver();
});

onMounted(() => nextTick(attachObserver));
onUnmounted(() => yearObserver?.disconnect());
</script>

<template>
  <div>
    <div class="flex items-stretch gap-4 sm:gap-6 pt-6">
      <StoryNav
        :years="availableYears"
        :active-year="activeYear"
        :selected-year="selectedYear"
        @year-click="emit('year-select', $event)"
      />

      <div class="flex-1 min-w-0">
        <div v-if="grouped.length === 0" class="py-24 text-center">
          <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2">
            {{ t("stories.noStories") }}
          </p>
          <p class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
            {{ t("stories.noStoriesDesc") }}
          </p>
        </div>

        <div v-else class="space-y-0">
          <StoryYearSection
            v-for="group in grouped"
            :key="group.year"
            :year="group.year"
            :stories="group.stories"
            :sort-order="sortOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>
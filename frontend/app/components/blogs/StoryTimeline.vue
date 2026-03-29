<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryNav from "~/components/blogs/StoryNav.vue";
import StoryYearSection from "~/components/blogs/StoryYearSection.vue";

const props = defineProps<{
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
  searchQuery?: string;
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t, locale } = useI18n();

// Filter
const filteredStories = computed(() => {
  const q = props.searchQuery?.trim().toLowerCase();
  if (!q) return props.stories;

  return props.stories.filter((s) => {
    const raw = s.titel;
    const title =
      typeof raw === "string"
        ? raw
        : (raw as any)?.[locale.value] ?? (raw as any)?.nl ?? (raw as any)?.en ?? "";

    const desc = (s as any).description;
    const descText =
      !desc
        ? ""
        : typeof desc === "string"
          ? desc
          : (desc as any)?.[locale.value] ?? (desc as any)?.nl ?? (desc as any)?.en ?? "";

    return (
      title.toLowerCase().includes(q) ||
      descText.toLowerCase().includes(q)
    );
  });
});

// Group stories by year
const grouped = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const s of filteredStories.value) {
    const year = new Date(s.created_at ?? 0).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(s);
  }
  const years = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest"
      ? parseInt(a) - parseInt(b)
      : parseInt(b) - parseInt(a),
  );
  return years.map((year) => ({ year, stories: map.get(year)! }));
});

const allYears = computed(() => grouped.value.map((g) => g.year));

// Active-year tracking via IntersectionObserver
const activeYear = ref<string>("");
let yearObserver: IntersectionObserver | null = null;

const attachObserver = () => {
  yearObserver?.disconnect();
  yearObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const first = visible[0];
      if (first) activeYear.value = first.target.id.replace("story-year-", "");
    },
    { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
  );
  for (const year of allYears.value) {
    const el = document.getElementById(`story-year-${year}`);
    if (el) yearObserver.observe(el);
  }
  if (!activeYear.value && allYears.value[0]) activeYear.value = allYears.value[0];
};

watch(allYears, async () => {
  await nextTick();
  attachObserver();
}, { immediate: false });

watch(allYears, (years) => {
  if (years.length && !years.includes(activeYear.value)) {
    activeYear.value = years[0] ?? "";
  }
});

onMounted(() => nextTick(attachObserver));
onUnmounted(() => yearObserver?.disconnect());

const scrollToYear = (year: string) => {
  const el = document.getElementById(`story-year-${year}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  activeYear.value = year;
};
</script>

<template>
  <div>
    <!--
      items-stretch: makes the nav column grow to the full height of the
      content column beside it, so the vertical timeline line runs all the
      way down the page.
    -->
    <div class="flex items-stretch gap-4 sm:gap-6 pt-6">
      <StoryNav
        :years="allYears"
        :active-year="activeYear"
        @scroll-to="scrollToYear"
      />

      <div class="flex-1 min-w-0">
        <div v-if="grouped.length === 0" class="py-24 text-center">
          <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2">
            {{ searchQuery?.trim() ? t("stories.noResults") : t("stories.noStories") }}
          </p>
          <p class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
            {{ searchQuery?.trim() ? t("stories.noResultsDesc") : t("stories.noStoriesDesc") }}
          </p>
        </div>

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
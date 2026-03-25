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

const grouped = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const s of props.stories) {
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
      if (first) {
        activeYear.value = first.target.id.replace("story-year-", "");
      }
    },
    { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
  );
  for (const year of allYears.value) {
    const el = document.getElementById(`story-year-${year}`);
    if (el) yearObserver.observe(el);
  }
  if (!activeYear.value && allYears.value[0]) {
    activeYear.value = allYears.value[0];
  }
};

watch(allYears, async () => {
  await nextTick();
  attachObserver();
}, { immediate: false });

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
    <!-- StoryNav handles mobile (pills) and desktop (sidebar) internally -->
    <!-- We only need the desktop sidebar in the flex row -->
    <div class="flex gap-6 lg:gap-10">

      <!-- Desktop year sidebar (StoryNav shows lg:block internally) -->
      <StoryNav
        :years="allYears"
        :active-year="activeYear"
        @scroll-to="scrollToYear"
      />

      <div class="flex-1 min-w-0">
        <!-- Mobile pills — shown here so they scroll with content, not in sidebar -->
        <nav class="lg:hidden blog-mobile-nav mb-6" aria-label="Jaar navigatie">
          <button
            v-for="year in allYears"
            :key="year"
            class="blog-mobile-pill font-brand"
            :class="{ 'blog-mobile-pill--active': activeYear === year }"
            @click="scrollToYear(year)"
          >
            {{ year }}
          </button>
        </nav>

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
            @story-click="emit('story-click', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
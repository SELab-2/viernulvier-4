<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "./StoryListItem.vue";

const props = defineProps<{
  stories: Array<Blog | BlogView>;
  initialVisiblePerYear?: number;
  sortOrder?: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t } = useI18n();

const sort = computed(() => props.sortOrder ?? "newest");
const PAGE_SIZE = props.initialVisiblePerYear ?? 5;

// ── Data ──────────────────────────────────────────────────────────────────────
const sortedStories = computed(() =>
  [...props.stories].sort((a, b) => {
    const da = new Date(a.created_at ?? 0).getTime();
    const db = new Date(b.created_at ?? 0).getTime();
    return sort.value === "oldest" ? da - db : db - da;
  }),
);

const postsByYear = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const s of sortedStories.value) {
    const y = new Date(s.created_at ?? 0).getFullYear().toString();
    const existing = map.get(y) ?? [];
    existing.push(s);
    map.set(y, existing);
  }
  return map;
});

const sortedYears = computed(() =>
  [...postsByYear.value.keys()].sort((a, b) =>
    sort.value === "oldest" ? parseInt(a) - parseInt(b) : parseInt(b) - parseInt(a),
  ),
);

// Using Map avoids the "Object is possibly undefined" TS error from Record<string, T>.
const postsForYear = (year: string): Array<Blog | BlogView> =>
  postsByYear.value.get(year) ?? [];

// ── Collapse / show-more ──────────────────────────────────────────────────────
const collapsedYears = ref(new Set<string>());
const visibleCountByYear = ref<Record<string, number>>({});

const isCollapsed = (year: string) => collapsedYears.value.has(year);

const toggleYear = (year: string) => {
  const s = new Set(collapsedYears.value);
  s.has(year) ? s.delete(year) : s.add(year);
  collapsedYears.value = s;
};

const visibleCount = (year: string) =>
  visibleCountByYear.value[year] ?? PAGE_SIZE;

const showMore = (year: string) => {
  const total = postsForYear(year).length;
  visibleCountByYear.value = {
    ...visibleCountByYear.value,
    [year]: Math.min((visibleCountByYear.value[year] ?? PAGE_SIZE) + PAGE_SIZE, total),
  };
};
</script>

<template>
  <div class="story-timeline space-y-12">

    <!-- Year groups -->
    <div v-for="year in sortedYears" :key="year">

      <!-- Year header -->
      <button
        class="w-full flex items-center gap-4 mb-5 group focus:outline-none cursor-pointer"
        :aria-expanded="!isCollapsed(year)"
        :aria-label="`${isCollapsed(year) ? t('stories.ariaShow') : t('stories.ariaHide')} ${year}`"
        @click="toggleYear(year)"
      >
        <span
          class="font-brand font-black text-3xl tracking-tighter leading-none select-none shrink-0 text-foreground transition-opacity duration-150"
          :class="isCollapsed(year) ? 'opacity-30' : 'opacity-100'"
        >
          {{ year }}
        </span>

        <span
          class="shrink-0 font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5"
        >
          {{ postsForYear(year).length }}
          {{ postsForYear(year).length === 1
            ? t("stories.storySingular")
            : t("stories.storyPlural") }}
        </span>

        <div
          class="flex-1 h-px bg-border transition-opacity"
          :class="isCollapsed(year) ? 'opacity-30' : 'opacity-100'"
        />

        <svg
          class="shrink-0 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200"
          :class="isCollapsed(year) ? 'rotate-0' : 'rotate-180'"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <!-- Stories list -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="!isCollapsed(year)">
          <div class="border border-border divide-y divide-border">
            <StoryListItem
              v-for="story in postsForYear(year).slice(0, visibleCount(year))"
              :key="story.id"
              :story="story"
              class="cursor-pointer"
              @click="emit('story-click', story)"
            />
          </div>

          <button
            v-if="visibleCount(year) < postsForYear(year).length"
            class="w-full py-3 border border-t-0 border-border font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            @click="showMore(year)"
          >
            {{ t("stories.loadMore") }}
            ({{ postsForYear(year).length - visibleCount(year) }}
            {{ t("stories.remaining") }})
          </button>
        </div>
      </Transition>
    </div>

    <!-- Empty state -->
    <div v-if="sortedYears.length === 0" class="py-32 text-center">
      <p
        class="font-brand font-black text-4xl uppercase italic tracking-tighter text-foreground opacity-20"
      >
        {{ t("stories.noStories") }}
      </p>
      <p
        class="mt-3 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        {{ t("stories.noStoriesDesc") }}
      </p>
    </div>

  </div>
</template>
<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "./StoryListItem.vue";

const props = defineProps<{
  stories: Array<Blog | BlogView>;
  sortOrder?: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t, locale } = useI18n();

const sort = computed(() => props.sortOrder ?? "newest");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns "YYYY" for a story. */
const yearOf = (s: Blog | BlogView) =>
  new Date(s.created_at ?? 0).getFullYear().toString();

/** Returns "YYYY-MM" for a story — used as the map key. */
const monthKeyOf = (s: Blog | BlogView) => {
  const d = new Date(s.created_at ?? 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Human-readable month label using the active locale. */
const monthLabel = (key: string): string => {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? new Date().getFullYear();
  const m = parts[1] ?? 1;
  return new Date(y, m - 1, 1).toLocaleDateString(
    locale.value === "nl" ? "nl-BE" : "en-GB",
    { month: "long", year: "numeric" },
  );
};

// ── Data ──────────────────────────────────────────────────────────────────────

const sorted = computed(() =>
  [...props.stories].sort((a, b) => {
    const da = new Date(a.created_at ?? 0).getTime();
    const db = new Date(b.created_at ?? 0).getTime();
    return sort.value === "oldest" ? da - db : db - da;
  }),
);

/**
 * Two-level structure:
 *   yearMap: Map<"YYYY", Map<"YYYY-MM", Array<Blog | BlogView>>>
 */
const yearMap = computed(() => {
  const map = new Map<string, Map<string, Array<Blog | BlogView>>>();
  for (const s of sorted.value) {
    const y = yearOf(s);
    const mk = monthKeyOf(s);
    if (!map.has(y)) map.set(y, new Map());
    const months = map.get(y)!;
    if (!months.has(mk)) months.set(mk, []);
    months.get(mk)!.push(s);
  }
  return map;
});

const sortedYears = computed(() =>
  [...yearMap.value.keys()].sort((a, b) =>
    sort.value === "oldest" ? parseInt(a) - parseInt(b) : parseInt(b) - parseInt(a),
  ),
);

const monthsForYear = (year: string) => {
  const months = yearMap.value.get(year);
  if (!months) return [];
  return [...months.keys()].sort((a, b) =>
    sort.value === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
};

const storiesForMonth = (year: string, mk: string): Array<Blog | BlogView> =>
  yearMap.value.get(year)?.get(mk) ?? [];

const totalForYear = (year: string) =>
  [...(yearMap.value.get(year)?.values() ?? [])].reduce(
    (acc, arr) => acc + arr.length,
    0,
  );

// ── Collapse per year ─────────────────────────────────────────────────────────
const collapsedYears = ref(new Set<string>());
const isCollapsed = (year: string) => collapsedYears.value.has(year);
const toggleYear = (year: string) => {
  const s = new Set(collapsedYears.value);
  s.has(year) ? s.delete(year) : s.add(year);
  collapsedYears.value = s;
};
</script>

<template>
  <div class="story-timeline space-y-12">

    <!-- Year groups -->
    <div
      v-for="year in sortedYears"
      :key="year"
      :id="`story-year-${year}`"
    >
      <!-- ── Year header ──────────────────────────────────────────────── -->
      <button
        class="w-full flex items-center gap-4 mb-6 group focus:outline-none cursor-pointer"
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
          {{ totalForYear(year) }}
          {{ totalForYear(year) === 1 ? t("stories.storySingular") : t("stories.storyPlural") }}
        </span>

        <div
          class="flex-1 h-px bg-border transition-opacity"
          :class="isCollapsed(year) ? 'opacity-30' : 'opacity-100'"
        />

        <svg
          class="shrink-0 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200"
          :class="isCollapsed(year) ? 'rotate-0' : 'rotate-180'"
          fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <!-- ── Month groups ─────────────────────────────────────────────── -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="!isCollapsed(year)" class="space-y-8">
          <div
            v-for="mk in monthsForYear(year)"
            :key="mk"
          >
            <!-- Month label -->
            <div class="flex items-center gap-3 mb-3">
              <span
                class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 capitalize"
              >
                {{ monthLabel(mk) }}
              </span>
              <div class="flex-1 h-px bg-border opacity-50" />
              <span
                class="font-brand font-black text-[8px] uppercase tracking-widest text-border shrink-0"
              >
                {{ storiesForMonth(year, mk).length }}
              </span>
            </div>

            <!-- Stories — all shown, no show-more button -->
            <div class="border border-border divide-y divide-border">
              <StoryListItem
                v-for="story in storiesForMonth(year, mk)"
                :key="story.id"
                :story="story"
                class="cursor-pointer"
                @click="emit('story-click', story)"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty state -->
    <div v-if="sortedYears.length === 0" class="py-32 text-center">
      <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-foreground opacity-20">
        {{ t("stories.noStories") }}
      </p>
      <p class="mt-3 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
        {{ t("stories.noStoriesDesc") }}
      </p>
    </div>

  </div>
</template>
<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "~/components/blogs/StoryListItem.vue";

const props = defineProps<{
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { t, locale } = useI18n();

const grouped = computed(() => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const story of props.stories) {
    const year = new Date(story.created_at ?? 0).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(story);
  }
  const sortedYears = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest"
      ? parseInt(a) - parseInt(b)
      : parseInt(b) - parseInt(a),
  );
  return sortedYears.map((year) => ({ year, stories: map.get(year)! }));
});

const groupByMonth = (stories: Array<Blog | BlogView>) => {
  const map = new Map<string, Array<Blog | BlogView>>();
  for (const story of stories) {
    const d = new Date(story.created_at ?? 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(story);
  }
  const keys = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((key) => ({ key, stories: map.get(key)! }));
};

const monthLabel = (key: string) => {
  const parts = key.split("-");
  const yearStr = parts[0] ?? "2000";
  const monthStr = parts[1] ?? "1";
  const loc =
    t("stories.locale") !== "stories.locale"
      ? t("stories.locale")
      : locale.value === "nl"
        ? "nl-BE"
        : "en-US";
  return new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1).toLocaleDateString(loc, { month: "long" });
};

const activeYear = ref<string>("");
let yearObserver: IntersectionObserver | null = null;
const allYears = computed(() => grouped.value.map((g) => g.year));

watch(
  allYears,
  async () => {
    await nextTick();
    yearObserver?.disconnect();
    yearObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeYear.value = entry.target.id.replace("timeline-year-", "");
            break;
          }
        }
      },
      { rootMargin: "-5% 0px -75% 0px" },
    );
    allYears.value.forEach((year) => {
      const el = document.getElementById(`timeline-year-${year}`);
      if (el) yearObserver?.observe(el);
    });
    if (!activeYear.value && allYears.value[0]) {
      activeYear.value = allYears.value[0];
    }
  },
  { immediate: true },
);

onUnmounted(() => yearObserver?.disconnect());

const scrollToYear = (year: string) => {
  const el = document.getElementById(`timeline-year-${year}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<template>
  <div class="timeline-root">

    <!-- ── Purple year navigator ──────────────────────────────────────── -->
    <nav
      v-if="allYears.length > 1"
      class="timeline-nav hidden lg:flex"
      aria-label="Jaar navigatie"
    >
      <div class="sticky top-24 flex flex-col items-center py-2 w-full">

        <!-- Rail -->
        <div class="nav-rail" aria-hidden="true" />

        <button
          v-for="year in allYears"
          :key="year"
          class="nav-year-btn group"
          :class="{ active: activeYear === year }"
          :aria-label="`Scroll naar ${year}`"
          :aria-current="activeYear === year ? 'true' : undefined"
          @click="scrollToYear(year)"
        >
          <div class="nav-dot" :class="{ 'nav-dot--active': activeYear === year }" />
          <span class="nav-label" :class="{ 'nav-label--active': activeYear === year }">
            {{ year }}
          </span>
          <div v-if="activeYear === year" class="nav-pill">
            {{ t("stories.now") }}
          </div>
        </button>

      </div>
    </nav>

    <!-- ── Timeline content ──────────────────────────────────────────── -->
    <div class="timeline-content">

      <!-- Empty state -->
      <div v-if="grouped.length === 0" class="py-24 text-center">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter mb-2 text-muted-foreground opacity-30">
          {{ t("stories.noStories") }}
        </p>
        <p class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
          {{ t("stories.noStoriesDesc") }}
        </p>
      </div>

      <!-- Year groups -->
      <section
        v-for="group in grouped"
        :id="`timeline-year-${group.year}`"
        :key="group.year"
        class="year-section"
      >
        <!-- Year heading -->
        <div class="year-heading">
          <div class="year-accent" aria-hidden="true" />
          <button
            class="year-label font-brand font-black uppercase italic tracking-tighter leading-none focus:outline-none"
            @click="scrollToYear(group.year)"
          >
            {{ group.year }}
          </button>
          <div class="year-badge">
            <span class="font-brand font-black text-[9px] uppercase tracking-widest">
              {{ group.stories.length }} {{ t("stories.storyPlural") }}
            </span>
          </div>
          <div class="year-rule" />
        </div>

        <!-- Month sub-groups -->
        <div class="space-y-8 pl-0">
          <div v-for="month in groupByMonth(group.stories)" :key="month.key">

            <!-- Month label -->
            <div class="month-heading">
              <div class="month-dot" />
              <span class="month-label font-brand font-black uppercase tracking-widest">
                {{ monthLabel(month.key) }}
              </span>
              <div class="month-rule" />
              <span class="month-count font-brand font-black">{{ month.stories.length }}</span>
            </div>

            <!-- Story cards -->
            <div class="story-group">
              <button
                v-for="story in month.stories"
                :key="story.id"
                class="story-btn"
                @click="emit('story-click', story)"
              >
                <StoryListItem :story="story" />
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────── */
.timeline-root {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 1024px) {
  .timeline-root {
    grid-template-columns: 5rem 1fr;
    gap: 1.5rem;
  }
}

.timeline-nav {
  flex-direction: column;
  align-items: center;
}

.timeline-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

/* ── Navigator ──────────────────────────────────────────────────── */
.nav-rail {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  border-radius: 9999px;
  background: color-mix(in srgb, #7F77DD 25%, transparent);
}

:root.dark .nav-rail {
  background: color-mix(in srgb, #534AB7 40%, transparent);
}

.nav-year-btn {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0;
  width: 100%;
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
}

.nav-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, #AFA9EC 60%, transparent);
  background: var(--color-background-primary);
  transition: all 0.25s;
}

.nav-year-btn:hover .nav-dot {
  border-color: #7F77DD;
  transform: scale(1.15);
}

.nav-dot--active {
  width: 0.875rem;
  height: 0.875rem;
  border-color: #534AB7 !important;
  background: #534AB7 !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, #534AB7 20%, transparent);
}

:root.dark .nav-dot--active {
  border-color: #7F77DD !important;
  background: #7F77DD !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, #7F77DD 25%, transparent);
}

.nav-label {
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, #AFA9EC 80%, transparent);
  transition: all 0.2s;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.nav-year-btn:hover .nav-label {
  color: #7F77DD;
}

.nav-label--active {
  font-size: 10px !important;
  color: #534AB7 !important;
}

:root.dark .nav-label--active {
  color: #AFA9EC !important;
}

.nav-pill {
  margin-top: 2px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: color-mix(in srgb, #534AB7 12%, transparent);
  color: #534AB7;
}

:root.dark .nav-pill {
  background: color-mix(in srgb, #7F77DD 20%, transparent);
  color: #AFA9EC;
}

/* ── Year section ───────────────────────────────────────────────── */
.year-section {
  scroll-margin-top: 6rem;
}

.year-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.year-accent {
  width: 4px;
  height: 2rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, #534AB7, color-mix(in srgb, #AFA9EC 60%, transparent));
}

:root.dark .year-accent {
  background: linear-gradient(to bottom, #7F77DD, color-mix(in srgb, #534AB7 40%, transparent));
}

.year-label {
  font-size: 2.25rem;
  flex-shrink: 0;
  color: #3C3489;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}

.year-label:hover {
  opacity: 0.65;
}

:root.dark .year-label {
  color: #AFA9EC;
}

.year-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: color-mix(in srgb, #534AB7 10%, transparent);
}

:root.dark .year-badge {
  background: color-mix(in srgb, #7F77DD 15%, transparent);
}

.year-badge span {
  color: #534AB7;
}

:root.dark .year-badge span {
  color: #AFA9EC;
}

.year-rule {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, #AFA9EC 30%, transparent);
}

:root.dark .year-rule {
  background: color-mix(in srgb, #534AB7 35%, transparent);
}

/* ── Month heading ──────────────────────────────────────────────── */
.month-heading {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.month-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  flex-shrink: 0;
  background: color-mix(in srgb, #AFA9EC 70%, transparent);
}

:root.dark .month-dot {
  background: color-mix(in srgb, #7F77DD 50%, transparent);
}

.month-label {
  font-size: 9px;
  flex-shrink: 0;
  color: #7F77DD;
}

:root.dark .month-label {
  color: color-mix(in srgb, #AFA9EC 70%, transparent);
}

.month-rule {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, #CECBF6 50%, transparent);
}

:root.dark .month-rule {
  background: color-mix(in srgb, #534AB7 30%, transparent);
}

.month-count {
  font-size: 8px;
  flex-shrink: 0;
  color: color-mix(in srgb, #AFA9EC 60%, transparent);
}

/* ── Story group ────────────────────────────────────────────────── */
.story-group {
  border: 1px solid color-mix(in srgb, #AFA9EC 25%, transparent);
  border-radius: 0.5rem;
  overflow: hidden;
  divide-color: color-mix(in srgb, #AFA9EC 15%, transparent);
}

:root.dark .story-group {
  border-color: color-mix(in srgb, #534AB7 30%, transparent);
}

.story-btn {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, #AFA9EC 15%, transparent);
  cursor: pointer;
  padding: 0;
  outline: none;
}

:root.dark .story-btn {
  border-bottom-color: color-mix(in srgb, #534AB7 25%, transparent);
}

.story-btn:last-child {
  border-bottom: none;
}

.story-btn:focus-visible {
  box-shadow: inset 0 0 0 2px #534AB7;
}

:root.dark .story-btn:focus-visible {
  box-shadow: inset 0 0 0 2px #7F77DD;
}
</style>
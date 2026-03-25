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

// i18n-aware plural
const storyCount = computed(() => {
  const n = props.stories.length;
  const word = n === 1 ? t("stories.storySingular") : t("stories.storyPlural");
  return `${n} ${word}`;
});
</script>

<template>
  <section :id="`story-year-${year}`" class="blog-year-section">

    <div class="blog-year-heading">
      <div class="blog-year-accent" aria-hidden="true" />
      <span class="blog-year-label font-brand">{{ year }}</span>
      <div class="blog-year-badge font-brand">{{ storyCount }}</div>
      <div class="blog-year-rule" />
    </div>

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
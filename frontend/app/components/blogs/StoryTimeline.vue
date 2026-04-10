<!--
  components/blogs/StoryTimeline.vue
  ====================================
  Groups stories per year and month
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import StoryYearSection from "~/components/blogs/StoryYearSection.vue";

const props = defineProps<{
  stories: BlogView[];
  sortOrder: "newest" | "oldest";
}>();

const { t } = useI18n();

const byYear = computed(() => {
  const map = new Map<string, BlogView[]>();
  for (const s of props.stories) {
    const year = String(new Date(s.created_at ?? 0).getFullYear());
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(s);
  }
  const keys = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((year) => ({ year, stories: map.get(year)! }));
});
</script>

<template>
  <div>
    <div v-if="stories.length === 0" class="py-24 text-center">
      <p
        class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
      >
        {{ t("stories.noStories") }}
      </p>
      <p
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        {{ t("stories.noStoriesDesc") }}
      </p>
    </div>

    <div v-else class="space-y-12">
      <StoryYearSection
        v-for="group in byYear"
        :key="group.year"
        :year="group.year"
        :stories="group.stories"
        :sort-order="sortOrder"
      />
    </div>
  </div>
</template>

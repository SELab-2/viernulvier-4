<!--
  components/blogs/StoryYearSection.vue
  =======================================
  One year bucket. Click heading to collapse/expand.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import StoryMonthGroup from "~/components/blogs/StoryMonthGroup.vue";

const props = defineProps<{
  year: string;
  stories: BlogView[];
  sortOrder: "newest" | "oldest";
}>();

const { t } = useI18n();

const isOpen = ref(true);
const toggle = () => { isOpen.value = !isOpen.value; };

const byMonth = computed(() => {
  const map = new Map<string, BlogView[]>();
  for (const s of props.stories) {
    const d = new Date(s.created_at ?? 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  // Backend already sorted stories; preserve that order inside each month bucket.
  const keys = [...map.keys()].sort((a, b) =>
    props.sortOrder === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((key) => ({ key, stories: map.get(key)! }));
});

</script>

<template>
  <section :id="`story-year-${year}`" class="blog-year-section">

    <button
      type="button"
      class="blog-year-heading w-full text-left cursor-pointer"
      :aria-expanded="isOpen"
      :aria-controls="`year-body-${year}`"
      @click="toggle"
    >
      <div class="blog-year-accent" aria-hidden="true" />
      <span class="blog-year-label font-brand select-none">{{ year }}</span>

      <div class="flex-1 h-px bg-foreground/15 mx-3" />

      <svg
        class="w-3.5 h-3.5 shrink-0 text-foreground/40 transition-transform duration-200"
        :class="isOpen ? 'rotate-0' : '-rotate-90'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-show="isOpen" :id="`year-body-${year}`">
        <div class="space-y-8 pb-10">
          <StoryMonthGroup
            v-for="month in byMonth"
            :key="month.key"
            :month-key="month.key"
            :stories="month.stories"
            :sort-order="sortOrder"
          />
        </div>
      </div>
    </Transition>

  </section>
</template>
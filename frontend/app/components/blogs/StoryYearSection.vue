<!--
  components/blogs/StoryYearSection.vue
  =======================================
  One year bucket. Click heading to collapse/expand.
  All decorative lines and counts use foreground (black in light mode).
-->
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

const isOpen = ref(true);
const toggle = () => { isOpen.value = !isOpen.value; };

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

const storyCount = computed(() => {
  const n = props.stories.length;
  const word = n === 1 ? t("stories.storySingular") : t("stories.storyPlural");
  return `${n} ${word}`;
});
</script>

<template>
  <section :id="`story-year-${year}`" class="blog-year-section">

    <!-- Year heading — full row is clickable, shows pointer cursor -->
    <button
      type="button"
      class="blog-year-heading w-full text-left cursor-pointer"
      :aria-expanded="isOpen"
      :aria-controls="`year-body-${year}`"
      @click="toggle"
    >
      <div class="blog-year-accent" aria-hidden="true" />
      <span class="blog-year-label font-brand select-none">{{ year }}</span>

      <!-- Count — black -->
      <div class="font-brand font-black text-[9px] uppercase tracking-widest text-foreground/50 shrink-0">
        {{ storyCount }}
      </div>

      <!-- Rule — black -->
      <div class="flex-1 h-px bg-foreground/15 mx-3" />

      <!-- Chevron -->
      <svg
        class="w-3.5 h-3.5 shrink-0 text-foreground/40 transition-transform duration-200"
        :class="isOpen ? 'rotate-0' : '-rotate-90'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Collapsible content -->
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
            @story-click="emit('story-click', $event)"
          />
        </div>
      </div>
    </Transition>

  </section>
</template>
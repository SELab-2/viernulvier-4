<!--
  components/blogs/StoryMonthGroup.vue
  ======================================
  One month bucket. Click heading to collapse/expand.
  All lines and labels use foreground (black in light mode).
  Pointer cursor is explicit so users know the row is clickable.
-->
<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "~/components/blogs/StoryListItem.vue";

const props = defineProps<{
  monthKey: string;
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const { locale } = useI18n();

const isOpen = ref(true);
const toggle = () => { isOpen.value = !isOpen.value; };

const label = computed(() => {
  const [y, m] = props.monthKey.split("-");
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(parseInt(y ?? "2000"), parseInt(m ?? "1") - 1, 1)
    .toLocaleDateString(loc, { month: "long" });
});
</script>

<template>
  <div>
    <!-- Month heading — full row clickable, explicit pointer cursor -->
    <button
      type="button"
      class="flex items-center gap-3 mb-3 w-full text-left cursor-pointer group/month"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <!-- Dot — black -->
      <div class="w-2 h-2 rounded-full bg-foreground/40 shrink-0 transition-colors group-hover/month:bg-purple-400" aria-hidden="true" />

      <!-- Month label — black -->
      <span class="font-brand font-black text-[10px] uppercase tracking-widest text-foreground/60 group-hover/month:text-foreground transition-colors">
        {{ label }}
      </span>

      <!-- Rule — black -->
      <div class="flex-1 h-px bg-foreground/15" />

      <!-- Count — black -->
      <span class="font-brand font-black text-[9px] uppercase tracking-widest text-foreground/40">
        {{ stories.length }}
      </span>

      <!-- Chevron -->
      <svg
        class="w-3 h-3 shrink-0 text-foreground/30 transition-transform duration-200 ml-1"
        :class="isOpen ? 'rotate-0' : '-rotate-90'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Collapsible story cards -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-show="isOpen" class="space-y-2">
        <NuxtLink
          v-for="story in stories"
          :key="story.id"
          :to="`/stories/${story.id}`"
          class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
        >
          <StoryListItem :story="story" />
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>
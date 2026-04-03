<!--
  components/blogs/StoryMonthGroup.vue
  ======================================
  One month bucket. Click heading to collapse/expand.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import StoryListItem from "~/components/blogs/StoryListItem.vue";
import { formatMonthLabel } from "~/utils/formatters";

const props = defineProps<{
  monthKey: string;
  stories: BlogView[];
  sortOrder: "newest" | "oldest";
}>();

const { locale } = useI18n();

const isOpen = ref(true);
const toggle = () => { isOpen.value = !isOpen.value; };

const label = computed(() => formatMonthLabel(props.monthKey, locale.value));
</script>

<template>
  <div>
    <button
      type="button"
      class="flex items-center gap-3 mb-3 w-full text-left cursor-pointer group/month"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <div class="w-2 h-2 rounded-full bg-foreground/40 shrink-0 transition-colors group-hover/month:bg-purple-400" aria-hidden="true" />

      <span class="font-brand font-black text-[10px] uppercase tracking-widest text-foreground/60 group-hover/month:text-foreground transition-colors">
        {{ label }}
      </span>

      <div class="flex-1 h-px bg-foreground/15" />

      <svg
        class="w-3 h-3 shrink-0 text-foreground/30 transition-transform duration-200 ml-1"
        :class="isOpen ? 'rotate-0' : '-rotate-90'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

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
          :key="(story as any).id"
          :to="ROUTES.stories.byId((story as any).id)"
          class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
        >
          <StoryListItem :story="story" />
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>
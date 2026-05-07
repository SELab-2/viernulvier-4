<!-- components/home/HomeRandomTags.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Tag } from "lucide-vue-next";

const router = useRouter();

// TODO: Replace with your actual API fetch composable (e.g., useFetch('/api/tags'))
const allTags = [
  "Theater",
  "Dans",
  "Muziek",
  "Performance",
  "Festival",
  "Archief",
  "Expo",
  "Debat",
  "Residentie",
];

// Grab 5 random tags on component setup
const randomTags = computed(() => {
  const shuffled = [...allTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
});

function goToTag(tag: string) {
  router.push({ path: "/productions", query: { tag } });
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2 text-muted-foreground">
      <Tag :size="14" stroke-width="3" />
      <span class="font-brand text-[10px] font-black uppercase tracking-widest">
        Ontdek Thema's
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tag in randomTags"
        :key="tag"
        @click="goToTag(tag)"
        class="inline-flex h-8 items-center rounded-full border border-border bg-card px-4 font-brand text-[10px] font-black uppercase tracking-wider text-foreground transition-all hover:border-accent hover:bg-accent hover:text-white"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

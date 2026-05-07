<!-- components/home/HomeRandomYears.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Calendar } from "lucide-vue-next";

const router = useRouter();

// Generate a pool of years (e.g., from 1982 to current year)
const currentYear = new Date().getFullYear();
const yearPool = Array.from(
  { length: currentYear - 1982 + 1 },
  (_, i) => 1982 + i,
);

// Grab 6 random years
const randomYears = computed(() => {
  const shuffled = [...yearPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6).sort((a, b) => b - a); // Sort desc for neatness
});

function goToYear(year: number) {
  router.push({ path: "/productions", query: { year: year.toString() } });
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex items-center gap-2 text-muted-foreground border-b border-border/30 pb-2"
    >
      <Calendar :size="14" stroke-width="3" class="text-accent" />
      <span class="font-brand text-[10px] font-black uppercase tracking-widest">
        Duik in de tijd
      </span>
    </div>

    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="year in randomYears"
        :key="year"
        @click="goToYear(year)"
        class="inline-flex h-8 items-center rounded border border-border/50 bg-transparent px-4 font-brand text-[12px] font-black italic tracking-widest text-foreground transition-all hover:scale-105 hover:border-foreground hover:bg-foreground hover:text-background focus:ring-2 focus:ring-foreground/50 outline-none"
      >
        {{ year }}
      </button>
    </div>
  </div>
</template>

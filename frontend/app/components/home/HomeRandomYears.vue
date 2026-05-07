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
  <div class="space-y-3">
    <div class="flex items-center gap-2 text-muted-foreground">
      <Calendar :size="14" stroke-width="3" />
      <span class="font-brand text-[10px] font-black uppercase tracking-widest">
        Duik in de tijd
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="year in randomYears"
        :key="year"
        @click="goToYear(year)"
        class="inline-flex h-8 items-center rounded border border-border bg-transparent px-3 font-brand text-[12px] font-black italic tracking-widest text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
      >
        {{ year }}
      </button>
    </div>
  </div>
</template>

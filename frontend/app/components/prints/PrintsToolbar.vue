<script setup lang="ts">
const PRINT_TYPES = ["AFFICHE", "BROCHURE", "DRUKWERK", "PROGRAMMA"] as const;
type PrintType = (typeof PRINT_TYPES)[number];

// ---------------------------------------- // TODO: all of the above needs to be deleted/replaced
import { ChevronDown, ChevronUp } from "lucide-vue-next";
defineProps<{
  titles?: string[];
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:types", value: PrintType): void;
}>();

const searchQuery = ref("");
const filterOpen = ref(false);
const activeType = ref<PrintType>(PRINT_TYPES[0]);

watch(searchQuery, (v) => {
  emit("update:search", v);
});

function selectType(type: PrintType) {
  activeType.value = type;
  emit("update:types", type);
}
</script>

<template>
  <div class="border-b border-border bg-background">
    <!-- Toolbar -->
    <div class="container mx-auto px-4 max-w-5xl py-5 flex gap-3">
      <!-- Search -->
      <div class="flex-1 min-w-0 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="titles || []"
          :limit="6"
          :scroll-limit="4"
          placeholder="Search prints..."
        />
      </div>

      <!-- Filter button -->
      <button
        :class="[
          'btn-outline h-10 gap-2 shrink-0',
          filterOpen &&
            '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
        ]"
        @click="filterOpen = !filterOpen"
      >
        <span>Filters</span>
        <ChevronUp v-if="filterOpen" class="w-4 h-4" />
        <ChevronDown v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Filter panel -->
    <Transition name="filter-slide">
      <div v-if="filterOpen" class="border-t border-border">
        <div class="container mx-auto px-4 max-w-5xl py-4 flex flex-wrap gap-2">
          <button
            v-for="type in PRINT_TYPES"
            :key="type"
            @click="selectType(type)"
            :class="[
              'px-3 py-2 rounded border text-xs uppercase tracking-wider font-bold transition',
              activeType === type
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40',
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped></style>

<!--
  components/prints/PrintsToolbar.vue
  ===================================
  Sticky toolbar rendered above the prints grid. Provides:

  - Full-text search (delegates to SearchBar, emits `update:search`).
  - A collapsible filter panel containing a toggle group of multiple print-types/categories.
    Shows only clicked category when clicked, default on first category.
-->
<script setup lang="ts">
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { PrintTypeValues, type PrintType } from "@repo/common";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineProps<{
  titles?: string[];
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:types", value: PrintType | null): void;
}>();

const searchQuery = ref("");
const filterOpen = ref(false); // Checks if filter panel is open or not.
const activeType = ref<PrintType | null>(null); // Current selected print-type.

watch(searchQuery, (v) => {
  emit("update:search", v);
});

function selectType(type: PrintType | null) {
  activeType.value = type;
  emit("update:types", type);
}
</script>

<template>
  <div class="border-b border-border bg-background">
    <!-- Toolbar -->
    <div class="page-container py-5 flex gap-3">
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
          <!-- All -->
          <button
            @click="selectType(null)"
            :class="[
              'px-3 py-2 rounded border text-xs uppercase tracking-wider font-bold transition',
              activeType === null
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40',
            ]"
          >
            {{ t("prints.types.all") }}
          </button>
          <button
            v-for="type in PrintTypeValues"
            :key="type"
            @click="selectType(type)"
            :class="[
              'px-3 py-2 rounded border text-xs uppercase tracking-wider font-bold transition',
              activeType === type
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40',
            ]"
          >
            {{ t(`prints.types.${type}`) }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped></style>

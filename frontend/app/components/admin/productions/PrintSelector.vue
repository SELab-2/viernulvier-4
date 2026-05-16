<!--
  components/admin/productions/PrintSelector.vue

  UI for searching and selecting Print Items to link to a production.
  Uses a search bar with visual suggestions and displays selected prints as a grid.
-->
<script setup lang="ts">
import { Search, Plus, Trash2 } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common";
import { usePrintApi } from "~/composables/media/usePrintApi";

const props = defineProps<{
  modelValue: PrintItemView[];
}>();

const emit = defineEmits<{
  "update:modelValue": [PrintItemView[]];
}>();

const { t, locale } = useI18n();
const printApi = usePrintApi();

const searchQuery = ref("");
const searchResults = ref<PrintItemView[]>([]);
const isSearching = ref(false);
const showDropdown = ref(false);

const inputWrapper = ref<HTMLElement | null>(null);
const dropdownEl = ref<HTMLElement | null>(null);
const dropdownStyles = ref<Record<string, string>>({});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (val.trim().length === 0) {
    searchResults.value = [];
    showDropdown.value = false;
    return;
  }
  searchTimeout = setTimeout(() => fetchPrints(val.trim()), 300);
});

async function fetchPrints(query: string) {
  isSearching.value = true;
  try {
    const res = await printApi.getAll({
      printItemFilters: { title: query, is_suggestion: true },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    if (res.data) {
      // Filter out already selected prints
      const selectedIds = new Set(props.modelValue.map((p) => p.id));
      searchResults.value = res.data.objects.filter(
        (p) => !selectedIds.has(p.id),
      );
      showDropdown.value = true;
      updateDropdownPosition();
    }
  } catch (err) {
    console.error("Failed to fetch prints", err);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

function selectPrint(print: PrintItemView) {
  emit("update:modelValue", [...props.modelValue, print]);
  searchQuery.value = "";
  showDropdown.value = false;
}

function removePrint(id: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((p) => p.id !== id),
  );
}

// ─── Dropdown positioning logic ──────────────────────────────────────────────

function updateDropdownPosition() {
  if (!inputWrapper.value || !showDropdown.value) {
    dropdownStyles.value = {};
    return;
  }
  const rect = inputWrapper.value.getBoundingClientRect();
  dropdownStyles.value = {
    position: "fixed",
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: "9999",
  };
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (
    (inputWrapper.value && inputWrapper.value.contains(target)) ||
    (dropdownEl.value && dropdownEl.value.contains(target))
  ) {
    return;
  }
  showDropdown.value = false;
}

watch([showDropdown, searchResults, isSearching, searchQuery], () =>
  updateDropdownPosition(),
);
</script>

<template>
  <div class="space-y-6">
    <!-- Search Bar -->
    <div class="relative" ref="inputWrapper">
      <Search
        :size="14"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        v-model="searchQuery"
        type="text"
        class="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none placeholder:text-muted-foreground/50"
        :placeholder="t('admin-productions.media.searchPrints')"
        @focus="searchQuery.length > 0 ? (showDropdown = true) : undefined"
      />

      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-100"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-75"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="showDropdown || isSearching"
            ref="dropdownEl"
            :style="dropdownStyles"
            class="overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <div
              v-if="isSearching"
              class="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin-productions.media.searching") }}
            </div>

            <template v-else>
              <div
                v-if="searchResults.length > 0"
                class="max-h-80 overflow-y-auto"
              >
                <button
                  v-for="print in searchResults"
                  :key="print.id"
                  class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
                  @mousedown.prevent="selectPrint(print)"
                >
                  <div
                    class="h-12 w-9 shrink-0 overflow-hidden rounded border border-border"
                  >
                    <MediaDisplay :src="print" size="fill" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate text-[11px] font-black uppercase tracking-widest text-foreground"
                    >
                      {{ print.titel }}
                    </p>
                    <p
                      class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
                    >
                      {{ t(`prints.types.${print.print_type}`) }}
                    </p>
                  </div>
                  <Plus
                    :size="12"
                    class="text-muted-foreground"
                    stroke-width="3"
                  />
                </button>
              </div>

              <div
                v-else-if="searchQuery.trim().length > 0"
                class="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                {{ t("admin-productions.media.noPrintsFound") }}
              </div>
            </template>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Selected Prints Grid -->
    <div
      v-if="modelValue.length > 0"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <div
        v-for="print in modelValue"
        :key="print.id"
        class="group relative flex flex-col"
      >
        <div
          class="relative aspect-[3/4] overflow-hidden rounded-lg border border-border transition-colors group-hover:border-accent/40"
        >
          <MediaDisplay :src="print" size="fill" />

          <!-- Remove overlay -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-action-red-icon text-white transition-transform hover:scale-110"
              @click="removePrint(print.id)"
            >
              <Trash2 :size="14" stroke-width="2.5" />
            </button>
          </div>
        </div>
        <div class="mt-2">
          <p
            class="truncate text-[10px] font-black uppercase tracking-widest text-foreground"
          >
            {{ print.titel }}
          </p>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ t(`prints.types.${print.print_type}`) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

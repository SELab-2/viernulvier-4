<!--
  components/admin/blogs/link/SearchDropdown.vue
  ================================================
  Search input with an autocomplete dropdown for finding productions to link.

  The dropdown is rendered via <Teleport to="body"> so it escapes any
  overflow:hidden or overflow:auto ancestor (e.g. the SectionCard wrapper or a
  scrolling page container). Its position is calculated in JavaScript each time
  it opens and whenever the window is scrolled or resized.

  Props:
  - search         current search string (v-model via update:search)
  - searchResults  array of ProductionView items from the API
  - linkedIds      Set of production IDs already linked this session
  - searching      true while the API call is in flight
  - hasMore        true when more pages are available for infinite scroll
  - linkingId      ID of the production currently being linked (shows spinner)

  Emits:
  - update:search        the input value changed
  - link(production)     user clicked Link on a result row
  - load-more            user scrolled near the bottom of the dropdown list
-->

<script setup lang="ts">
import type { ProductionView } from "@repo/common";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  search: string;
  searchResults: ProductionView[];
  linkedIds: Set<number>;
  searching: boolean;
  hasMore: boolean;
  linkingId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:search", val: string): void;
  (e: "link", production: ProductionView): void;
  (e: "load-more"): void;
}>();

// Whether the dropdown is currently visible.
const open = ref(false);

// Ref to the input wrapper so we can measure its position.
const inputWrapperRef = ref<HTMLElement | null>(null);

// The calculated pixel position for the teleported dropdown.
const dropdownStyle = ref({
  top: "0px",
  left: "0px",
  width: "0px",
});

// Sync search string with parent via v-model pattern.
const internalSearch = computed({
  get: () => props.search,
  set: (val) => emit("update:search", val),
});

// Only show the dropdown when the input is focused and a query exists.
const showDropdown = computed(
  () => open.value && props.search.trim().length > 0,
);

// Calculate the dropdown position relative to the viewport so the Teleport
// renders directly below the input regardless of scroll offset.
function recalcPosition() {
  if (!inputWrapperRef.value) return;
  const rect = inputWrapperRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
}

// Recalculate on scroll and resize so the dropdown tracks the input.
function handleScrollOrResize() {
  if (showDropdown.value) recalcPosition();
}

// Close the dropdown when a click occurs outside the input wrapper.
// We use the document mousedown event because the teleported dropdown is
// not a child of the input wrapper in the DOM.
function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  const wrapper = inputWrapperRef.value;
  // The teleported dropdown elements have a fixed data attribute so we can
  // detect clicks inside them even though they are outside the wrapper DOM.
  const clickedInsideDropdown = (target as HTMLElement).closest(
    "[data-link-dropdown]",
  );
  if (!wrapper?.contains(target) && !clickedInsideDropdown) {
    open.value = false;
  }
}

// Infinite scroll: fire load-more when the user scrolls near the bottom.
function handleResultsScroll(e: Event) {
  const el = e.target as HTMLElement;
  const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
  if (nearBottom && props.hasMore && !props.searching) {
    emit("load-more");
  }
}

function onFocus() {
  open.value = true;
  recalcPosition();
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScrollOrResize, { passive: true });
  window.addEventListener("resize", handleScrollOrResize, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("scroll", handleScrollOrResize);
  window.removeEventListener("resize", handleScrollOrResize);
});
</script>

<template>
  <!-- Input wrapper — used as the position anchor for the teleported dropdown -->
  <div ref="inputWrapperRef" class="relative">
    <!-- Search icon -->
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" stroke-linecap="round" />
    </svg>

    <input
      v-model="internalSearch"
      type="text"
      :placeholder="t('admin.blogs.linkToProductionSearch')"
      class="w-full h-10 pl-9 pr-9 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
      @focus="onFocus"
    />

    <!-- Clear button — only shown when there is a query -->
    <button
      v-if="search"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      @mousedown.prevent="emit('update:search', '')"
    >
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
      >
        <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <!--
    Teleport renders the dropdown at the <body> level so it is never clipped
    by overflow:hidden on a card, modal, or scroll container.
    The position is set via inline styles calculated in recalcPosition().
  -->
  <Teleport to="body">
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        data-link-dropdown
        class="fixed z-[200] rounded-xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden"
        :style="dropdownStyle"
      >
        <!-- Initial loading spinner — before any results arrive -->
        <div
          v-if="searching && !searchResults.length"
          class="flex items-center justify-center gap-2 py-5 text-muted-foreground"
        >
          <svg
            class="w-3.5 h-3.5 animate-spin"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span
            class="text-[10px] font-brand font-black uppercase tracking-widest"
          >
            {{ t("stories.loading") }}
          </span>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!searching && !searchResults.length"
          class="py-5 text-center text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.blogs.linkToProductionNoResults") }}
        </div>

        <!-- Results list with infinite scroll -->
        <div
          v-else
          class="max-h-64 overflow-y-auto overscroll-contain divide-y divide-border/50"
          @scroll="handleResultsScroll"
        >
          <div
            v-for="prod in searchResults"
            :key="prod.id"
            class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60 cursor-default"
            :class="linkedIds.has(prod.id) ? 'bg-feedback-success-bg/40' : ''"
          >
            <!-- Title and ID -->
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-semibold text-foreground leading-tight"
              >
                {{ prod.titel }}
              </p>
              <p
                class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
              >
                ID {{ prod.id }}
              </p>
            </div>

            <!-- Already-linked badge -->
            <span
              v-if="linkedIds.has(prod.id)"
              class="inline-flex items-center gap-1 text-[9px] font-brand font-black uppercase tracking-widest text-feedback-success-text shrink-0"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ t("admin.blogs.linked") }}
            </span>

            <!-- Link button -->
            <button
              v-else
              type="button"
              :disabled="linkingId === prod.id"
              class="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-accent text-white font-brand font-black text-[9px] uppercase tracking-widest hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              @mousedown.prevent="emit('link', prod)"
            >
              <svg
                v-if="linkingId === prod.id"
                class="w-3 h-3 animate-spin"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <svg
                v-else
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 5v14m-7-7h14"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ linkingId === prod.id ? "…" : t("admin.blogs.linkBtn") }}
            </button>
          </div>

          <!-- Infinite-scroll loading indicator at the bottom of the list -->
          <div
            v-if="hasMore"
            class="flex items-center justify-center gap-2 py-3"
          >
            <svg
              class="w-3 h-3 animate-spin text-muted-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

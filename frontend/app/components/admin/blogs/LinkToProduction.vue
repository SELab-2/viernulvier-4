<!--
  components/admin/blogs/LinkToProduction.vue
-->
<script setup lang="ts">
import type { PaginatedResponse, ProductionView } from "@repo/common";

const props = defineProps<{
  blogId?: number | null;
  galleryId?: number | null;
}>();

const { t, locale } = useI18n();
const { getAll, linkBlog, unlinkBlog } = useProductionApi();

const hasBlogId = computed(() => typeof props.blogId === "number");

const search = ref("");
const searchResults = ref<ProductionView[]>([]);
const linkedProductions = ref<ProductionView[]>([]);
const hasMore = ref(false);
const currentPage = ref(0);
const searching = ref(false);
const linking = ref<number | null>(null);
const unlinking = ref<number | null>(null);
const searchFocused = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const linkedProductionIds = computed(
  () => new Set(linkedProductions.value.map((p) => p.id)),
);

// Persistence
const storageKey = computed(() =>
  hasBlogId.value ? `vnv-blog-linked-prods-${props.blogId}` : null,
);

function persist() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify(linkedProductions.value),
    );
  } catch {
    /* ignore */
  }
}

async function restoreFromStorage() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    const raw = localStorage.getItem(storageKey.value);
    if (raw) linkedProductions.value = JSON.parse(raw) as ProductionView[];
  } catch {
    /* ignore */
  }
}

// Search
let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function runSearch(reset = true) {
  if (!hasBlogId.value || !search.value.trim()) {
    searchResults.value = [];
    hasMore.value = false;
    return;
  }
  if (reset) {
    currentPage.value = 0;
    searchResults.value = [];
    hasMore.value = false;
  }
  searching.value = true;
  try {
    const resp = await getAll({
      productionFilters: { titelOrArtist: search.value.trim() },
      paginationFilters: {
        page: currentPage.value,
        limit: 8,
        descending: true,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });
    const data = resp.data as PaginatedResponse<ProductionView> | null;
    const items = data?.objects ?? [];
    if (reset) searchResults.value = items;
    else searchResults.value.push(...items);
    hasMore.value = items.length >= 8;
    if (items.length) currentPage.value += 1;
  } catch {
    hasMore.value = false;
  } finally {
    searching.value = false;
  }
}

watch(search, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val.trim()) {
    searchResults.value = [];
    hasMore.value = false;
    return;
  }
  searchTimer = setTimeout(() => runSearch(true), 250);
});

function handleResultsScroll(e: Event) {
  const el = e.target as HTMLElement;
  if (
    el.scrollHeight - el.scrollTop <= el.clientHeight + 40 &&
    hasMore.value &&
    !searching.value
  )
    runSearch(false);
}

// Link / unlink
async function handleLink(production: ProductionView) {
  if (!hasBlogId.value || linkedProductionIds.value.has(production.id)) return;
  linking.value = production.id;
  try {
    await linkBlog(production.id, props.blogId);
    linkedProductions.value = [production, ...linkedProductions.value];
    persist();
  } catch (err) {
    console.error("Failed to link production:", err);
  } finally {
    linking.value = null;
  }
}

async function handleUnlink(productionId: number) {
  if (!hasBlogId.value) return;
  unlinking.value = productionId;
  try {
    await unlinkBlog(productionId, props.blogId);
    linkedProductions.value = linkedProductions.value.filter(
      (p) => p.id !== productionId,
    );
    persist();
  } catch (err) {
    console.error("Failed to unlink production:", err);
  } finally {
    unlinking.value = null;
  }
}

// Click outside
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node))
    searchFocused.value = false;
}

onMounted(async () => {
  await restoreFromStorage();
  document.addEventListener("mousedown", handleClickOutside);
});
onUnmounted(() =>
  document.removeEventListener("mousedown", handleClickOutside),
);

const showDropdown = computed(
  () => searchFocused.value && search.value.trim().length > 0,
);
</script>

<template>
  <AdminBlogsSectionCard
    :title="t('admin.blogs.linkedProductions')"
    :subtitle="t('admin.blogs.linkedProductionsHint')"
  >
    <!-- Locked state -->
    <div
      v-if="!hasBlogId"
      class="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4"
    >
      <svg
        class="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" />
      </svg>
      <p class="text-sm text-muted-foreground leading-relaxed">
        {{ t("admin.blogs.linkToProductionCreateHint") }}
      </p>
    </div>

    <template v-else>
      <div class="space-y-4">
        <!-- Linked productions -->
        <div v-if="linkedProductions.length" class="space-y-2">
          <p
            class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ t("admin.blogs.linkedThisSession") }}
          </p>

          <div
            class="max-h-60 overflow-y-auto space-y-1.5 pr-0.5 overscroll-contain"
          >
            <div
              v-for="prod in linkedProductions"
              :key="prod.id"
              class="flex items-center gap-3 rounded-lg border border-feedback-success-border bg-feedback-success-bg px-3 py-2.5"
            >
              <!-- Check icon -->
              <div
                class="w-6 h-6 rounded-md bg-feedback-success-text/10 flex items-center justify-center shrink-0"
              >
                <svg
                  class="w-3 h-3 text-feedback-success-text"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <!-- Name + ID -->
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

              <!-- Actions — always visible -->
              <div class="flex items-center gap-3 shrink-0">
                <NuxtLink
                  :to="ROUTES.productions.byId(prod.id)"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    class="w-3 h-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="15 3 21 3 21 9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="10"
                      y1="14"
                      x2="21"
                      y2="3"
                      stroke-linecap="round"
                    />
                  </svg>
                  {{ t("admin.blogs.viewProduction") }}
                </NuxtLink>

                <button
                  type="button"
                  :disabled="unlinking === prod.id"
                  class="inline-flex items-center gap-1 text-[9px] font-brand font-black uppercase tracking-widest text-feedback-error-text hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="handleUnlink(prod.id)"
                >
                  <svg
                    v-if="unlinking === prod.id"
                    class="w-3 h-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {{ unlinking === prod.id ? "…" : t("admin.blogs.unlinkBtn") }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty hint -->
        <p
          v-else
          class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground/40 text-center py-1"
        >
          {{ t("admin.blogs.noLinkedProductionsYet") }}
        </p>

        <!-- Search -->
        <div ref="dropdownRef" class="relative">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" stroke-linecap="round" />
            </svg>
            <input
              v-model="search"
              type="text"
              :placeholder="t('admin.blogs.linkToProductionSearch')"
              class="w-full h-10 pl-9 pr-9 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              @focus="searchFocused = true"
            />
            <button
              v-if="search"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              @click="
                search = '';
                searchResults = [];
              "
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

          <!-- Dropdown -->
          <Transition name="dropdown">
            <div
              v-if="showDropdown"
              class="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-border bg-card shadow-xl shadow-black/10 overflow-hidden"
            >
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
                  >{{ t("stories.loading") }}</span
                >
              </div>

              <div
                v-else-if="!searching && !searchResults.length"
                class="py-5 text-center text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
              >
                {{ t("admin.blogs.linkToProductionNoResults") }}
              </div>

              <div
                v-else
                class="max-h-56 overflow-y-auto overscroll-contain divide-y divide-border/50"
                @scroll="handleResultsScroll"
              >
                <div
                  v-for="prod in searchResults"
                  :key="prod.id"
                  class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
                  :class="
                    linkedProductionIds.has(prod.id)
                      ? 'bg-feedback-success-bg/40'
                      : ''
                  "
                >
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

                  <span
                    v-if="linkedProductionIds.has(prod.id)"
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

                  <button
                    v-else
                    type="button"
                    :disabled="linking === prod.id"
                    class="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-accent text-white font-brand font-black text-[9px] uppercase tracking-widest hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    @click="handleLink(prod)"
                  >
                    <svg
                      v-if="linking === prod.id"
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
                    {{ linking === prod.id ? "…" : t("admin.blogs.linkBtn") }}
                  </button>
                </div>

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
        </div>
      </div>
    </template>
  </AdminBlogsSectionCard>
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

<!--
  components/admin/blogs/LinkToProduction.vue

  Card section for linking this blog to productions.
  Shows all linked productions, persisted in localStorage so they survive
  navigation away and back within the same browser session.
-->
<script setup lang="ts">
import type { PaginatedResponse, ProductionView } from "@repo/common";
import {
  Link2,
  Search,
  Check,
  Loader2,
  X,
  ExternalLink,
} from "lucide-vue-next";

const props = defineProps<{
  blogId: number;
  galleryId?: number | null;
}>();

const { t, locale } = useI18n();
const { getAll, linkBlog, linkMedia } = useProductionApi();

// Persistence key (per blog)
const storageKey = computed(() => `vnv-blog-linked-prods-${props.blogId}`);

// Linked productions
// Loaded from localStorage on mount so they survive page navigations.
const linkedProductions = ref<ProductionView[]>([]);

onMounted(() => {
  if (!import.meta.client) return;
  try {
    const stored = localStorage.getItem(storageKey.value);
    if (stored)
      linkedProductions.value = JSON.parse(stored) as ProductionView[];
  } catch {
    // Ignore parse errors (corrupted storage etc.)
  }
});

function persistLinked() {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify(linkedProductions.value),
    );
  } catch {}
}

// Search state
const search = ref("");
const productions = ref<ProductionView[]>([]);
const loadingSearch = ref(false);
const searchOpen = ref(false);

// Options
const shareGallery = ref(true);

// Feedback
const linking = ref<number | null>(null);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

// Search
let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchProductions, 300);
});

async function fetchProductions() {
  loadingSearch.value = true;
  try {
    const resp = await getAll({
      productionFilters: search.value ? { titel: search.value } : undefined,
      paginationFilters: { page: 0, limit: 10, descending: true },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });
    const data = resp.data as PaginatedResponse<ProductionView> | null;
    productions.value = (data?.objects ?? []) as ProductionView[];
  } finally {
    loadingSearch.value = false;
  }
}

function openSearch() {
  searchOpen.value = true;
  search.value = "";
  feedback.value = null;
  fetchProductions();
}

// Link
const linkedIds = computed(
  () => new Set(linkedProductions.value.map((p) => p.id)),
);

async function link(production: ProductionView) {
  if (linkedIds.value.has(production.id)) return;
  linking.value = production.id;
  feedback.value = null;
  try {
    await linkBlog(production.id, props.blogId);
    if (shareGallery.value && props.galleryId) {
      await linkMedia(production.id, props.galleryId);
    }
    linkedProductions.value.push(production);
    persistLinked();

    search.value = "";
    searchOpen.value = false;
    feedback.value = {
      type: "ok",
      msg: t("admin.blogs.linkToProductionSuccess"),
    };
    setTimeout(() => (feedback.value = null), 3000);
  } catch {
    feedback.value = {
      type: "err",
      msg: t("admin.blogs.linkToProductionError"),
    };
  } finally {
    linking.value = null;
  }
}

// Close search dropdown when clicking outside
const wrapperRef = ref<HTMLElement | null>(null);
function handleOutsideClick(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    searchOpen.value = false;
  }
}
onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleOutsideClick),
);
</script>

<template>
  <div class="rounded-xl border border-card-border bg-card overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-card-border bg-card-hover">
      <h2
        class="font-brand font-black text-[13px] uppercase tracking-widest text-card-foreground flex items-center gap-2"
      >
        <Link2 :size="13" class="text-accent opacity-80" />
        {{ t("admin.blogs.linkedProductions") }}
      </h2>
      <p class="text-xs text-muted-foreground mt-0.5">
        {{ t("admin.blogs.linkedProductionsHint") }}
      </p>
    </div>

    <div class="p-5 space-y-4">
      <!-- Feedback banner -->
      <Transition name="slide-down">
        <div
          v-if="feedback"
          :class="[
            'rounded-lg border px-4 py-2.5 text-sm',
            feedback.type === 'ok'
              ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 text-green-700 dark:text-green-400'
              : 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 text-red-600 dark:text-red-400',
          ]"
        >
          {{ feedback.msg }}
        </div>
      </Transition>

      <!-- Linked productions list -->
      <div v-if="linkedProductions.length" class="space-y-2">
        <p
          class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.blogs.linkedThisSession") }}
        </p>
        <div class="space-y-2">
          <div
            v-for="prod in linkedProductions"
            :key="prod.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/10"
          >
            <Check
              :size="13"
              class="text-green-600 dark:text-green-400 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-foreground truncate">
                {{ prod.titel }}
              </p>
              <p
                v-if="prod.artist && prod.artist !== 'N/A'"
                class="text-[10px] text-muted-foreground truncate"
              >
                {{ prod.artist }}
              </p>
            </div>
            <NuxtLink
              :to="ROUTES.productions.byId(prod.id)"
              target="_blank"
              class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              :title="t('admin.blogs.viewProduction')"
            >
              <ExternalLink :size="12" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="rounded-lg border border-dashed border-border px-4 py-5 text-center"
      >
        <p
          class="text-[11px] font-brand font-black uppercase tracking-widest text-muted-foreground/60"
        >
          {{ t("admin.blogs.noLinkedProductions") }}
        </p>
      </div>

      <!-- Search + link section -->
      <div ref="wrapperRef" class="relative">
        <!-- Search input (shows when open) -->
        <div v-if="searchOpen" class="space-y-3">
          <div class="relative">
            <Search
              :size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="search"
              type="text"
              :placeholder="t('admin.blogs.linkToProductionSearch')"
              autofocus
              class="w-full pl-9 pr-9 h-10 bg-muted border border-border rounded-lg text-sm outline-none transition-colors focus:border-accent placeholder:text-muted-foreground"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              @click="searchOpen = false"
            >
              <X :size="14" />
            </button>
          </div>

          <!-- Share gallery option -->
          <label
            v-if="galleryId"
            class="flex items-start gap-2.5 cursor-pointer group"
          >
            <button
              type="button"
              class="w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              :class="
                shareGallery
                  ? 'bg-accent border-accent'
                  : 'border-border bg-background group-hover:border-accent/50'
              "
              @click="shareGallery = !shareGallery"
            >
              <Check v-if="shareGallery" :size="9" class="text-white" />
            </button>
            <div>
              <p
                class="text-[11px] font-brand font-black uppercase tracking-widest text-foreground"
              >
                {{ t("admin.blogs.shareGallery") }}
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">
                {{ t("admin.blogs.shareGalleryHint") }}
              </p>
            </div>
          </label>

          <!-- Results dropdown -->
          <div
            class="rounded-lg border border-border bg-background overflow-hidden"
          >
            <!-- Loading -->
            <div
              v-if="loadingSearch"
              class="flex items-center justify-center gap-2 py-6 text-muted-foreground"
            >
              <Loader2 :size="14" class="animate-spin" />
              <span
                class="text-[11px] font-brand font-black uppercase tracking-widest"
                >{{ t("stories.loading") }}</span
              >
            </div>

            <!-- No results -->
            <div v-else-if="!productions.length" class="py-6 text-center">
              <p class="text-sm text-muted-foreground">
                {{ t("admin.blogs.linkToProductionNoResults") }}
              </p>
            </div>

            <!-- Production list -->
            <div v-else class="divide-y divide-border max-h-56 overflow-y-auto">
              <div
                v-for="prod in productions"
                :key="prod.id"
                class="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-foreground truncate">
                    {{ prod.titel }}
                  </p>
                  <p
                    v-if="prod.artist && prod.artist !== 'N/A'"
                    class="text-[10px] text-muted-foreground truncate"
                  >
                    {{ prod.artist }}
                  </p>
                </div>

                <!-- Already linked -->
                <span
                  v-if="linkedIds.has(prod.id)"
                  class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black uppercase tracking-widest"
                >
                  <Check :size="8" /> {{ t("admin.blogs.linked") }}
                </span>

                <!-- Link button -->
                <button
                  v-else
                  type="button"
                  :disabled="linking === prod.id"
                  class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  @click="link(prod)"
                >
                  <Loader2
                    v-if="linking === prod.id"
                    :size="10"
                    class="animate-spin"
                  />
                  <Link2 v-else :size="10" />
                  {{
                    linking === prod.id
                      ? t("admin.blogs.linking")
                      : t("admin.blogs.linkBtn")
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Open search button (shows when closed) -->
        <button
          v-else
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed text-[11px] font-brand font-black uppercase tracking-widest transition-all cursor-pointer"
          style="
            border-color: color-mix(in srgb, var(--accent) 40%, transparent);
            color: var(--accent);
            background: color-mix(in srgb, var(--accent) 5%, transparent);
          "
          @mouseenter="
            (e) =>
              ((e.currentTarget as HTMLElement).style.background =
                'color-mix(in srgb, var(--accent) 12%, transparent)')
          "
          @mouseleave="
            (e) =>
              ((e.currentTarget as HTMLElement).style.background =
                'color-mix(in srgb, var(--accent) 5%, transparent)')
          "
          @click="openSearch"
        >
          <Link2 :size="13" />
          {{ t("admin.blogs.linkToProduction") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<!--
  components/admin/blogs/LinkToProduction.vue
  ===========================================

  Links this blog to one or more productions. Placed on Step 1 (Content tab)
  rather than Step 2 (Photos) because it is a content decision, not image work.

  When linked, the blog appears on the production's detail page under "Stories".
  Optionally, the blog's media gallery is shared with the production so both
  display the same images.

  Session persistence: linked productions are stored in localStorage keyed by
  blog ID. The API has no reverse-lookup endpoint so we track what we linked.

  Props:
    blogId     ID of the blog being edited
    galleryId  ID of the blog's gallery (used for the share-gallery option)
-->
<script setup lang="ts">
import type { PaginatedResponse, ProductionView } from "@repo/common";
import { Link2, Check, Loader2, ExternalLink } from "lucide-vue-next";

const props = defineProps<{ blogId: number; galleryId?: number | null }>();

const { t, locale } = useI18n();
const { getAll, linkBlog, linkMedia } = useProductionApi();
const { fetchSuggestions } = useArchiveView();

const storageKey = computed(() => `vnv-blog-linked-prods-${props.blogId}`);

// Productions linked in this or a previous session, rehydrated from localStorage
const linkedProductions = ref<ProductionView[]>([]);

onMounted(() => {
  if (!import.meta.client) return;
  try {
    const stored = localStorage.getItem(storageKey.value);
    if (stored)
      linkedProductions.value = JSON.parse(stored) as ProductionView[];
  } catch {
    /* corrupted storage — start fresh */
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
const shareGallery = ref(true);
const linking = ref<number | null>(null);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

const linkedIds = computed(
  () => new Set(linkedProductions.value.map((p) => p.id)),
);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchProductions, 300);
});

async function fetchProductions() {
  loadingSearch.value = true;
  try {
    const resp = await getAll({
      productionFilters: { titelOrArtist: search.value, is_suggestion: false },
      paginationFilters: { page: 0, limit: 10, descending: true },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });
    productions.value = ((resp.data as PaginatedResponse<ProductionView> | null)
      ?.objects ?? []) as ProductionView[];
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
    setTimeout(() => {
      feedback.value = null;
    }, 3000);
  } catch {
    feedback.value = {
      type: "err",
      msg: t("admin.blogs.linkToProductionError"),
    };
  } finally {
    linking.value = null;
  }
}

// Close the dropdown when clicking outside
const wrapperRef = ref<HTMLElement | null>(null);
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as Element;
  if (!document.body.contains(target)) return;
  if (wrapperRef.value?.contains(target)) return;
  searchOpen.value = false;
}
onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleOutsideClick),
);
</script>

<template>
  <AdminBlogsSectionCard
    :title="t('admin.blogs.linkedProductions')"
    :subtitle="t('admin.blogs.linkedProductionsHint')"
  >
    <div class="p-5 space-y-4">
      <AdminBlogsFeedbackBanner :feedback="feedback" />

      <!-- Previously linked productions list -->
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
              aria-hidden="true"
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

      <!-- Search + link panel -->
      <div ref="wrapperRef" class="relative">
        <div v-if="searchOpen" class="space-y-3">
          <SearchBar
            v-model:model-value="search"
            :fetch-suggestions="fetchSuggestions"
            :limit="5"
            class="w-full !h-12"
          />

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
              :aria-pressed="shareGallery"
              @click="shareGallery = !shareGallery"
            >
              <Check
                v-if="shareGallery"
                :size="9"
                class="text-white"
                aria-hidden="true"
              />
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

          <!-- Results list -->
          <div
            class="rounded-lg border border-border bg-background overflow-hidden"
          >
            <div
              v-if="loadingSearch"
              class="flex items-center justify-center gap-2 py-6 text-muted-foreground"
            >
              <Loader2 :size="14" class="animate-spin" aria-hidden="true" />
              <span
                class="text-[11px] font-brand font-black uppercase tracking-widest"
                >{{ t("stories.loading") }}</span
              >
            </div>
            <div v-else-if="!productions.length" class="py-6 text-center">
              <p class="text-sm text-muted-foreground">
                {{ t("admin.blogs.linkToProductionNoResults") }}
              </p>
            </div>
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
                <span
                  v-if="linkedIds.has(prod.id)"
                  class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black uppercase tracking-widest"
                >
                  <Check :size="8" aria-hidden="true" />
                  {{ t("admin.blogs.linked") }}
                </span>
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
                    aria-hidden="true"
                  />
                  <Link2 v-else :size="10" aria-hidden="true" />
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

        <!-- Closed state trigger button -->
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
          <Link2 :size="13" aria-hidden="true" />
          {{ t("admin.blogs.linkToProduction") }}
        </button>
      </div>
    </div>
  </AdminBlogsSectionCard>
</template>

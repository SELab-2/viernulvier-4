<!--
  pages/admin/blogs/index.vue
  ============================
  Admin overview — mirrors the public stories/index.vue layout exactly, with
  edit/delete action buttons added per story item and a "New Story" button.

  Key design decisions:
  - Uses StoryListItem directly (same visual as public page).
  - AdminEditButton / AdminDeleteButton are explicitly imported so Nuxt's
    auto-import never accidentally resolves the wrong component.
  - AdminBlogCard.vue is intentionally absent — it caused auto-import conflicts.
  - All navigation uses ROUTES constants, no hardcoded strings.
-->
<script lang="ts" setup>
import type {
  BlogView,
  FilterBlog,
  PaginatedResponse,
  Language,
} from "@repo/common";
import StoryToolbar from "~/components/blogs/StoryToolbar.vue";
import StorySkeleton from "~/components/blogs/StorySkeleton.vue";
import StoryListItem from "~/components/blogs/StoryListItem.vue";
import AdminEditButton from "~/components/admin/EditButton.vue";
import AdminDeleteButton from "~/components/admin/DeleteButton.vue";
import { formatMonthLabel } from "~/utils/formatters";
import { ROUTES } from "~/utils/routes";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();
const router = useRouter();

// ─── Filter state — identical to stories/index.vue ───────────────────────────
const sortOrder = ref<"newest" | "oldest">("newest");
const searchQuery = ref("");
const dateFilter = ref<FilterBlog>({});

// ─── Date bounds for StoryToolbar calendar ───────────────────────────────────
const oldestDate = ref("");
const newestDate = ref("");

// Same unwrap helper as stories/index.vue
function unwrap(result: unknown): PaginatedResponse<BlogView> | null {
  if (!result) return null;
  const r = result as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && "objects" in r.data)
    return r.data as PaginatedResponse<BlogView>;
  if ("objects" in r) return r as unknown as PaginatedResponse<BlogView>;
  return null;
}

async function fetchDateBounds() {
  try {
    const [oldestRaw, newestRaw] = await Promise.all([
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: false },
        languageFilters: { lang: locale.value as Language },
      }),
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: true },
        languageFilters: { lang: locale.value as Language },
      }),
    ]);
    const first = unwrap(oldestRaw)?.objects?.[0];
    const last = unwrap(newestRaw)?.objects?.[0];
    if (first?.created_at) oldestDate.value = first.created_at.slice(0, 10);
    if (last?.created_at) newestDate.value = last.created_at.slice(0, 10);
  } catch {
    /* non-critical */
  }
}

// ─── Pagination — identical to stories/index.vue ─────────────────────────────
const LIMIT = 20;
const page = ref(0);
const totalItems = ref(0);
const stories = ref<BlogView[]>([]);
const pending = ref(false);
const isLoadingMore = ref(false);
const fetchError = ref<Error | null>(null);

const hasMore = computed(() => stories.value.length < totalItems.value);

async function loadPage(reset = false) {
  if (!reset && (isLoadingMore.value || !hasMore.value)) return;

  if (reset) {
    page.value = 0;
    stories.value = [];
    pending.value = true;
    fetchError.value = null;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const raw = await getAll({
      paginationFilters: {
        page: page.value,
        limit: LIMIT,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as Language },
      blogFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(dateFilter.value.after ? { after: dateFilter.value.after } : {}),
        ...(dateFilter.value.before ? { before: dateFilter.value.before } : {}),
      },
    });

    const paged = unwrap(raw);
    totalItems.value = paged?.totalItems ?? 0;
    const items = (paged?.objects ?? []) as BlogView[];

    if (reset) stories.value = items;
    else stories.value.push(...items);
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value = false;
    isLoadingMore.value = false;
  }
}

watch([sortOrder, searchQuery, dateFilter, locale], () => loadPage(true), {
  deep: true,
});

// ─── Infinite scroll ─────────────────────────────────────────────────────────
const sentinel = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

watch(sentinel, (el) => {
  io?.disconnect();
  if (!el) return;
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoadingMore.value) {
        page.value++;
        loadPage(false);
      }
    },
    { rootMargin: "400px" },
  );
  io.observe(el);
});

onMounted(async () => {
  await fetchDateBounds();
  await loadPage(true);
});

onUnmounted(() => io?.disconnect());

// ─── Year / month grouping ────────────────────────────────────────────────────
const byYear = computed(() => {
  const yearMap = new Map<string, BlogView[]>();
  for (const s of stories.value) {
    const year = String(new Date(s.created_at ?? 0).getFullYear());
    if (!yearMap.has(year)) yearMap.set(year, []);
    yearMap.get(year)!.push(s);
  }
  const yearKeys = [...yearMap.keys()].sort((a, b) =>
    sortOrder.value === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return yearKeys.map((year) => {
    const monthMap = new Map<string, BlogView[]>();
    for (const s of yearMap.get(year)!) {
      const d = new Date(s.created_at ?? 0);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) monthMap.set(key, []);
      monthMap.get(key)!.push(s);
    }
    const monthKeys = [...monthMap.keys()].sort((a, b) =>
      sortOrder.value === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
    );
    return {
      year,
      months: monthKeys.map((key) => ({ key, stories: monthMap.get(key)! })),
    };
  });
});

// Collapsed state (open by default, track what's closed)
const closedYears = ref(new Set<string>());
const closedMonths = ref(new Set<string>());

function toggleYear(year: string) {
  const next = new Set(closedYears.value);
  if (next.has(year)) next.delete(year);
  else next.add(year);
  closedYears.value = next;
}
function toggleMonth(key: string) {
  const next = new Set(closedMonths.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  closedMonths.value = next;
}

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteTarget = ref<{ id: number; title: string } | null>(null);
const deleteLoading = ref(false);

function requestDelete(story: BlogView) {
  deleteTarget.value = { id: story.id, title: story.titel ?? "—" };
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleteLoading.value = true;
  try {
    await remove(deleteTarget.value.id);
    deleteTarget.value = null;
    await loadPage(true);
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-background text-foreground transition-colors duration-200"
  >
    <!-- ── Admin header ───────────────────────────────────────────────────── -->
    <div class="bg-background border-b border-border">
      <div
        class="container mx-auto px-4 max-w-5xl py-8 sm:py-12 flex items-end justify-between gap-4"
      >
        <div>
          <p
            class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground mb-1"
          >
            Admin
          </p>
          <h1
            class="font-brand font-black text-4xl sm:text-6xl uppercase tracking-tighter leading-none text-foreground mb-3"
          >
            {{ t("stories.title") }}
          </h1>
          <p
            class="font-brand font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate"
          >
            {{ t("stories.headerDescription") }}
          </p>
        </div>

        <NuxtLink :to="ROUTES.stories.create" class="shrink-0">
          <button type="button" class="btn-outline flex items-center gap-2">
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {{ t("admin.blogs.new") }}
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- ── Toolbar (identical to public page — includes calendar) ────────── -->
    <StoryToolbar
      v-model:sort-order="sortOrder"
      :story-titles="[]"
      :oldest-date="oldestDate"
      :newest-date="newestDate"
      :date-filter="dateFilter"
      @update:search="searchQuery = $event"
      @update:date-filter="dateFilter = $event"
    />

    <!-- ── Main ──────────────────────────────────────────────────────────── -->
    <main class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">
      <StorySkeleton v-if="pending" />

      <!-- Error -->
      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20"
        >
          {{ t("stories.noStories") }}
        </p>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-rose-400"
        >
          {{ fetchError.message }}
        </p>
        <button class="mt-4 btn-outline" @click="loadPage(true)">
          {{ t("stories.retry") }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!pending && stories.length === 0"
        class="py-24 text-center"
      >
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
        >
          {{ t("stories.noStories") }}
        </p>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          {{ t("stories.noStoriesDesc") }}
        </p>
      </div>

      <!-- ── Timeline ────────────────────────────────────────────────────── -->
      <template v-else>
        <div class="space-y-12">
          <section
            v-for="group in byYear"
            :key="group.year"
            :id="`story-year-${group.year}`"
            class="blog-year-section"
          >
            <!-- Year heading -->
            <button
              type="button"
              class="blog-year-heading w-full text-left cursor-pointer"
              :aria-expanded="!closedYears.has(group.year)"
              :aria-controls="`year-body-${group.year}`"
              @click="toggleYear(group.year)"
            >
              <div class="blog-year-accent" aria-hidden="true" />
              <span class="blog-year-label font-brand select-none">{{
                group.year
              }}</span>
              <div class="flex-1 h-px bg-foreground/15 mx-3" />
              <svg
                class="w-3.5 h-3.5 shrink-0 text-foreground/40 transition-transform duration-200"
                :class="closedYears.has(group.year) ? '-rotate-90' : 'rotate-0'"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-show="!closedYears.has(group.year)"
                :id="`year-body-${group.year}`"
              >
                <div class="space-y-8 pb-10">
                  <div
                    v-for="month in group.months"
                    :key="month.key"
                    class="blog-month-group"
                  >
                    <!-- Month heading -->
                    <button
                      type="button"
                      class="flex items-center gap-3 mb-3 w-full text-left cursor-pointer group/month"
                      :aria-expanded="!closedMonths.has(month.key)"
                      @click="toggleMonth(month.key)"
                    >
                      <div
                        class="w-2 h-2 rounded-full bg-foreground/40 shrink-0 transition-colors group-hover/month:bg-purple-400"
                        aria-hidden="true"
                      />
                      <span
                        class="font-brand font-black text-[10px] uppercase tracking-widest text-foreground/60 group-hover/month:text-foreground transition-colors"
                      >
                        {{ formatMonthLabel(month.key, locale) }}
                      </span>
                      <div class="flex-1 h-px bg-foreground/15" />
                      <svg
                        class="w-3 h-3 shrink-0 text-foreground/30 transition-transform duration-200 ml-1"
                        :class="
                          closedMonths.has(month.key)
                            ? '-rotate-90'
                            : 'rotate-0'
                        "
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <Transition
                      enter-active-class="transition-all duration-150 ease-out"
                      enter-from-class="opacity-0"
                      enter-to-class="opacity-100"
                      leave-active-class="transition-all duration-100 ease-in"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <div
                        v-show="!closedMonths.has(month.key)"
                        class="space-y-2"
                      >
                        <!--
                          StoryListItem (same as public page) + action buttons
                          in a column to the right.
                        -->
                        <div
                          v-for="story in month.stories"
                          :key="story.id"
                          class="flex items-stretch gap-2"
                        >
                          <!-- Story card — same visual as public page -->
                          <NuxtLink
                            :to="ROUTES.stories.byId(story.id)"
                            class="flex-1 min-w-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
                          >
                            <StoryListItem :story="story" />
                          </NuxtLink>

                          <!-- Admin actions -->
                          <div
                            class="flex flex-col gap-1.5 justify-center shrink-0 py-1"
                          >
                            <AdminEditButton
                              :label="t('admin.edit')"
                              :size="36"
                              @click="
                                router.push(ROUTES.stories.edit(story.id))
                              "
                            />
                            <AdminDeleteButton
                              :label="t('admin.delete')"
                              :size="36"
                              @click="requestDelete(story)"
                            />
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </Transition>
          </section>
        </div>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinel" class="h-1" aria-hidden="true" />

        <div
          v-if="isLoadingMore"
          class="flex items-center justify-center gap-3 py-10 text-muted-foreground"
        >
          <svg
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span
            class="font-brand font-black text-[10px] uppercase tracking-widest"
          >
            {{ t("stories.loading") }}
          </span>
        </div>
      </template>
    </main>

    <!-- ── Delete confirmation ────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteTarget"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/10 backdrop-blur-sm"
          @click.self="deleteTarget = null"
        >
          <div
            class="bg-background border border-border rounded-xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2
              class="font-brand font-black text-xl uppercase tracking-tighter text-foreground mb-2"
            >
              {{ t("admin.blogs.deleteTitle") }}
            </h2>
            <p class="text-sm text-muted-foreground mb-8 leading-relaxed">
              {{
                t("admin.blogs.deleteConfirm", { title: deleteTarget.title })
              }}
            </p>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                class="btn-outline"
                :disabled="deleteLoading"
                @click="deleteTarget = null"
              >
                {{ t("admin.cancel") }}
              </button>
              <button
                type="button"
                class="btn-danger"
                :disabled="deleteLoading"
                @click="confirmDelete"
              >
                {{ deleteLoading ? "…" : t("admin.blogs.deleteConfirmBtn") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

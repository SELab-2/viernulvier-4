<!--
  pages/admin/productions/batch-edit.vue

  This page owns all initial data loads. It calls loadCommonTags and
  loadCommonSeries directly in its own onMounted, then passes the fetch
  functions down to each tab as props — eliminating any timing dependency
  between parent and child onMounted hooks.
-->
<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import BatchTagsTab from "~/components/admin/productions/BatchTagsTab.vue";
import BatchSeriesTab from "~/components/admin/productions/BatchSeriesTab.vue";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";

const { t, locale } = useI18n();
const router = useRouter();
const productionApi = useProductionApi();
const seriesApi = useSeriesApi();

const { selectedProductions, hasSelections, loadCommonTags, loadCommonSeries } =
  useProductionBatchEdit();

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabs = [
  {
    id: "tags",
    label: "admin-productions.batchEdit.tabs.tags",
    default: "Tags",
  },
  {
    id: "series",
    label: "admin-productions.batchEdit.tabs.series",
    default: "Series",
  },
  // { id: "blogs", label: "admin-productions.batchEdit.tabs.blogs", default: "Blogs" },
] as const;

type TabId = (typeof tabs)[number]["id"];
const activeTab = ref<TabId>("tags");

// ── Fetch functions — defined here so the page controls all initial loads ──────

async function fetchTagsForProduction(id: number) {
  const res = await productionApi.getTags(id, locale.value as "nl" | "en");
  return (res.data ?? []).map((tag) => ({ id: tag.id, tag: tag.tag }));
}

async function fetchSeriesForProduction(id: number) {
  type SeriesObject = { id: number; titel: string; description: string };

  const [nlRes, enRes] = await Promise.all([
    seriesApi.getAll({
      languageFilters: { lang: "nl" },
      seriesFilters: { is_suggestion: false, production_id: id },
    }),
    seriesApi.getAll({
      languageFilters: { lang: "en" },
      seriesFilters: { is_suggestion: false, production_id: id },
    }),
  ]);

  const nlObjects =
    (nlRes.data as unknown as { objects?: SeriesObject[] })?.objects ?? [];
  const enObjects =
    (enRes.data as unknown as { objects?: SeriesObject[] })?.objects ?? [];

  const enById = new Map(enObjects.map((s) => [s.id, s]));

  return nlObjects.map((s) => {
    const en = enById.get(s.id);
    return {
      type: "existing" as const,
      id: s.id,
      titel: { nl: s.titel, en: en?.titel ?? undefined },
      description: { nl: s.description, en: en?.description ?? undefined },
    };
  });
}

// ── Initial load — page triggers this, not the tabs ───────────────────────────

onMounted(async () => {
  if (!hasSelections.value) {
    await router.replace(ROUTES.admin.productions.base);
    return;
  }

  // Load both tabs in parallel so switching to series feels instant.
  await Promise.all([
    loadCommonTags(fetchTagsForProduction),
    loadCommonSeries(fetchSeriesForProduction),
  ]);
});

// ── Navigation ────────────────────────────────────────────────────────────────

function goBack() {
  router.back();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTitle(production: { titel: unknown }): string {
  const titel = production.titel;
  if (typeof titel === "string") return titel;
  if (titel && typeof titel === "object") {
    const loc = titel as Record<string, string>;
    return loc["nl"] ?? loc["en"] ?? "";
  }
  return "";
}
</script>

<template>
  <div class="flex h-full min-h-screen">
    <!-- ── Left panel — selected productions ─────────────────────────────── -->
    <aside
      class="w-64 shrink-0 flex flex-col border-r border-border bg-muted/20"
    >
      <div class="px-4 pt-5 pb-4 border-b border-border shrink-0">
        <button
          class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          @click="goBack"
        >
          <ArrowLeft :size="11" stroke-width="2.5" />
          {{
            t(
              "admin-productions.batchEdit.backToSelection",
              "Back to selection",
            )
          }}
        </button>

        <p
          class="mt-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.batchEdit.editingLabel", "Editing") }}
        </p>
        <p class="text-sm font-semibold text-foreground leading-tight">
          {{ selectedProductions.length }}
          {{ t("admin-productions.batchEdit.productionsLabel", "productions") }}
        </p>
      </div>

      <ul class="flex-1 overflow-y-auto py-1">
        <li
          v-for="production in selectedProductions"
          :key="production.id"
          class="flex items-start gap-2 px-4 py-2.5"
        >
          <span
            class="text-xs text-foreground leading-snug flex-1 min-w-0 break-words"
          >
            {{ getTitle(production) }}
          </span>
          <span
            class="text-[9px] text-muted-foreground font-mono shrink-0 pt-0.5"
          >
            #{{ production.id }}
          </span>
        </li>
      </ul>
    </aside>

    <!-- ── Right panel — editing ──────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <nav class="flex items-end border-b border-border px-6 pt-5 shrink-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 pb-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all"
          :class="
            activeTab === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = tab.id"
        >
          {{ t(tab.label, tab.default) }}
        </button>
      </nav>

      <div class="flex-1 overflow-y-auto p-6">
        <BatchTagsTab
          v-if="activeTab === 'tags'"
          :fetch-tags-for-production="fetchTagsForProduction"
        />
        <BatchSeriesTab
          v-else-if="activeTab === 'series'"
          :fetch-series-for-production="fetchSeriesForProduction"
        />
        <!--
          <BatchBlogsTab v-else-if="activeTab === 'blogs'" ... />
        -->
      </div>
    </main>
  </div>
</template>

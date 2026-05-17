<!--
  pages/admin/productions/batch-edit.vue

  This page owns the initial data load. It calls loadCommonTags directly in its
  own onMounted, then passes the fetch function down to the tab as a prop so the
  tab can trigger reloads after save or on locale change — without any flag-based
  timing dependency between parent and child onMounted hooks.
-->
<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import BatchTagsTab from "~/components/admin/productions/BatchTagsTab.vue";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";

const { t, locale } = useI18n();
const router = useRouter();
const productionApi = useProductionApi();

const { selectedProductions, hasSelections, loadCommonTags } =
  useProductionBatchEdit();

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabs = [
  {
    id: "tags",
    label: "admin-productions.batchEdit.tabs.tags",
    default: "Tags",
  },
  // { id: "series", label: "admin-productions.batchEdit.tabs.series", default: "Series" },
  // { id: "blogs",  label: "admin-productions.batchEdit.tabs.blogs",  default: "Blogs"  },
] as const;

type TabId = (typeof tabs)[number]["id"];
const activeTab = ref<TabId>("tags");

// ── Fetch function — defined here so the page controls the initial load ────────

async function fetchTagsForProduction(id: number) {
  const res = await productionApi.getTags(id, locale.value as "nl" | "en");
  return (res.data ?? []).map((tag) => ({ id: tag.id, tag: tag.tag }));
}

// ── Initial load — the page triggers this, not the tab ────────────────────────
//
// Doing the load here (rather than in the tab's onMounted) eliminates the race
// condition where the tab's onMounted fires before the page's, reading a stale
// commonTagsLoaded flag and skipping the fetch.

onMounted(async () => {
  if (!hasSelections.value) {
    router.replace("/admin/productions");
    return;
  }

  await loadCommonTags(fetchTagsForProduction);
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
          {{ t("admin-productions.batch.backToSelection") }}
        </button>

        <p
          class="mt-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.batch.editingLabel") }}
        </p>
        <p class="text-sm font-semibold text-foreground leading-tight">
          {{ selectedProductions.length }}
          {{ t("admin-productions.batch.productionsLabel") }}
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
        <!--
          <BatchSeriesTab v-else-if="activeTab === 'series'" ... />
          <BatchBlogsTab  v-else-if="activeTab === 'blogs'"  ... />
        -->
      </div>
    </main>
  </div>
</template>

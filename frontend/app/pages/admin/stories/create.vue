<!--
  pages/admin/stories/create.vue

  Admin Blog Create Page — identical two-column layout as edit/[id].vue.

  After successful save, navigates to the edit page with ?step=photos so the
  user lands directly on the image upload step (Step 2).

  Preview column:
  - position: sticky on the inner div (NOT the outer column div)
  - top accounts for the AppHeader height (min-h-[110px] on desktop)
  - NO overflow-y on the sticky element itself — that would create a new
    scroll context and break sticky. The AdminBlogsPreview component has
    its own internal scroll at 650px fixed height.
  - items-start on the grid row is essential: without it the right column
    stretches to match the left column height, removing the need to stick.
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

definePageMeta({ ssr: false });

const { create } = useBlogApi();
const { t } = useI18n();

const saving = ref(false);
const error = ref<string | null>(null);

const previewData = ref<{
  titel: { nl: string; en: string };
  description: { nl: string; en: string };
}>({ titel: { nl: "", en: "" }, description: { nl: "", en: "" } });

async function handleSubmit(data: CreateBlog) {
  saving.value = true;
  error.value = null;
  try {
    const resp = await create(data);
    if (resp.data) {
      // Navigate to edit page, landing directly on the photos step
      await navigateTo({
        path: ROUTES.admin.stories.edit(resp.data.id),
        query: { step: "photos" },
      });
    } else {
      error.value = resp.error ?? t("admin.blogs.createError");
    }
  } catch {
    error.value = t("admin.blogs.createError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- ── Top bar ─────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-4 flex-wrap">
        <NuxtLink
          :to="ROUTES.admin.stories.base"
          class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {{ t("admin.back") }}
        </NuxtLink>

        <h1
          class="font-brand font-black text-2xl uppercase tracking-tight text-foreground flex-1 truncate"
        >
          {{ t("admin.blogs.new") }}
        </h1>
      </div>

      <!-- ── Step indicator ─────────────────────────────────────────────── -->
      <div
        class="flex items-center gap-0 border border-border rounded-xl overflow-hidden w-fit"
      >
        <!-- Step 1 — active -->
        <div
          class="flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-brand font-black uppercase tracking-widest bg-foreground text-background"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-background shrink-0"
            >1</span
          >
          {{ t("admin.blogs.sectionTitle") }} &amp;
          {{ t("admin.blogs.sectionContent") }}
        </div>

        <span class="w-px bg-border self-stretch" />

        <!-- Step 2 — locked until blog is saved -->
        <div
          class="flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-brand font-black uppercase tracking-widest bg-background text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-muted-foreground/30 shrink-0"
            >2</span
          >
          {{ t("admin.blogs.image.multiTitle") }}
          <svg
            class="w-3 h-3 ml-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <!-- ── Error banner ────────────────────────────────────────────────── -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!--
        Two-column grid.
        items-start: each column is only as tall as its own content — required
        for position:sticky to work in the right column.
      -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        <!-- Left: form -->
        <AdminBlogsForm
          mode="create"
          :loading="saving"
          @submit="handleSubmit"
          @cancel="navigateTo(ROUTES.admin.stories.base)"
          @preview-update="(d) => (previewData = d)"
        />

        <!--
          Right: sticky preview.

          IMPORTANT: position:sticky is on the INNER div, not the column div.
          The outer column div has no overflow set — that would break sticky.
          top: calc(110px + 1.5rem)  →  clears the AppHeader (min-h 110px) + gap.

          AdminBlogsPreview has h-[650px] and its own internal scroll container,
          so we do NOT add overflow-y here (that would create a new scroll
          context and immediately break sticky).
        -->
        <div class="hidden xl:block">
          <div class="sticky" style="top: calc(110px + 1.5rem)">
            <AdminBlogsPreview :data="previewData" :header-crop="null" />
          </div>
        </div>
      </div>

      <!-- Mobile preview — collapsible -->
      <details
        class="xl:hidden group border border-border rounded-xl overflow-hidden"
      >
        <summary
          class="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer list-none select-none"
        >
          <span
            class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" stroke-linecap="round" />
            </svg>
            {{ t("admin.blogs.preview.label") }}
          </span>
          <svg
            class="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <div class="p-4">
          <AdminBlogsPreview :data="previewData" :header-crop="null" />
        </div>
      </details>
    </div>
  </div>
</template>

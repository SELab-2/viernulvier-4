<!--
  pages/admin/stories/create.vue
  ================================
  Admin blog create page — two-step layout.

  Step 1: Title & Content (active on this page)
    - Bilingual title + rich-text description
    - "Link to production" card is shown but locked (blog must be saved first)
    - Create + Reset buttons at the bottom via AdminBlogsForm
  Step 2: Header images (locked — only unlocked after saving)

  After saving, redirects to the edit page at ?step=content so the user can
  immediately link productions without an extra click.

  Layout:
  - Desktop XL: two-column grid (left = form, right = sticky preview)
  - Mobile: collapsible preview panel at the bottom
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

definePageMeta({ ssr: false });

const { create } = useBlogApi();
const snackbar = useSnackbar();
const { t } = useI18n();

const saving = ref(false);
const error = ref<string | null>(null);

// Live data fed into the preview panel — updated by AdminBlogsForm on each keystroke.
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
      snackbar.add({
        type: "success",
        text: t("admin.blogs.createSuccess"),
      });
      // After creating, redirect to the edit page's "content" step so the
      // user can immediately link productions without navigating again.
      await navigateTo({
        path: ROUTES.admin.stories.edit(resp.data.id),
        query: { step: "content" },
      });
    } else {
      error.value = resp.error ?? t("admin.blogs.createError");
      snackbar.add({
        type: "error",
        text: error.value,
      });
    }
  } catch {
    error.value = t("admin.blogs.createError");
    snackbar.add({
      type: "error",
      text: error.value,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="page-container py-10 space-y-6">
      <!-- ── Top bar ─────────────────────────────────────────────────────── -->
      <div class="space-y-4">
        <NuxtLink
          :to="ROUTES.admin.stories.base"
          class="inline-flex items-center gap-1.5 font-brand font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {{ t("admin.back") }}
        </NuxtLink>

        <h1
          class="font-brand font-black text-2xl uppercase tracking-tight text-foreground truncate"
        >
          {{ t("admin.blogs.new") }}
        </h1>
      </div>

      <!-- ── Step indicator ────────────────────────────────────────────── -->
      <!--
        Step 2 is locked until the blog is saved.
        The lock icon and reduced opacity make it clear the step is unavailable.
      -->
      <div
        class="flex items-center gap-0 border border-border rounded-xl overflow-hidden w-fit"
      >
        <!-- Step 1 — active (current step) -->
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
          :title="
            t('admin.blogs.image.multiTitle') +
            ' — ' +
            t('admin.blogs.linkToProductionCreateHint')
          "
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-muted-foreground/30 shrink-0"
            >2</span
          >
          {{ t("admin.blogs.image.multiTitle") }}
          <!-- Lock icon indicates this step requires saving first -->
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

      <!-- ── Error banner ──────────────────────────────────────────────── -->
      <div
        v-if="error"
        class="rounded-lg border border-feedback-error-border bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error-text"
      >
        {{ error }}
      </div>

      <!-- ── Two-column layout ─────────────────────────────────────────── -->
      <!--
        items-start: prevents the preview column from stretching to match
        the form column height. The preview scrolls naturally with the page.
      -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        <!-- Left column: form + locked link-to-production card -->
        <AdminBlogsForm
          mode="create"
          :loading="saving"
          :back-url="ROUTES.admin.stories.base"
          @submit="handleSubmit"
          @preview-update="(d) => (previewData = d)"
        >
          <template #extra>
            <!--
              No blogId is passed here because the blog does not exist yet.
            -->
            <AdminSharedProductionLinker type="blog" />
          </template>
        </AdminBlogsForm>

        <!-- Right column: live preview (desktop XL+ only, sticky) -->
        <div class="hidden xl:block self-start sticky top-28">
          <AdminBlogsPreview :data="previewData" :header-crop="null" />
        </div>
      </div>

      <!-- ── Mobile collapsible preview ───────────────────────────────── -->
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
      <!-- CSV import tools for blogs -->
      <AdminCsvImportCard
        target="blogs"
        :disclaimer="t('admin.csvImport.blogDisclaimer')"
      />
    </div>
  </div>
</template>

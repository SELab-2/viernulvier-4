<!--
  pages/admin/blogs/create.vue
  ==============================
  Form page for creating a new blog/story.
  Uses AdminBlogForm and calls useBlogApi.create on submit.

  NOTE: The exact shape of CreateBlog is inferred from the Blog type
  (localized { nl, en } objects). Adjust field names to match the actual
  type exported from @repo/common if needed.
-->
<script lang="ts" setup>
import type { CreateBlog } from "@repo/common";
import type { BlogFormValues } from "~/components/admin/blogs/AdminBlogForm.vue";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { ROUTES } from "~/utils/routes";

const { create } = useBlogApi();
const router = useRouter();
const { t } = useI18n();

const loading = ref(false);
const apiError = ref<string | null>(null);

async function handleSubmit(values: BlogFormValues) {
  loading.value = true;
  apiError.value = null;

  try {
    // Map flat form values to the localized CreateBlog body.
    // Adjust keys to match the actual @repo/common CreateBlog type.
    const body: CreateBlog = {
      title: {
        nl: values.titleNl,
        ...(values.titleEn ? { en: values.titleEn } : {}),
      },
      description: {
        nl: values.descriptionNl,
        ...(values.descriptionEn ? { en: values.descriptionEn } : {}),
      },
      // Pass the date; the field name (created_at / date / published_at) may
      // differ — adjust to match what the API expects.
      ...(values.date ? { created_at: values.date } : {}),
    } as CreateBlog;

    await create(body);
    router.push(ROUTES.stories.base);
  } catch {
    apiError.value = t("admin.blogs.createError");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- ── Page header ────────────────────────────────────────────────────── -->
    <div class="border-b border-border bg-muted">
      <div
        class="container mx-auto px-4 max-w-3xl py-6 flex items-end justify-between gap-4"
      >
        <div>
          <p
            class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground mb-1"
          >
            Admin / {{ t("stories.title") }}
          </p>
          <h1
            class="font-brand font-black text-3xl sm:text-4xl uppercase tracking-tighter text-foreground leading-none"
          >
            {{ t("admin.blogs.new") }}
          </h1>
        </div>

        <NuxtLink :to="ROUTES.stories.base">
          <button
            type="button"
            class="btn-outline flex items-center gap-2 shrink-0"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ t("admin.back") }}
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- ── Form ───────────────────────────────────────────────────────────── -->
    <div class="container mx-auto px-4 max-w-3xl py-10">
      <div class="bg-card border border-card-border rounded-xl p-6 sm:p-8">
        <!-- API error banner -->
        <div
          v-if="apiError"
          class="mb-6 flex items-center gap-3 rounded-lg border border-[var(--action-red-border)] bg-[var(--action-red-hover)] px-4 py-3"
          role="alert"
        >
          <svg
            class="w-4 h-4 text-[var(--action-red-icon)] shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p
            class="font-brand font-black text-[10px] uppercase tracking-wide text-[var(--action-red-icon)]"
          >
            {{ apiError }}
          </p>
        </div>

        <AdminBlogForm
          :loading="loading"
          :submit-label="t('admin.blogs.createBtn')"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

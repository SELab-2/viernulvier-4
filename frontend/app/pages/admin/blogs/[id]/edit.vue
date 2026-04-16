<!--
  pages/admin/blogs/[id]/edit.vue
  =================================
  Edit page for an existing blog/story.

  - Fetches the full Blog object (no lang param) so we have both NL and EN
    values to pre-fill the form.
  - Maps Blog → BlogFormValues for AdminBlogForm.
  - On submit calls useBlogApi.modify (PATCH) with only changed fields.
-->
<script lang="ts" setup>
import type { Blog, ModifyBlog } from "@repo/common";
import type { BlogFormValues } from "~/components/admin/blogs/AdminBlogForm.vue";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { ROUTES } from "~/utils/routes";

const { getById, modify } = useBlogApi();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const blogId = computed(() => Number(route.params.id));

// Fetch without lang so we receive the full Blog with localised objects.
const {
  data: blog,
  pending,
  error: fetchError,
} = await useAsyncData(`admin-blog-${blogId.value}`, () =>
  getById(blogId.value),
);

// Map Blog → form initial values once data arrives.
const initialValues = computed<BlogFormValues | undefined>(() => {
  const b = blog.value as Blog | null;
  if (!b) return undefined;
  return {
    titleNl: b.title?.nl ?? "",
    titleEn: b.title?.en ?? "",
    descriptionNl: b.description?.nl ?? "",
    descriptionEn: b.description?.en ?? "",
    date: b.created_at ? b.created_at.split("T")[0] : "",
  };
});

const loading = ref(false);
const apiError = ref<string | null>(null);

async function handleSubmit(values: BlogFormValues) {
  loading.value = true;
  apiError.value = null;

  try {
    const body: ModifyBlog = {
      title: {
        nl: values.titleNl,
        ...(values.titleEn ? { en: values.titleEn } : {}),
      },
      description: {
        nl: values.descriptionNl,
        ...(values.descriptionEn ? { en: values.descriptionEn } : {}),
      },
      ...(values.date ? { created_at: values.date } : {}),
    } as ModifyBlog;

    await modify(blogId.value, body);
    router.push(ROUTES.stories.base);
  } catch {
    apiError.value = t("admin.blogs.saveError");
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
            {{ t("admin.blogs.edit") }}
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

    <!-- ── Content ────────────────────────────────────────────────────────── -->
    <div class="container mx-auto px-4 max-w-3xl py-10">
      <!-- Loading skeleton -->
      <template v-if="pending">
        <div
          class="bg-card border border-card-border rounded-xl p-6 sm:p-8 space-y-5"
        >
          <div class="h-4 w-24 bg-muted animate-pulse rounded" />
          <div class="h-10 bg-muted animate-pulse rounded-md" />
          <div class="h-4 w-24 bg-muted animate-pulse rounded" />
          <div class="h-10 bg-muted animate-pulse rounded-md" />
          <div class="h-4 w-24 bg-muted animate-pulse rounded" />
          <div class="h-36 bg-muted animate-pulse rounded-md" />
        </div>
      </template>

      <!-- Fetch error / not found -->
      <div v-else-if="fetchError || !blog" class="py-24 text-center space-y-2">
        <p
          class="font-brand font-black text-3xl uppercase italic tracking-tighter text-muted-foreground/30"
        >
          {{ t("admin.blogs.notFound") }}
        </p>
        <NuxtLink :to="ROUTES.stories.base">
          <button type="button" class="btn-outline mt-6">
            {{ t("admin.back") }}
          </button>
        </NuxtLink>
      </div>

      <!-- Form -->
      <div
        v-else
        class="bg-card border border-card-border rounded-xl p-6 sm:p-8"
      >
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
          :initial-values="initialValues"
          :loading="loading"
          :submit-label="t('admin.blogs.saveBtn')"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

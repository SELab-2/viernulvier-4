<!--
  components/admin/blogs/AdminBlogForm.vue
  ==========================================
  Shared form for creating and editing a blog/story.

  Props:
  - initialValues: pre-fills the form (used by the edit page, arrives async).
  - loading: disables the submit button while the API call is in-flight.
  - submitLabel: overrides the default button label.

  Emits:
  - submit(values: BlogFormValues): called when the form passes validation.

  The parent is responsible for calling the correct API method (create / modify)
  and navigating away after success.
-->
<script lang="ts" setup>
export interface BlogFormValues {
  titleNl: string;
  titleEn: string;
  descriptionNl: string;
  descriptionEn: string;
  /** ISO date string, e.g. "2024-03-15" */
  date: string;
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<BlogFormValues>;
    loading?: boolean;
    submitLabel?: string;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  (e: "submit", values: BlogFormValues): void;
}>();

const { t } = useI18n();

// ─── Form state ───────────────────────────────────────────────────────────────
const form = reactive<BlogFormValues>({
  titleNl: props.initialValues?.titleNl ?? "",
  titleEn: props.initialValues?.titleEn ?? "",
  descriptionNl: props.initialValues?.descriptionNl ?? "",
  descriptionEn: props.initialValues?.descriptionEn ?? "",
  date: props.initialValues?.date ?? "",
});

// Sync when initialValues arrive asynchronously (edit page fetches blog first)
watch(
  () => props.initialValues,
  (v) => {
    if (!v) return;
    Object.assign(form, v);
  },
  { deep: true },
);

// ─── Tabs (NL / EN) ───────────────────────────────────────────────────────────
const activeTab = ref<"nl" | "en">("nl");

// ─── Validation ───────────────────────────────────────────────────────────────
const touched = ref(false);
const errors = computed(() => ({
  titleNl:
    touched.value && !form.titleNl.trim()
      ? t("admin.blogs.validation.titleNlRequired")
      : null,
  descriptionNl:
    touched.value && !form.descriptionNl.trim()
      ? t("admin.blogs.validation.descriptionNlRequired")
      : null,
  date:
    touched.value && !form.date
      ? t("admin.blogs.validation.dateRequired")
      : null,
}));

const hasErrors = computed(() => Object.values(errors.value).some(Boolean));

function handleSubmit() {
  touched.value = true;
  if (hasErrors.value) return;
  emit("submit", { ...form });
}
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- ── Date (always visible) ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-2">
      <label for="blog-date" class="section-label">
        {{ t("admin.blogs.date") }}
        <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <input
        id="blog-date"
        v-model="form.date"
        type="date"
        class="h-10 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow w-max"
        :class="errors.date ? 'border-rose-400' : 'border-border'"
      />
      <p v-if="errors.date" class="text-xs text-rose-500">{{ errors.date }}</p>
    </div>

    <!-- ── Language tabs ──────────────────────────────────────────────────── -->
    <div>
      <!-- Tab row -->
      <div class="flex border-b border-border mb-6">
        <button
          v-for="lang in ['nl', 'en'] as const"
          :key="lang"
          type="button"
          :class="[
            'px-5 py-2.5 font-brand font-black text-[10px] uppercase tracking-widest transition-colors',
            activeTab === lang
              ? 'text-[var(--blog-purple-strong)] border-b-2 border-[var(--blog-purple-strong)] -mb-px bg-[var(--blog-purple-ghost)]'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = lang"
        >
          {{ lang.toUpperCase() }}

          <!-- Indicator dot when required field is empty in this tab -->
          <span
            v-if="
              lang === 'nl' &&
              touched &&
              (errors.titleNl || errors.descriptionNl)
            "
            class="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-1.5 mb-0.5"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- NL fields -->
      <div v-show="activeTab === 'nl'" class="space-y-6">
        <div class="flex flex-col gap-2">
          <label for="title-nl" class="section-label">
            {{ t("admin.blogs.titleNl") }}
            <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
          </label>
          <input
            id="title-nl"
            v-model="form.titleNl"
            type="text"
            class="h-10 px-3 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
            :class="errors.titleNl ? 'border-rose-400' : 'border-border'"
            :placeholder="t('admin.blogs.titleNlPlaceholder')"
          />
          <p v-if="errors.titleNl" class="text-xs text-rose-500">
            {{ errors.titleNl }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="description-nl" class="section-label">
            {{ t("admin.blogs.descriptionNl") }}
            <span class="text-rose-500 ml-0.5" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description-nl"
            v-model="form.descriptionNl"
            rows="7"
            class="px-3 py-2.5 rounded-md border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y transition-shadow leading-relaxed"
            :class="errors.descriptionNl ? 'border-rose-400' : 'border-border'"
            :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
          />
          <p v-if="errors.descriptionNl" class="text-xs text-rose-500">
            {{ errors.descriptionNl }}
          </p>
        </div>
      </div>

      <!-- EN fields -->
      <div v-show="activeTab === 'en'" class="space-y-6">
        <div class="flex flex-col gap-2">
          <label for="title-en" class="section-label">
            {{ t("admin.blogs.titleEn") }}
          </label>
          <input
            id="title-en"
            v-model="form.titleEn"
            type="text"
            class="h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
            :placeholder="t('admin.blogs.titleEnPlaceholder')"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="description-en" class="section-label">
            {{ t("admin.blogs.descriptionEn") }}
          </label>
          <textarea
            id="description-en"
            v-model="form.descriptionEn"
            rows="7"
            class="px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y transition-shadow leading-relaxed"
            :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
          />
        </div>
      </div>
    </div>

    <!-- ── Submit ─────────────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-end gap-3 pt-2 border-t border-border"
    >
      <slot name="actions" />
      <button
        type="submit"
        class="btn-outline flex items-center gap-2"
        :disabled="loading"
        :aria-busy="loading"
      >
        <svg
          v-if="loading"
          class="w-3.5 h-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        {{ loading ? t("admin.saving") : (submitLabel ?? t("admin.save")) }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.section-label {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}
</style>

<!--
  components/admin/blogs/Form.vue
  Bilingual Blog Form.

  Renders title (textarea) and description (AdminEditor) fields for both NL
  and EN. Navigation (back, restore, step transitions) is the responsibility
  of the parent page — this component only emits `submit` and `preview-update`.
-->
<script setup lang="ts">
import type { CreateBlog, ModifyBlog } from "@repo/common";

interface LocalizedPair {
  nl: string;
  en: string;
}
interface InitialData {
  titel?: LocalizedPair;
  description?: LocalizedPair;
}

const props = withDefaults(
  defineProps<{
    initialData?: InitialData;
    loading?: boolean;
    mode?: "create" | "edit";
  }>(),
  { mode: "create", loading: false },
);

const emit = defineEmits<{
  (e: "submit", data: CreateBlog | ModifyBlog): void;
  (
    e: "preview-update",
    data: { titel: LocalizedPair; description: LocalizedPair },
  ): void;
}>();

const { t } = useI18n();

const titelNl = ref("");
const titelEn = ref("");
const descriptionNl = ref("");
const descriptionEn = ref("");

watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    titelNl.value = data.titel?.nl ?? "";
    titelEn.value = data.titel?.en ?? "";
    descriptionNl.value = data.description?.nl ?? "";
    descriptionEn.value = data.description?.en ?? "";
  },
  { immediate: true },
);

watch([titelNl, titelEn, descriptionNl, descriptionEn], () => {
  emit("preview-update", {
    titel: { nl: titelNl.value, en: titelEn.value },
    description: { nl: descriptionNl.value, en: descriptionEn.value },
  });
});

const isValid = computed(
  () =>
    titelNl.value.trim().length > 0 && descriptionNl.value.trim().length > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;
  emit("submit", {
    titel: {
      nl: titelNl.value.trim(),
      en: titelEn.value.trim() || titelNl.value.trim(),
    },
    description: {
      nl: descriptionNl.value.trim(),
      en: descriptionEn.value.trim() || descriptionNl.value.trim(),
    },
  });
}

const titleTextareaCls = [
  "w-full px-4 py-3",
  "min-h-[72px] max-h-[140px]",
  "bg-muted border border-border rounded-lg",
  "text-sm text-foreground",
  "outline-none transition-colors duration-150",
  "hover:border-foreground/20 hover:bg-muted/70",
  "focus:border-foreground/30 focus:bg-background",
  "placeholder:text-muted-foreground",
  "resize-none overflow-y-auto",
  "[text-transform:none]",
  "leading-snug",
].join(" ");

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2";

const sectionCls =
  "bg-card border border-card-border rounded-xl overflow-hidden";
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- ── Titles ─────────────────────────────────────────────────── -->
    <section :class="sectionCls">
      <div
        class="flex items-center gap-3 px-5 py-3 border-b border-card-border bg-card-hover"
      >
        <div class="w-1 h-5 rounded-full bg-accent shrink-0" />
        <h2
          class="font-brand font-black text-[11px] uppercase tracking-widest text-foreground"
        >
          {{ t("admin.blogs.sectionTitle") }}
        </h2>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label :class="labelCls">
            {{ t("admin.blogs.titleNl") }}
            <span class="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            v-model="titelNl"
            :class="titleTextareaCls"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('admin.blogs.titleNlPlaceholder')"
            required
          />
        </div>

        <div>
          <label :class="labelCls">{{ t("admin.blogs.titleEn") }}</label>
          <textarea
            v-model="titelEn"
            :class="titleTextareaCls"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('admin.blogs.titleEnPlaceholder')"
          />
          <p class="mt-1.5 text-[9px] text-muted-foreground/60">
            {{ t("admin.blogs.titleEnFallback") }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Content ────────────────────────────────────────────────── -->
    <section :class="sectionCls">
      <div
        class="flex items-center gap-3 px-5 py-3 border-b border-card-border bg-card-hover"
      >
        <div class="w-1 h-5 rounded-full bg-accent shrink-0" />
        <h2
          class="font-brand font-black text-[11px] uppercase tracking-widest text-foreground"
        >
          {{ t("admin.blogs.sectionContent") }}
        </h2>
      </div>

      <div class="p-5 space-y-5">
        <div>
          <label :class="labelCls">
            {{ t("admin.blogs.descriptionNl") }}
            <span class="text-red-500 ml-0.5">*</span>
          </label>
          <AdminEditor
            v-model="descriptionNl"
            :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
          />
        </div>

        <div>
          <label :class="labelCls">{{ t("admin.blogs.descriptionEn") }}</label>
          <AdminEditor
            v-model="descriptionEn"
            :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
          />
          <p class="mt-1.5 text-[9px] text-muted-foreground/60">
            {{ t("admin.blogs.descriptionEnFallback") }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Save button ────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3 pt-1">
      <p
        v-if="!isValid"
        class="text-[10px] text-muted-foreground/60 font-brand font-black uppercase tracking-widest"
      >
        {{ t("admin.blogs.validation.titleNlRequired") }}
      </p>

      <button
        type="submit"
        :disabled="!isValid || loading"
        class="ml-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
      >
        <svg
          v-if="loading"
          class="w-3.5 h-3.5 animate-spin shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg
          v-else
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span v-if="loading">{{ t("admin.saving") }}</span>
        <span v-else-if="mode === 'create'">{{
          t("admin.blogs.createBtn")
        }}</span>
        <span v-else>{{ t("admin.blogs.saveBtn") }}</span>
      </button>
    </div>
  </form>
</template>

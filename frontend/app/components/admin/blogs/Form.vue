<!--
  components/admin/blogs/Form.vue
  Bilingual Blog Form — used identically by create.vue and edit/[id].vue.

  Fixes:
  - Title inputs use plain text styling (text-sm, no uppercase CSS transform).
    The uppercase CSS transform on inputs causes cursor / backspace issues in
    some browsers because the displayed length differs from the raw value length
    at certain Unicode boundary positions. Plain text-sm avoids this entirely.
  - h-12 on both title inputs and action buttons matches the SearchBar height
    used on archive / stories / prints pages.
  - No event handlers on the title inputs beyond v-model — nothing intercepts
    Backspace, Delete, or arrow keys.
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
  (e: "cancel"): void;
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

// Emit live preview on every keystroke
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

/*
  inputCls — intentionally uses text-sm and NO uppercase / text-transform.
  CSS text-transform on <input> elements can break backspace / cursor
  positioning in Firefox and Safari when the visible (transformed) text
  length differs from the underlying value length.
  h-12 (48 px) matches SearchBar height used on archive / stories / prints.
*/
const inputCls = [
  "w-full px-4 py-3",
  "h-12",
  "bg-muted border border-border rounded-lg",
  "text-sm text-foreground",
  "outline-none transition-colors duration-150",
  "hover:border-foreground/20 hover:bg-muted/70",
  "focus:border-foreground/30 focus:bg-background",
  "placeholder:text-muted-foreground",
  "[text-transform:none]",
  "[appearance:none]",
  "[-webkit-appearance:none]",
].join(" ");

const labelCls =
  "block text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2";
const sectionCls = "bg-card border border-card-border rounded-xl p-6 space-y-5";
const headingCls =
  "font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground pb-2 border-b border-border";
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- ── Titles ──────────────────────────────────────────────────────────── -->
    <section :class="sectionCls">
      <h2 :class="headingCls">{{ t("admin.blogs.sectionTitle") }}</h2>

      <!-- NL — required -->
      <div>
        <label :class="labelCls">
          {{ t("admin.blogs.titleNl") }} <span class="text-red-500">*</span>
        </label>
        <!--
          min-w-0 prevents the input from overflowing its grid/flex column.
          The browser natively shows "…" when the value is wider than the field.
          No keydown handlers — Backspace, Delete, arrows all work as normal.
        -->
        <div class="min-w-0">
          <input
            v-model="titelNl"
            :class="inputCls"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('admin.blogs.titleNlPlaceholder')"
            required
          />
        </div>
      </div>

      <!-- EN — optional, falls back to NL on save -->
      <div>
        <label :class="labelCls">{{ t("admin.blogs.titleEn") }}</label>
        <div class="min-w-0">
          <input
            v-model="titelEn"
            :class="inputCls"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('admin.blogs.titleEnPlaceholder')"
          />
        </div>
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.titleEnFallback") }}
        </p>
      </div>
    </section>

    <!-- ── Content ─────────────────────────────────────────────────────────── -->
    <!--
      AdminEditor (Editor.vue) now handles scrolling internally:
      EditorContent has max-h-[360px] overflow-y-auto so the toolbar stays
      pinned at the top while long content scrolls below it.
      TipTap's ProseMirror handles all keyboard events within the editor
      natively — Backspace, Delete, arrow keys all work as expected.
    -->
    <section :class="sectionCls">
      <h2 :class="headingCls">{{ t("admin.blogs.sectionContent") }}</h2>

      <!-- NL — required -->
      <div>
        <label :class="labelCls">
          {{ t("admin.blogs.descriptionNl") }}
          <span class="text-red-500">*</span>
        </label>
        <AdminEditor
          v-model="descriptionNl"
          :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
        />
      </div>

      <!-- EN — optional -->
      <div>
        <label :class="labelCls">{{ t("admin.blogs.descriptionEn") }}</label>
        <AdminEditor
          v-model="descriptionEn"
          :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
        />
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.descriptionEnFallback") }}
        </p>
      </div>
    </section>

    <!-- ── Actions ─────────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-3">
      <button
        type="submit"
        :disabled="!isValid || loading"
        class="btn-outline flex-1 justify-center h-12 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ t("admin.saving") }}</span>
        <span v-else-if="mode === 'create'">{{
          t("admin.blogs.createBtn")
        }}</span>
        <span v-else>{{ t("admin.blogs.saveBtn") }}</span>
      </button>

      <button
        type="button"
        class="btn-outline px-8 h-12 shrink-0"
        @click="emit('cancel')"
      >
        {{ t("admin.cancel") }}
      </button>
    </div>
  </form>
</template>

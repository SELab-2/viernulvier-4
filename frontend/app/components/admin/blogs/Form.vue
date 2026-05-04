<!--
  components/admin/blogs/Form.vue
  
  Bilingual Blog Form Component

  Uses the shared BaseForm + field components from app/components/form/
  to avoid code duplication with other admin forms.

  Supports both "create" and "edit" modes:
  - In create mode: "Next — Add images →" button
  - In edit mode: "Save Changes" button

  Emits:
  - submit: CreateBlog | ModifyBlog
  - cancel
  - preview-update: live preview data on every keystroke
-->
<script setup lang="ts">
import type { CreateBlog, ModifyBlog } from "@repo/common";
import type { FormField } from "../../../types/FormField";

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

// Internal reactive state (not tied to BaseForm directly, since we need
// bilingual fields and a rich-text editor which BaseForm doesn't support natively)
const titelNl = ref("");
const titelEn = ref("");
const descriptionNl = ref("");
const descriptionEn = ref("");

// Seed from initialData when editing
watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    titelNl.value = data.titel?.nl ?? "";
    titelEn.value = data.titel?.en ?? "";
    descriptionNl.value = data.description?.nl ?? "";
    descriptionEn.value = data.description?.en ?? "";
  },
  { immediate: true, deep: true },
);

// Emit preview on every change
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
  } as CreateBlog);
}

const inputClass =
  "w-full px-4 py-3 bg-muted border border-border text-sm rounded-lg outline-none transition-colors duration-150 hover:border-foreground/20 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground resize-none";
const labelClass =
  "block text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2";
const sectionClass =
  "bg-card border border-card-border rounded-xl p-6 space-y-5";
const sectionHeadingClass =
  "font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground pb-1 border-b border-border";
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Title section -->
    <section :class="sectionClass">
      <h2 :class="sectionHeadingClass">{{ t("admin.blogs.sectionTitle") }}</h2>

      <!-- NL title — required -->
      <div>
        <label :class="labelClass">
          {{ t("admin.blogs.titleNl") }} <span class="text-red-500">*</span>
        </label>
        <input
          v-model="titelNl"
          :class="inputClass"
          type="text"
          :placeholder="t('admin.blogs.titleNlPlaceholder')"
          required
        />
      </div>

      <!-- EN title — optional -->
      <div>
        <label :class="labelClass">{{ t("admin.blogs.titleEn") }}</label>
        <input
          v-model="titelEn"
          :class="inputClass"
          type="text"
          :placeholder="t('admin.blogs.titleEnPlaceholder')"
        />
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.titleEnFallback") }}
        </p>
      </div>
    </section>

    <!-- Content / description section -->
    <!--
      NOTE: We intentionally do NOT use BaseForm / BaseTextArea here because
      the description fields require the rich-text TipTap editor (AdminEditor),
      which is incompatible with the generic BaseForm field system.
      The title fields above are plain text and could use BaseInput, but keeping
      them inline avoids an extra layer of indirection for a two-field form.
    -->
    <section :class="sectionClass">
      <h2 :class="sectionHeadingClass">
        {{ t("admin.blogs.sectionContent") }}
      </h2>

      <!-- NL description — required -->
      <div>
        <label :class="labelClass">
          {{ t("admin.blogs.descriptionNl") }}
          <span class="text-red-500">*</span>
        </label>
        <AdminEditor
          v-model="descriptionNl"
          :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
        />
      </div>

      <!-- EN description — optional -->
      <div>
        <label :class="labelClass">{{ t("admin.blogs.descriptionEn") }}</label>
        <AdminEditor
          v-model="descriptionEn"
          :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
        />
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.descriptionEnFallback") }}
        </p>
      </div>
    </section>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button
        type="submit"
        :disabled="!isValid || loading"
        class="btn-outline flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ t("admin.saving") }}</span>
        <span v-else-if="mode === 'create'">{{
          t("admin.blogs.nextBtn")
        }}</span>
        <span v-else>{{ t("admin.blogs.saveBtn") }}</span>
      </button>

      <button
        type="button"
        class="btn-outline px-8 shrink-0"
        @click="emit('cancel')"
      >
        {{ t("admin.cancel") }}
      </button>
    </div>
  </form>
</template>

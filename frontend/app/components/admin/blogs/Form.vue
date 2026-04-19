<!--
  components/admin/blogs/Form.vue
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
}>();

const { t } = useI18n();

const form = reactive<{ titel: LocalizedPair; description: LocalizedPair }>({
  titel: { nl: "", en: "" },
  description: { nl: "", en: "" },
});

watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    form.titel.nl = data.titel?.nl ?? "";
    form.titel.en = data.titel?.en ?? "";
    form.description.nl = data.description?.nl ?? "";
    form.description.en = data.description?.en ?? "";
  },
  { immediate: true, deep: true },
);

const isValid = computed(
  () =>
    form.titel.nl.trim().length > 0 && form.description.nl.trim().length > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;
  emit("submit", {
    titel: {
      nl: form.titel.nl.trim(),
      en: form.titel.en.trim() || form.titel.nl.trim(),
    },
    description: {
      nl: form.description.nl.trim(),
      en: form.description.en.trim() || form.description.nl.trim(),
    },
  });
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
    <section :class="sectionClass">
      <h2 :class="sectionHeadingClass">{{ t("admin.blogs.sectionTitle") }}</h2>

      <div>
        <label :class="labelClass">
          {{ t("admin.blogs.titleNl") }} <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.titel.nl"
          :class="inputClass"
          type="text"
          :placeholder="t('admin.blogs.titleNlPlaceholder')"
          required
        />
      </div>

      <div>
        <label :class="labelClass">{{ t("admin.blogs.titleEn") }}</label>
        <input
          v-model="form.titel.en"
          :class="inputClass"
          type="text"
          :placeholder="t('admin.blogs.titleEnPlaceholder')"
        />
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.titleEnFallback") }}
        </p>
      </div>
    </section>

    <section :class="sectionClass">
      <h2 :class="sectionHeadingClass">
        {{ t("admin.blogs.sectionContent") }}
      </h2>

      <div>
        <label :class="labelClass">
          {{ t("admin.blogs.descriptionNl") }}
          <span class="text-red-500">*</span>
        </label>
        <AdminEditor
          v-model="form.description.nl"
          :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
        />
      </div>

      <div>
        <label :class="labelClass">{{ t("admin.blogs.descriptionEn") }}</label>
        <AdminEditor
          v-model="form.description.en"
          :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
        />
        <p class="mt-1.5 text-[10px] text-muted-foreground/60">
          {{ t("admin.blogs.descriptionEnFallback") }}
        </p>
      </div>
    </section>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        :disabled="!isValid || loading"
        class="btn-outline flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ t("admin.saving") }}</span>
        <span v-else-if="mode === 'create'">{{
          t("admin.blogs.createBtn")
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

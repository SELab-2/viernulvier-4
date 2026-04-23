<!--
  pages/admin/prints/create.vue

  Admin Print Create Page

  Key features include:
  - Dutch title input, English title input with fallback on Dutch
  - Print type selection
  - File upload required (pdf, png, jpg, webp)

  On submission:
  - A new print entry is created via the API
  - The user is redirected to the admin prints page

  The page coordinates:
  - Form state and submission handling
  - Navigation and error display

-->

<script setup lang="ts">
import type { FormField } from "../../../types/FormField";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { useStorageApi } from "../../../composables/media/useStorageApi";
import { PrintTypeValues } from "@repo/common";

const { t } = useI18n();
const { create } = usePrintApi();
const { saveMedia } = useStorageApi();

const loading = ref(false); // true while the form is being submitted
const error = ref<string | null>(null); // holds error message (to display in case of error)

const fields = computed<FormField[]>(() => [
  // Contains all separate input components
  {
    component: "BaseInput", // Dutch title
    name: "titel_nl",
    props: { label: t("prints.form.title") + " (nl)", required: true },
  },
  {
    component: "BaseInput", // English title
    name: "titel_en",
    props: { label: t("prints.form.title") + " (en)" },
  },
  {
    component: "BaseSelect", // Print type
    name: "print_type",
    props: {
      label: t("prints.form.type"),
      required: true,
      options: PrintTypeValues.map((type) => ({
        label: t(`prints.types.${type}`),
        value: type,
      })),
    },
  },
  {
    component: "BaseFileUpload", // Image
    name: "file",
    props: {
      label: t("prints.form.file"),
      accept: ".pdf,.png,.jpg,.jpeg,.webp",
    },
  },
]);

async function handleSubmit(form: Record<string, any>) {
  loading.value = true;
  error.value = null;
  try {
    const file: File | null = form.file?.length ? form.file[0] : null;
    if (!file) {
      error.value = t("prints.form.fileRequired");
      return;
    }

    const storagePath = `/prints/${Date.now()}-${file.name}`; // Saving in storage first
    const uploadResult = await saveMedia(storagePath, file);
    if (uploadResult.error) {
      error.value = t("prints.form.uploadError");
      return;
    }
    const url = uploadResult.data; // Retrieving url
    if (!url) {
      error.value = t("prints.form.uploadError");
      return;
    }

    await create({
      titel: { nl: form.titel_nl, en: form.titel_en ?? form.titel_nl }, // Fallback on Dutch
      description: { nl: "", en: "" },
      print_type: form.print_type,
      url,
    });

    await navigateTo(ROUTES.admin.prints.base);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto px-4 max-w-5xl py-6">
    <div class="flex items-center gap-3 mb-6">
      <!-- Back button -->
      <NuxtLink
        :to="ROUTES.admin.prints.base"
        class="btn-outline h-9 flex items-center text-[11px] font-black uppercase tracking-widest"
      >
        ←
      </NuxtLink>
      <!-- Title -->
      <h1 class="font-brand font-black text-2xl uppercase tracking-tighter">
        Upload
      </h1>
    </div>

    <!-- Error display -->
    <p
      v-if="error"
      class="text-red-400 text-[11px] font-bold uppercase tracking-widest mb-4"
    >
      {{ error }}
    </p>

    <!-- Form -->
    <FormBaseForm :fields="fields" @submit="handleSubmit" />
  </div>
</template>

<style scoped></style>

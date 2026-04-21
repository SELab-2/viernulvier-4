<script setup lang="ts">
import type { FormField } from "../../../types/FormField";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { useStorageApi } from "../../../composables/media/useStorageApi";
import { PrintTypeValues } from "@repo/common";

const { t } = useI18n();
const { create } = usePrintApi();
const { saveMedia } = useStorageApi();

const loading = ref(false);
const error = ref<string | null>(null);

const fields = computed<FormField[]>(() => [
  {
    component: "BaseInput",
    name: "titel_nl",
    props: { label: t("prints.form.title") + " (nl)", required: true },
  },
  {
    component: "BaseInput",
    name: "titel_en",
    props: { label: t("prints.form.title") + " (en)" },
  },
  {
    component: "BaseSelect",
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
    component: "BaseFileUpload",
    name: "file",
    props: {
      label: t("prints.form.file"),
      accept: ".pdf,.png,.jpg,.jpeg",
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

    const fileName = `/prints/${Date.now()}-${file.name}`;
    const uploadResult = await saveMedia(fileName, file);
    if (uploadResult.error) {
      error.value = t("prints.form.uploadError");
      return;
    }
    const url = uploadResult.data;
    if (!url) {
      error.value = t("prints.form.uploadError");
      return;
    }

    await create({
      titel: { nl: form.titel_nl, en: form.titel_en ?? form.titel_nl },
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
      <NuxtLink
        :to="ROUTES.admin.prints.base"
        class="btn-outline h-9 flex items-center text-[11px] font-black uppercase tracking-widest"
      >
        ←
      </NuxtLink>
      <h1 class="font-brand font-black text-2xl uppercase tracking-tighter">
        Upload
      </h1>
    </div>

    <p
      v-if="error"
      class="text-red-400 text-[11px] font-bold uppercase tracking-widest mb-4"
    >
      {{ error }}
    </p>

    <FormBaseForm :fields="fields" @submit="handleSubmit" />
  </div>
</template>

<style scoped></style>

<!--
  pages/admin/prints/edit/[id].vue

  Admin Print Edit Page

  Key features include:
  - Dutch title input, English title input with fallback on Dutch
  - Dutch description input, English description input with fallback on Dutch
  - Print type selection
  - File upload required (pdf, png, jpg, webp)

  On submission:
  - An existing print entry will be modified via the API
  - The user is redirected to the admin prints page

  The page coordinates:
  - Form state and submission handling
  - Navigation and error display

-->

<script setup lang="ts">
import type { PrintItemView } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import type { FormField } from "../../../../types/FormField";
import { usePrintApi } from "../../../../composables/media/usePrintApi";
import { useStorageApi } from "../../../../composables/media/useStorageApi";

const route = useRoute();
const { t } = useI18n();
const { getById, modify } = usePrintApi();
const { saveMedia } = useStorageApi();

// Resolved print ID from the route
const printId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// State
const print = ref<PrintItemView | null>(null);
const fetching = ref(false); // true while loading existing print data
const loading = ref(false); // true while the form is being submitted
const error = ref<string | null>(null); // holds error message (to display in case of error)
const saved = ref(false);
const titel = computed(
  () => print.value?.titel as { nl: string; en: string } | undefined,
);
const description = computed(
  () => print.value?.description as { nl: string; en: string } | undefined,
);

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
    component: "BaseTextArea", // Dutch description
    name: "description_nl",
    props: { label: t("prints.form.description") + " (nl)", required: true },
  },
  {
    component: "BaseTextArea", // English description
    name: "description_en",
    props: { label: t("prints.form.description") + " (en)" },
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

// Print data
async function loadPrint() {
  if (!printId.value) return;
  fetching.value = true;
  error.value = null;
  try {
    const resp = await getById(printId.value);
    print.value = resp.data as PrintItemView;
  } catch {
    error.value = t("admin.form.loadError");
  } finally {
    fetching.value = false;
  }
}

// Save
async function handleSubmit(form: Record<string, any>) {
  if (!printId.value || !print.value) return;
  loading.value = true;
  saved.value = false;
  error.value = null;
  try {
    const file: File | null = form.file?.length ? form.file[0] : null;
    let url = print.value.url; // reuse existing url by default

    if (!file) {
      error.value = t("prints.form.fileRequired");
      return;
    }

    if (file) {
      const storagePath = `/prints/${Date.now()}-${file.name}`; // Saving in storage first
      const uploadResult = await saveMedia(storagePath, file);
      if (uploadResult.error) {
        error.value = t("prints.form.uploadError");
        return;
      }
      if (uploadResult.error || !uploadResult.data) {
        error.value = t("prints.form.uploadError");
        return;
      }
      url = uploadResult.data; // Retrieving url
    }

    if (!url) {
      error.value = t("prints.form.uploadError");
      return;
    }

    await modify(printId.value, {
      titel: { nl: form.titel_nl, en: form.titel_en ?? form.titel_nl }, // Fallback on Dutch
      description: { nl: "", en: "" },
      print_type: form.print_type,
      url,
    });

    saved.value = true;
    await navigateTo(ROUTES.admin.prints.base);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadPrint);
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
    <FormBaseForm
      v-if="print"
      :fields="fields"
      @submit="handleSubmit"
      :initial-values="{
        titel_nl: titel?.nl,
        titel_en: titel?.en,
        description_nl: description?.nl,
        description_en: description?.en,
        print_type: print.print_type,
      }"
    />
  </div>
</template>

<style scoped></style>

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
const { saveMedia, deleteMedia } = useStorageApi();

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
    props: { label: t("prints.form.description") + " (nl)" },
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
      required: true,
      accept: ".pdf,.png,.jpg,.jpeg,.webp",
      existingUrl: print.value?.url,
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

    if (!file && !url) {
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
      description: {
        nl: form.description_nl,
        en: form.description_en ?? form.description_nl,
      }, // Fallback on Dutch
      print_type: form.print_type,
      url,
    });

    if (url !== print.value.url) {
      // Remove original image if replaced
      await deleteMedia(print.value.url);
    }

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
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <!-- Back link -->
      <NuxtLink
        :to="ROUTES.admin.prints.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t("admin.back") }}
      </NuxtLink>

      <!-- Title row -->
      <div class="flex items-center gap-3 flex-wrap">
        <h1
          class="font-brand font-black text-3xl uppercase tracking-tight text-foreground flex-1"
        >
          {{ t("prints.edit") }}
        </h1>

        <!-- Saved feedback badge -->
        <Transition name="fade">
          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ t("admin.saved") }}
          </span>
        </Transition>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <div class="min-h-[720px]">
        <div v-if="fetching" class="flex flex-col gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="h-10 rounded-md bg-muted animate-pulse"
          />
        </div>

        <FormBaseForm
          v-else-if="print"
          :fields="fields"
          :submit-label="t('prints.form.edit')"
          :reset-label="t('prints.form.reset')"
          @submit="handleSubmit"
          :initial-values="{
            titel_nl: titel?.nl,
            titel_en: titel?.en,
            description_nl: description?.nl,
            description_en: description?.en,
            print_type: print.print_type,
          }"
        />

        <div
          v-else-if="!print && !fetching"
          class="py-16 text-center text-muted-foreground"
        >
          {{ t("admin.prints.notFound") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

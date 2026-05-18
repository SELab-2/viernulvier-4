<!--
  components/admin/prints/Form.vue

  Bilingual Print Form Component

  Uses the shared BaseForm + field components from app/components/form/
  to avoid code duplication with other admin forms.

  Supports both "create" and "edit" mode
-->

<script setup lang="ts">
import type { PrintItem } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import type { FormField } from "../../../types/FormField";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { useStorageApi } from "../../../composables/media/useStorageApi";

interface Props {
  mode: "create" | "edit";
}

const props = defineProps<Props>();
const route = useRoute();
const { t } = useI18n();
const { getById, modify, create } = usePrintApi();
const { saveMedia, deleteMedia } = useStorageApi();

// Resolved print ID from the route, this is only relevant for editing
const printId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// State
const print = ref<PrintItem | null>(null);
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
    print.value = resp.data;
  } catch {
    error.value = t("admin.form.loadError");
  } finally {
    fetching.value = false;
  }
}

// Save
async function handleSubmit(form: Record<string, any>) {
  loading.value = true;
  saved.value = false;
  error.value = null;
  try {
    const file: File | null = form.file?.length ? form.file[0] : null;
    if (props.mode === "create") {
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
        description: {
          nl: form.description_nl,
          en: form.description_en ?? form.description_nl,
        }, // Fallback on Dutch
        print_type: form.print_type,
        url,
      });
    } else {
      if (!printId.value || !print.value) return;
      let url = print.value.url; // reuse existing url by default

      if (!file && !url) {
        error.value = t("prints.form.fileRequired");
        return;
      }

      if (file) {
        const storagePath = `/prints/${Date.now()}-${file.name}`; // Saving in storage first
        const uploadResult = await saveMedia(storagePath, file);
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
    }

    await navigateTo(ROUTES.admin.prints.base);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (props.mode === "edit") await loadPrint();
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="page-container py-10 space-y-8">
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
          {{ mode === "edit" ? t("prints.edit") : t("prints.create") }}
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
        <!-- Minimum height so the footer doesn't jump -->
        <div v-if="fetching" class="flex flex-col gap-4">
          <!-- TODO possibly replaced by loading skeleton later on -->
          <div
            v-for="i in 6"
            :key="i"
            class="h-10 rounded-md bg-muted animate-pulse"
          />
        </div>

        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div class="space-y-6">
            <!-- Create form -->
            <FormBaseForm
              v-if="mode === 'create'"
              :fields="fields"
              :reset-label="t('prints.form.reset')"
              @submit="handleSubmit"
            />

            <!-- Edit form -->
            <FormBaseForm
              v-else-if="mode === 'edit' && print"
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
          </div>

          <!-- Production Linker -->
          <div class="space-y-6 xl:sticky xl:top-24">
            <AdminSharedProductionLinker :entity-id="printId" type="print" />
          </div>
        </div>

        <div
          v-if="mode === 'edit' && !print && !fetching"
          class="py-16 text-center text-muted-foreground"
        >
          {{ t("admin.prints.notFound") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

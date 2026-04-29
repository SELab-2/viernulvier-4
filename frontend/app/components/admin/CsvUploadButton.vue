<script setup lang="ts">
/**
 * CSV upload button for admin parser endpoints.
 *
 * Props:
 * - `target` (productions|events|tags|blogs|prices) — selects which parser endpoint to call.
 *
 * Usage:
 * <CsvUploadButton target="productions" />
 *
 * Shows localized success/error snackbars via `useSnackbar` and uses `useParserApi` to upload.
 */
import { computed, ref } from "vue";
import { Upload } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import type { ParserTarget } from "~/composables/useParserApi";

interface Props {
  target: ParserTarget;
}

const props = defineProps<Props>();

const { t } = useI18n();
const snackbar = useSnackbar();
const { uploadCsv } = useParserApi();

const inputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const targetLabel = computed(() => t(`admin.parser.targets.${props.target}`));
const buttonLabel = computed(() =>
  t("admin.parser.uploadCsv", {
    target: targetLabel.value,
  }),
);

// Formats the list of missing headers for display in the snackbar.
function formatMissingHeaders(errorData: unknown): string | null {
  if (!errorData || typeof errorData !== "object") {
    return null;
  }

  const missingHeaders = (errorData as { missingHeaders?: unknown })
    .missingHeaders;

  if (!Array.isArray(missingHeaders) || missingHeaders.length === 0) {
    return null;
  }

  return missingHeaders
    .filter((header): header is string => typeof header === "string")
    .join(", ");
}

function showSnackbar(type: "success" | "error", text: string) {
  snackbar.add({
    type,
    text,
  });
}

function openFilePicker() {
  if (isUploading.value) {
    return;
  }

  inputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file || isUploading.value) {
    return;
  }

  isUploading.value = true;

  try {
    const response = await uploadCsv(props.target, file);

    if (response.error) {
      const missingHeaders = formatMissingHeaders(response.errorData);
      const errorText =
        response.errorCode === "CSV_MISSING_HEADERS"
          ? t("admin.parser.headerError", {
              target: targetLabel.value,
              fields: missingHeaders ?? t("admin.parser.headerFallbackFields"),
            })
          : (response.error ??
            t("admin.parser.uploadError", {
              target: targetLabel.value,
            }));

      showSnackbar("error", errorText);
      return;
    }

    showSnackbar(
      "success",
      t("admin.parser.uploadSuccess", {
        target: targetLabel.value,
      }),
    );
  } catch (error) {
    showSnackbar(
      "error",
      error instanceof Error
        ? error.message
        : t("admin.parser.uploadError", {
            target: targetLabel.value,
          }),
    );
  } finally {
    input.value = "";
    isUploading.value = false;
  }
}
</script>

<template>
  <div class="rounded-xl border border-card-border bg-card p-6 shadow-sm">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-2">
        <p
          class="text-xs font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.parser.title") }}
        </p>
        <h2 class="text-lg font-bold text-card-foreground">
          {{ targetLabel }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ t("admin.parser.description") }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors duration-200 hover:border-foreground/30 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isUploading"
          @click="openFilePicker"
        >
          <Upload :size="14" />
          <span v-if="!isUploading">{{ buttonLabel }}</span>
          <span v-else>{{ t("admin.parser.uploading") }}</span>
        </button>

        <input
          ref="inputRef"
          class="hidden"
          type="file"
          accept=".csv,text/csv"
          @change="handleFileChange"
        />
      </div>
    </div>
  </div>
</template>

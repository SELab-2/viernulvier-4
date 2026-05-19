<script setup lang="ts">
/**
 * SeriesItemEditor.vue
 *
 * Editor UI for a single series item (existing or new).
 * - Edits localized titel and description (nl required, en optional).
 * - Emits a single "update" event with the updated series item (plain JS object).
 *
 * Design notes:
 * - The parent list (SeriesForm.vue) renders the item header / ID and the delete control.
 * - This component focuses only on editing localized fields and emitting changes.
 */

import { useI18n } from "vue-i18n";
import type {
  ExistingSeries,
  NewSeries,
} from "~/composables/productions/steps/productionSeries";

type SeriesItem = ExistingSeries | NewSeries;

const props = defineProps<{
  item: SeriesItem;
  index?: number;
}>();

// Emit a single updated item payload (mirrors EventItemEditor pattern).
const emit = defineEmits<{
  (e: "update", item: SeriesItem): void;
}>();

const { t } = useI18n();

/**
 * Create a plain (non-proxy) clone of the item so downstream consumers
 * receive a normal JS object (avoids proxy/structuredClone problems).
 */
function cloneSeriesItem(item: SeriesItem): SeriesItem {
  const copyLocalized = (src: { nl: string; en?: string | null }) => ({
    nl: String(src.nl ?? ""),
    en:
      src.en === undefined
        ? undefined
        : src.en === null
          ? null
          : String(src.en),
  });

  if (item.type === "existing") {
    return {
      type: "existing",
      id: Number(item.id),
      titel: copyLocalized(item.titel),
      description: copyLocalized(item.description),
    };
  }

  return {
    type: "new",
    titel: copyLocalized(item.titel),
    description: copyLocalized(item.description),
  };
}

/**
 * Update a nested localized field and emit the updated item.
 * Only 'titel' and 'description' are expected here.
 */
function updateField<K extends keyof SeriesItem & string>(
  field: K,
  locale: "nl" | "en",
  value: string,
) {
  const next = cloneSeriesItem(props.item);

  // both 'titel' and 'description' are localized objects
  const target = (next as unknown as Record<string, any>)[field] ?? {
    nl: "",
    en: undefined,
  };
  (next as unknown as Record<string, any>)[field] = {
    ...target,
    [locale]: value,
  };

  emit("update", next);
}
</script>

<template>
  <div class="border border-border rounded-xl p-4 bg-card">
    <!-- Inputs for localized fields. Parent handles label/display of item title/ID. -->
    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.form-title") }} (NL)
        </label>
        <input
          :value="props.item.titel.nl"
          class="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          @input="
            (e) =>
              updateField('titel', 'nl', (e.target as HTMLInputElement).value)
          "
        />
      </div>

      <div>
        <label
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.form-title") }} (EN)
        </label>
        <input
          :value="props.item.titel.en ?? ''"
          class="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          @input="
            (e) =>
              updateField('titel', 'en', (e.target as HTMLInputElement).value)
          "
        />
      </div>

      <div class="sm:col-span-2">
        <label
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.form-description") }}
          (NL)
        </label>
        <textarea
          :value="props.item.description.nl"
          rows="2"
          class="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          @input="
            (e) =>
              updateField(
                'description',
                'nl',
                (e.target as HTMLTextAreaElement).value,
              )
          "
        />
      </div>

      <div class="sm:col-span-2">
        <label
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.form-description") }}
          (EN)
        </label>
        <textarea
          :value="props.item.description.en ?? ''"
          rows="2"
          class="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          @input="
            (e) =>
              updateField(
                'description',
                'en',
                (e.target as HTMLTextAreaElement).value,
              )
          "
        />
      </div>
    </div>
  </div>
</template>

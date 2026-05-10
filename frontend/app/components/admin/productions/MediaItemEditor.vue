<!--
  components/admin/productions/MediaItemEditor.vue

  Renders the crop grid + metadata fields for a single MediaItemDraft.
  Purely display — all events bubble up to MediaForm.
-->
<script setup lang="ts">
import { ImagePlus, X } from "lucide-vue-next";
import type { CropName } from "@repo/common";
import type {
  MediaItemDraft,
  DraftCrop,
} from "~/composables/productions/steps/productionMedia";

type ActiveMediaItemDraft = Extract<MediaItemDraft, { crops: unknown }>;

defineProps<{
  item: ActiveMediaItemDraft;
  index: number;
  cropNames: readonly CropName[];
}>();

const emit = defineEmits<{
  fileInput: [cropName: CropName, event: Event];
  removeCrop: [cropName: CropName];
  updateTranslation: [
    locale: "nl" | "en",
    field: "title" | "description" | "credits",
    value: string,
  ];
  getPreview: [crop: DraftCrop];
}>();

const { t } = useI18n();

function previewUrl(crop: DraftCrop): string | null {
  if (crop.type === "existing") return crop.url;
  if (crop.type === "replaced") return URL.createObjectURL(crop.file);
  if (crop.type === "new") return URL.createObjectURL(crop.file);
  return null;
}

// Nicer label for each crop slot
const cropLabels: Record<CropName, string> = {
  hd_ready: "HD Ready",
  hd_ready_square: "HD Square",
  hd_ready_portrait: "HD Portrait",
  FE3_header: "Header",
  FE3_2by1: "2×1",
  FE3_grid: "Grid",
};
</script>

<template>
  <div class="space-y-6">
    <!-- ── Crop grid ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div v-for="cropName in cropNames" :key="cropName" class="group relative">
        <p
          class="mb-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ cropLabels[cropName] }}
        </p>

        <!-- Filled slot -->
        <div
          v-if="item.crops[cropName].type !== 'empty'"
          class="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
        >
          <img
            v-if="previewUrl(item.crops[cropName])"
            :src="previewUrl(item.crops[cropName])!"
            class="h-full w-full object-cover"
            alt=""
          />

          <!-- Badge for pending state -->
          <div
            v-if="
              item.crops[cropName].type === 'new' ||
              item.crops[cropName].type === 'replaced'
            "
            class="absolute top-1.5 left-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent-foreground"
          >
            {{
              item.crops[cropName].type === "new"
                ? t("admin.productions.media.new", "New")
                : t("admin.productions.media.replaced", "Replaced")
            }}
          </div>

          <!-- Remove button -->
          <button
            class="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
            @click.prevent="emit('removeCrop', cropName)"
          >
            <X :size="9" stroke-width="3" />
          </button>

          <!-- Re-upload overlay -->
          <label
            class="absolute inset-0 flex cursor-pointer items-end justify-center pb-2 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span
              class="rounded-md bg-foreground px-2 py-1 text-[8px] font-black uppercase tracking-widest text-background"
            >
              {{ t("admin.productions.media.replace", "Replace") }}
            </span>
            <input
              type="file"
              accept="image/*"
              class="sr-only"
              @change="emit('fileInput', cropName, $event)"
            />
          </label>
        </div>

        <!-- Empty slot -->
        <label
          v-else
          class="group/upload flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted hover:border-accent hover:bg-card-hover transition-colors"
        >
          <ImagePlus
            :size="16"
            class="text-muted-foreground transition-colors group-hover/upload:text-accent"
          />
          <span
            class="mt-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground transition-colors group-hover/upload:text-accent"
          >
            {{ t("admin.productions.media.upload", "Upload") }}
          </span>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="emit('fileInput', cropName, $event)"
          />
        </label>
      </div>
    </div>

    <!-- ── Metadata ───────────────────────────────────────────────────────── -->
    <div
      class="grid grid-cols-1 gap-4 border-t border-border pt-2 sm:grid-cols-2"
    >
      <template v-for="locale in ['nl', 'en'] as const" :key="locale">
        <div class="space-y-3">
          <p
            class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ locale.toUpperCase() }}
            <span
              v-if="locale === 'en'"
              class="font-medium normal-case tracking-normal text-muted-foreground"
            >
              — {{ t("admin.productions.media.optional", "optional") }}
            </span>
          </p>

          <!-- Title -->
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin.productions.media.title", "Title") }}
            </label>
            <input
              :value="item[locale].title"
              class="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
              :placeholder="
                locale === 'nl'
                  ? t('admin.productions.media.required', 'Required')
                  : t(
                      'admin.productions.media.fallbackHint',
                      'Falls back to NL',
                    )
              "
              @input="
                emit(
                  'updateTranslation',
                  locale,
                  'title',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </div>

          <!-- Description -->
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin.productions.media.description", "Description") }}
            </label>
            <textarea
              :value="item[locale].description"
              rows="2"
              class="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
              :placeholder="
                locale === 'nl'
                  ? t('admin.productions.media.required', 'Required')
                  : t(
                      'admin.productions.media.fallbackHint',
                      'Falls back to NL',
                    )
              "
              @input="
                emit(
                  'updateTranslation',
                  locale,
                  'description',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
            />
          </div>

          <!-- Credits -->
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin.productions.media.credits", "Credits") }}
            </label>
            <input
              :value="item[locale].credits"
              class="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
              :placeholder="
                locale === 'nl'
                  ? t('admin.productions.media.required', 'Required')
                  : t(
                      'admin.productions.media.fallbackHint',
                      'Falls back to NL',
                    )
              "
              @input="
                emit(
                  'updateTranslation',
                  locale,
                  'credits',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

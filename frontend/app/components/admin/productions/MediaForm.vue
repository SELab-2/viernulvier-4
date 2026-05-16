<!--
  components/admin/productions/MediaForm.vue

  Step 3 of the production form — media management.

  Displays one "main" item slot and N "carousel" item slots.
  Each item has:
    - 6 crop upload slots (one per CropName)
    - NL title, description, credits fields (EN optional)

  All state lives in the useProductionMedia composable draft.
  This component only mutates draft.value directly — no API calls.

  Props:
    modelValue — ProductionMediaForm draft ref
  Emits:
    update:modelValue — mutated form
-->
<script setup lang="ts">
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
} from "lucide-vue-next";
import { CROP_NAMES } from "@repo/common";
import type { CropName } from "@repo/common";
import type {
  ProductionMediaForm,
  MediaItemDraft,
  DraftCrop,
} from "~/composables/productions/steps/productionMedia";
import { newItemDraft } from "~/composables/productions/steps/productionMedia";
import { formatUrl } from "~/utils/formatters";

type ActiveMediaItemDraft = Extract<MediaItemDraft, { crops: unknown }>;

const props = defineProps<{
  modelValue: ProductionMediaForm;
}>();

const emit = defineEmits<{
  "update:modelValue": [ProductionMediaForm];
}>();

const { t } = useI18n();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function update(val: ProductionMediaForm) {
  emit("update:modelValue", val);
}

function updateItem(index: number, updated: MediaItemDraft) {
  const items = [...props.modelValue.items];
  items[index] = updated;
  update({ ...props.modelValue, items });
}

// ─── Items ────────────────────────────────────────────────────────────────────

const mainItem = computed<ActiveMediaItemDraft | null>(
  () =>
    (props.modelValue.items.find(
      (i) => (i.kind !== "existing" || !i.deleted) && i.position === "main",
    ) as ActiveMediaItemDraft) ?? null,
);

const mainItemIndex = computed(() =>
  props.modelValue.items.findIndex(
    (i) => (i.kind !== "existing" || !i.deleted) && i.position === "main",
  ),
);

const carouselItems = computed<{ item: ActiveMediaItemDraft; index: number }[]>(
  () =>
    props.modelValue.items
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) =>
          (item.kind !== "existing" || !item.deleted) &&
          item.position === "carousel",
      ) as { item: ActiveMediaItemDraft; index: number }[],
);

function addMainItem() {
  update({
    ...props.modelValue,
    items: [...props.modelValue.items, newItemDraft("main")],
  });
}

function addCarouselItem() {
  update({
    ...props.modelValue,
    items: [...props.modelValue.items, newItemDraft("carousel")],
  });
}

function deleteItem(index: number) {
  const item = props.modelValue.items[index];
  if (!item) return;

  const items = [...props.modelValue.items];

  if (item.kind === "existing") {
    // Mark as deleted so finish can clean up
    items[index] = {
      kind: "existing",
      id: item.id,
      position: item.position,
      deleted: true,
    };
  } else {
    // New item — just remove from draft
    items.splice(index, 1);
  }

  update({ ...props.modelValue, items });
}

// ─── Crop uploads ─────────────────────────────────────────────────────────────

function handleFileInput(itemIndex: number, cropName: CropName, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const item = props.modelValue.items[itemIndex];
  if (!item || (item.kind === "existing" && item.deleted)) return;

  const existingCrop = item.crops[cropName];
  const newCrop: DraftCrop =
    existingCrop.type === "existing"
      ? {
          type: "replaced",
          existingId: existingCrop.id,
          existingUrl: existingCrop.url,
          file,
        }
      : { type: "new", file };

  updateItem(itemIndex, {
    ...item,
    crops: { ...item.crops, [cropName]: newCrop },
  } as MediaItemDraft);
}

function removeCrop(itemIndex: number, cropName: CropName) {
  const item = props.modelValue.items[itemIndex];
  if (!item || (item.kind === "existing" && item.deleted)) return;

  const currentCrop = item.crops[cropName];
  // If it was existing in DB, set to empty so finish knows to delete it
  // If it was a pending new upload, just clear it
  updateItem(itemIndex, {
    ...item,
    crops: { ...item.crops, [cropName]: { type: "empty" } },
  } as MediaItemDraft);
}

function getCropPreviewUrl(crop: DraftCrop): string | null {
  if (crop.type === "existing") return formatUrl(crop.url);
  if (crop.type === "replaced") return URL.createObjectURL(crop.file);
  if (crop.type === "new") return URL.createObjectURL(crop.file);
  return null;
}

// ─── Metadata fields ──────────────────────────────────────────────────────────

function updateTranslation(
  itemIndex: number,
  locale: "nl" | "en",
  field: "title" | "description" | "credits",
  value: string,
) {
  const item = props.modelValue.items[itemIndex];
  if (!item || (item.kind === "existing" && item.deleted)) return;

  updateItem(itemIndex, {
    ...item,
    [locale]: { ...item[locale], [field]: value },
  } as MediaItemDraft);
}

// ─── Collapsed state (local UI only) ─────────────────────────────────────────

const collapsedItems = ref<Set<number>>(new Set());

function toggleCollapse(index: number) {
  const next = new Set(collapsedItems.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedItems.value = next;
}
</script>

<template>
  <div class="space-y-6">
    <!-- ── MAIN IMAGE ──────────────────────────────────────────────────────── -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <!-- Section header -->
      <div
        class="flex items-center justify-between border-b border-border px-6 py-4"
      >
        <div>
          <p
            class="text-[11px] font-black uppercase tracking-widest text-foreground"
          >
            {{ t("admin-productions.media.main") }}
          </p>
          <p class="mt-0.5 text-[10px] text-muted-foreground">
            {{ t("admin-productions.media.mainHint") }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="mainItem !== null"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
            @click="deleteItem(mainItemIndex)"
          >
            <Trash2 :size="11" stroke-width="2.5" />
          </button>

          <button
            v-if="mainItem === null"
            class="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
            @click="addMainItem"
          >
            <Plus :size="11" stroke-width="3" />
            {{ t("admin-productions.media.add") }}
          </button>
        </div>
      </div>

      <!-- Main item editor -->
      <div v-if="mainItem !== null && mainItemIndex !== -1" class="p-6">
        <AdminProductionsMediaItemEditor
          :item="mainItem"
          :index="mainItemIndex"
          :crop-names="CROP_NAMES"
          :get-preview="getCropPreviewUrl"
          @delete="deleteItem(mainItemIndex)"
          @file-input="
            (cropName, e) => handleFileInput(mainItemIndex, cropName, e)
          "
          @remove-crop="(cropName) => removeCrop(mainItemIndex, cropName)"
          @update-translation="
            (locale, field, value) =>
              updateTranslation(mainItemIndex, locale, field, value)
          "
        />
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border bg-muted"
        >
          <ImagePlus :size="16" class="text-muted-foreground" />
        </div>
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.media.noMain") }}
        </p>
      </div>
    </div>

    <!-- ── CAROUSEL IMAGES ─────────────────────────────────────────────────── -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <!-- Section header -->
      <div
        class="flex items-center justify-between border-b border-border px-6 py-4"
      >
        <div>
          <p
            class="text-[11px] font-black uppercase tracking-widest text-foreground"
          >
            {{ t("admin-productions.media.carousel") }}
          </p>
          <p class="mt-0.5 text-[10px] text-muted-foreground">
            {{ t("admin-productions.media.carouselHint") }}
          </p>
        </div>

        <button
          class="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
          @click="addCarouselItem"
        >
          <Plus :size="11" stroke-width="3" />
          {{ t("admin-productions.media.add") }}
        </button>
      </div>

      <!-- Carousel items -->
      <div v-if="carouselItems.length > 0" class="divide-y divide-border">
        <div v-for="{ item, index } in carouselItems" :key="index">
          <!-- Carousel item header -->
          <div
            class="flex cursor-pointer items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
            @click="toggleCollapse(index)"
          >
            <p
              class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin-productions.media.carouselItem") }}
              {{ carouselItems.findIndex((ci) => ci.index === index) + 1 }}
            </p>
            <div class="flex items-center gap-2">
              <button
                class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
                @click.stop="deleteItem(index)"
              >
                <Trash2 :size="11" stroke-width="2.5" />
              </button>
              <ChevronDown
                v-if="collapsedItems.has(index)"
                :size="13"
                class="text-muted-foreground"
              />
              <ChevronUp v-else :size="13" class="text-muted-foreground" />
            </div>
          </div>

          <!-- Carousel item editor (collapsible) -->
          <div v-if="!collapsedItems.has(index)" class="px-6 pb-6">
            <AdminProductionsMediaItemEditor
              :item="item"
              :index="index"
              :crop-names="CROP_NAMES"
              :get-preview="getCropPreviewUrl"
              @delete="deleteItem(index)"
              @file-input="(cropName, e) => handleFileInput(index, cropName, e)"
              @remove-crop="(cropName) => removeCrop(index, cropName)"
              @update-translation="
                (locale, field, value) =>
                  updateTranslation(index, locale, field, value)
              "
            />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border bg-muted"
        >
          <ImagePlus :size="16" class="text-muted-foreground" />
        </div>
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.media.noCarousel") }}
        </p>
      </div>
    </div>
  </div>
</template>

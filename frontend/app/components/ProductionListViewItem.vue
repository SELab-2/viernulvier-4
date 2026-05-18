<!--
  ProductionListViewItem.vue

  This component represents a single item in the production list view.
  It displays the production's title, date range, and associated tags.

  Modes:
  - Public: media display + title + artist + date range + tags
  - Admin:
    * same as public but the tile itself is not clickable.
    * edit / delete buttons OR warning button if production has events from the future.
  - Admin + Batch Edit Mode:
    * Edit/delete actions are hidden; warning button stays visible.
    * Selectable productions show a checkbox in place of the action buttons.
    * Future productions remain non-selectable (consistent with non-editable/non-deletable).
    * The card shows a highlighted selected state when chosen.
-->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProductionView, Event, TagView } from "@repo/common";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import { ROUTES } from "~/utils/routes";
import { computeDateRangeFromEvents } from "~/utils/formatters";
import { useGallery } from "~/composables/media/useGallery";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import { Check } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    productionView: ProductionView;
    isAdmin?: boolean;
    isBatchMode?: boolean;
  }>(),
  {
    isAdmin: false,
    isBatchMode: false,
  },
);

const emit = defineEmits<{
  (
    e: "delete",
    production: ProductionView,
    gallery: GalleryWithItems<ItemViewWithCrops> | null,
  ): void;
}>();

const { locale } = useI18n();
const tags = ref<TagView[]>([]);
const events = ref<Event[]>([]);
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const mainCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "hd_ready");
});

const { getTags, getMediaGallery } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();
const { getMainImageCrop } = useGallery();

const { isSelected, toggleSelection } = useProductionBatchEdit();

const selected = computed(() => isSelected(props.productionView));

async function loadTags() {
  if (!props.productionView?.id) return;

  try {
    const response = await getTags(props.productionView.id, locale.value);
    if (response.data) {
      tags.value = (response.data as TagView[]).filter((tag) => {
        const currentTag =
          typeof tag.tag === "string"
            ? tag.tag
            : tag.tag?.[locale.value as "en" | "nl"];
        return currentTag && currentTag !== "N/A";
      });
    } else {
      console.error("Failed to load tags:", response.error);
    }
  } catch (err) {
    console.error("Error loading tags:", err);
  }
}

async function loadEvents() {
  if (!props.productionView?.id) return;

  try {
    const resp = await getAllEvents({
      eventFilters: { production_id: props.productionView.id as any },
    });
    if (resp.data && Array.isArray((resp.data as any).objects)) {
      events.value = (resp.data as any).objects as Event[];
    } else if (resp.data && Array.isArray(resp.data)) {
      events.value = resp.data as Event[];
    }
  } catch (err) {
    console.error("Error loading events:", err);
  }
}

async function loadGallery() {
  if (!props.productionView?.id) return;
  gallery.value = await getMediaGallery(props.productionView.id, locale.value);
}

// Recompute dateRangeText whenever events or locale changes
const dateRangeText = computed(() =>
  computeDateRangeFromEvents(events.value, locale.value),
);

// Determine if the production has any events in the future to know if we should display a warning button in admin mode.
const isFutureProduction = computed(() => {
  if (!events.value?.length) return false;

  const now = Date.now();

  const allTimes: number[] = [];

  for (const e of events.value) {
    if (e?.starttime) {
      const t = Date.parse(e.starttime);
      if (!Number.isNaN(t)) allTimes.push(t);
    }
    if (e?.endtime) {
      const t = Date.parse(e.endtime);
      if (!Number.isNaN(t)) allTimes.push(t);
    }
  }

  if (!allTimes.length) return false;

  const latest = Math.max(...allTimes);

  return latest > now;
});

// Future productions are not selectable in batch mode — consistent with them being non-editable/non-deletable
const isSelectableInBatchMode = computed(() => !isFutureProduction.value);
const cardProps = computed(() => ({
  productionView: props.productionView,
  isAdmin: props.isAdmin,
  isBatchMode: props.isBatchMode,
  selected: selected.value,
  mainCrop: mainCrop.value,
  dateRangeText: dateRangeText.value,
  tags: tags.value,
  isFutureProduction: isFutureProduction.value,
}));

onMounted(() => {
  loadEvents();
  loadTags();
  loadGallery();
});

watch(
  () => props.productionView.id,
  () => {
    loadEvents();
    loadTags();
    loadGallery();
  },
);

// reload tags if language changes
watch(locale, () => loadTags());

// ── Batch mode interaction ───────────────────────────────────────────────

function handleClick() {
  if (props.isBatchMode && isSelectableInBatchMode.value) {
    toggleSelection(props.productionView);
  }
}
</script>

<template>
  <NuxtLink
    v-if="!props.isAdmin || props.isBatchMode"
    :to="
      !props.isAdmin && !props.isBatchMode
        ? ROUTES.productions.byId(props.productionView.id)
        : undefined
    "
    class="group block"
    :class="{ 'cursor-pointer': props.isBatchMode && isSelectableInBatchMode }"
    @click="handleClick"
  >
    <ProductionListViewItemCard v-bind="cardProps" />
  </NuxtLink>
  <div v-else class="group block">
    <ProductionListViewItemCard
      v-bind="cardProps"
      @delete="emit('delete', $event, gallery)"
    />
  </div>
</template>

<style scoped>
[tabindex="0"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.group:hover {
  text-decoration: none;
}

/* Checkmark pop-in */
.check-enter-active {
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.1s;
}
.check-enter-from {
  transform: scale(0);
  opacity: 0;
}
.check-leave-active {
  transition:
    transform 0.1s ease,
    opacity 0.1s;
}
.check-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>

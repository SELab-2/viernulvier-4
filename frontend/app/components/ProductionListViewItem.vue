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
  (e: "delete", production: ProductionView): void;
}>();

const { t, locale } = useI18n();
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
  <component
    :is="props.isAdmin || props.isBatchMode ? 'div' : 'NuxtLink'"
    :to="
      !props.isAdmin && !props.isBatchMode
        ? ROUTES.productions.byId(props.productionView.id)
        : undefined
    "
    class="group block"
    :class="{ 'cursor-pointer': props.isBatchMode && isSelectableInBatchMode }"
    @click="handleClick"
  >
    <div
      class="flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors transition-shadow duration-150"
      :class="[
        props.isBatchMode
          ? selected
            ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_hsl(var(--primary)/0.25)]'
            : isSelectableInBatchMode
              ? 'border-card-border hover:border-primary/40 hover:bg-card-hover'
              : 'border-card-border cursor-not-allowed'
          : 'border-card-border hover:border-ring hover:shadow-sm hover:bg-card-hover',
      ]"
    >
      <MediaDisplay
        :id="props.productionView.id"
        :src="mainCrop"
        size="md"
        :rounded="true"
        :show-icon="true"
        class="object-cover"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 max-w-[60%]">
            <h3
              class="text-2xl sm:text-3xl font-semibold text-card-foreground leading-tight truncate transition-colors"
              :class="{ 'text-primary': props.isBatchMode && selected }"
            >
              {{ props.productionView.titel }}
            </h3>

            <!-- Artist -->
            <p
              v-if="
                props.productionView.artist &&
                props.productionView.artist !== 'N/A'
              "
              class="text-sm text-muted-foreground leading-normal line-clamp-1"
            >
              {{ props.productionView.artist }}
            </p>

            <p
              class="mt-2 text-sm text-muted-foreground flex items-center gap-2"
            >
              <svg
                class="w-4 h-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path
                  d="M16 2v4M8 2v4M3 10h18"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ dateRangeText }}</span>
            </p>
          </div>

          <!-- Right-side actions -->
          <div v-if="props.isAdmin" class="flex items-center gap-2 shrink-0">
            <!-- BATCH MODE: selectable production → show checkbox -->
            <template v-if="props.isBatchMode && isSelectableInBatchMode">
              <div
                class="flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-150"
                :class="
                  selected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-transparent'
                "
                aria-hidden="true"
              >
                <Transition name="check">
                  <Check v-if="selected" :size="13" stroke-width="3" />
                </Transition>
              </div>
            </template>

            <!-- BATCH MODE: future/warning production → show warning button, no checkbox -->
            <template v-else-if="props.isBatchMode && !isSelectableInBatchMode">
              <AdminWarningButton
                :title="t('admin-productions.warning-title')"
                :description="t('admin-productions.warning-description')"
              />
            </template>

            <!-- NORMAL ADMIN MODE -->
            <template v-else>
              <!-- WARNING -->
              <AdminWarningButton
                v-if="isFutureProduction"
                :title="t('admin-productions.warning-title')"
                :description="t('admin-productions.warning-description')"
              />

              <!-- NORMAL ACTIONS -->
              <template v-else>
                <NuxtLink
                  :to="
                    ROUTES.admin.productions.edit(
                      Number(props.productionView.id),
                    )
                  "
                  @click.stop
                >
                  <AdminEditButton label="Edit production" />
                </NuxtLink>

                <AdminDeleteButton
                  label="Delete production"
                  @click.stop="emit('delete', props.productionView)"
                />
              </template>
            </template>
          </div>
        </div>

        <!-- Tags container -->
        <div class="mt-2 overflow-hidden">
          <div class="flex items-center gap-2">
            <TagPill
              v-for="tag in tags"
              :key="tag.id"
              :label="typeof tag.tag === 'string' ? tag.tag : ''"
            />
            <TagPill
              v-if="tags.length === 0"
              :label="'/'"
              class="opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  </component>
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

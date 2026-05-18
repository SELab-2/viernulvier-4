<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProductionView, Event, TagView, SeriesView } from "@repo/common";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import { useSeriesApi } from "~/composables/useSeriesApi";
import { ROUTES } from "~/utils/routes";
import { computeDateRangeFromEvents } from "~/utils/formatters";
import { useGallery } from "~/composables/media/useGallery";

const { productionView } = defineProps<{
  productionView: ProductionView;
}>();

const tags = ref<TagView[]>([]);
const events = ref<Event[]>([]);
const linkedSeriesList = ref<SeriesView[]>([]);
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);

const mainCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "hd_ready");
});

const { getTags, getMediaGallery } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();
const { getAll: getAllSeries } = useSeriesApi();
const { getMainImageCrop } = useGallery();

const { locale } = useI18n();

async function loadTags() {
  if (!productionView?.id) return;

  try {
    const response = await getTags(productionView.id, locale.value);
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
  if (!productionView?.id) return;

  try {
    const resp = await getAllEvents({
      eventFilters: { production_id: productionView.id as any },
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
  if (!productionView?.id) return;
  gallery.value = await getMediaGallery(productionView.id, locale.value);
}

// get series linked to productions
async function loadLinkedSeries() {
  if (!productionView?.id) return;

  try {
    const resp = await getAllSeries({
      seriesFilters: { production_id: productionView.id } as any,
      languageFilters: { lang: locale.value },
    });

    if (resp.data && Array.isArray(resp.data.objects)) {
      linkedSeriesList.value = resp.data.objects as SeriesView[];
    } else {
      linkedSeriesList.value = [];
    }
  } catch (err) {
    console.error("Error loading linked series:", err);
  }
}

const dateRangeText = computed(() =>
  computeDateRangeFromEvents(events.value, locale.value),
);

function getSeriesTitle(series: SeriesView) {
  if (!series) return "";
  const titel = series.titel;
  if (typeof titel === "string") return titel;
  return titel?.[locale.value as "en" | "nl"] || "";
}

onMounted(() => {
  loadEvents();
  loadTags();
  loadGallery();
  loadLinkedSeries();
});

watch(
  () => productionView.id,
  () => {
    loadEvents();
    loadTags();
    loadGallery();
    loadLinkedSeries();
  },
);

watch(locale, () => {
  loadTags();
  loadLinkedSeries();
});
</script>

<template>
  <NuxtLink
    :to="ROUTES.productions.byId(productionView.id)"
    class="group block"
  >
    <div
      class="flex flex-col rounded-xl border border-card-border bg-card hover:border-ring hover:shadow-sm hover:bg-card-hover transition-colors transition-shadow duration-150 overflow-hidden h-full"
    >
      <div
        class="relative w-full aspect-video flex items-center justify-center bg-muted shrink-0 border-b border-card-border"
      >
        <MediaDisplay
          :id="productionView.id"
          :src="mainCrop"
          :show-icon="true"
          size="lg"
          class="w-full h-full"
        />

        <div v-if="linkedSeriesList.length" class="absolute top-2 right-2 z-20">
          <NuxtLink
            v-if="linkedSeriesList.length === 1"
            :to="ROUTES.series.byId(linkedSeriesList[0].id)"
            @click.prevent="
              $router.push(ROUTES.series.byId(linkedSeriesList[0].id))
            "
            class="group/single-badge flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground hover:text-accent border border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm transition-all hover:bg-background"
          >
            <svg
              class="w-3 h-3 text-muted-foreground group-hover/single-badge:text-accent transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
              />
            </svg>
            <span class="max-w-[120px] truncate">{{
              getSeriesTitle(linkedSeriesList[0])
            }}</span>
          </NuxtLink>

          <div v-else class="relative group/series-dropdown">
            <div
              class="flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground hover:text-accent border border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm cursor-pointer transition-colors"
            >
              <svg
                class="w-3 h-3 text-muted-foreground group-hover/series-dropdown:text-accent transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
                />
              </svg>
              <span>{{ linkedSeriesList.length }} series</span>
            </div>

            <div
              class="absolute right-0 top-full hidden group-hover/series-dropdown:flex flex-col gap-1 pt-1 z-30"
            >
              <div
                class="flex flex-col gap-1 bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-lg shadow-lg min-w-[140px] max-h-[200px] overflow-y-auto [scrollbar-width:thin] animate-in fade-in slide-in-from-top-1 duration-100"
              >
                <NuxtLink
                  v-for="series in linkedSeriesList"
                  :key="series.id"
                  :to="ROUTES.series.byId(series.id)"
                  @click.prevent="$router.push(ROUTES.series.byId(series.id))"
                  class="group/item flex items-center gap-1.5 text-foreground hover:text-accent-hover text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-md hover:bg-muted transition-colors whitespace-nowrap"
                >
                  <svg
                    class="w-2.5 h-2.5 text-muted-foreground shrink-0 group-hover/item:text-accent-hover transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
                    />
                  </svg>
                  <span class="max-w-[120px] truncate">{{
                    getSeriesTitle(series)
                  }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 p-4 gap-2 min-w-0">
        <h3
          class="text-lg font-semibold text-card-foreground leading-tight line-clamp-2"
        >
          {{ productionView.titel }}
        </h3>

        <p
          v-if="productionView.artist && productionView.artist !== 'N/A'"
          class="text-sm text-muted-foreground leading-normal line-clamp-1"
        >
          {{ productionView.artist }}
        </p>

        <p class="text-sm text-muted-foreground flex items-center gap-2">
          <svg
            class="w-4 h-4 shrink-0 text-muted-foreground"
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
          <span class="truncate">{{ dateRangeText }}</span>
        </p>

        <div class="overflow-hidden">
          <div class="flex flex-wrap items-center gap-1.5">
            <TagPill
              v-for="tag in tags"
              :key="tag.id"
              :label="typeof tag.tag === 'string' ? tag.tag : ''"
            />
            <TagPill
              v-if="tags.length === 0"
              label="/"
              class="opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.group:hover {
  text-decoration: none;
}
[tabindex="0"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
</style>

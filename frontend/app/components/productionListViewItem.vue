<!--
  This component represents a single item in the production list view.
  It displays the production's title, date range, and associated tags.
-->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ProductionView, Tag, Event } from "@repo/common";
import { useProductionApi } from "../composables/useProductionApi";
import { useEventApi } from "../composables/useEventApi";
import { ROUTES } from "../utils/routes";
import { computeDateRangeFromEvents } from "../utils/formatters";
import TagPill from "./TagPill.vue";
import ThumbnailPlaceholder from "./ThumbnailPlaceholder.vue";

const { productionView } = defineProps<{
  productionView: ProductionView;
}>();

const tags = ref<Tag[]>([]);
const events = ref<Event[]>([]);

const { getTags } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();

const { locale } = useI18n();

async function loadTags() {
  if (!productionView?.id) return;

  try {
    const response = await getTags(productionView.id, locale.value);
    if (response.data) tags.value = response.data as Tag[];
    else console.error("Failed to load tags:", response.error);
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

// Recompute dateRangeText whenever events or locale changes
const dateRangeText = computed(() =>
  computeDateRangeFromEvents(events.value, locale.value),
);

onMounted(() => {
  loadEvents();
  loadTags();
});

watch(
  () => productionView.id,
  () => {
    loadEvents();
    loadTags();
  },
);

// reload tags if language changes
watch(locale, () => loadTags());
</script>

<template>
  <NuxtLink
    :to="ROUTES.productions.byId(productionView.id)"
    class="group block"
  >
    <div
      class="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card hover:border-ring hover:shadow-sm hover:bg-card-hover transition-colors transition-shadow duration-150"
    >
      <ThumbnailPlaceholder
        :id="productionView.id"
        size="md"
        :showIcon="true"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 max-w-[60%]">
            <h3
              class="text-2xl sm:text-3xl font-semibold text-card-foreground leading-tight truncate"
            >
              {{ productionView.titel }}
            </h3>

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
  </NuxtLink>
</template>

<style scoped>
[tabindex="0"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.group:hover {
  text-decoration: none;
}
</style>

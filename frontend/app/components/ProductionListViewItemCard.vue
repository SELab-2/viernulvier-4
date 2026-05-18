<script setup lang="ts">
import type { ProductionView, TagView, SeriesView } from "@repo/common";
import type { MediaCrop } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const { t } = useI18n();

const props = defineProps<{
  productionView: ProductionView;
  isAdmin?: boolean;
  mainCrop: MediaCrop | null;
  dateRangeText: string;
  tags: TagView[];
  isFutureProduction: boolean;
  linkedSeriesList: SeriesView[];
}>();

const emit = defineEmits<{
  (e: "delete", production: ProductionView): void;
}>();
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card hover:border-ring hover:shadow-sm hover:bg-card-hover transition-colors transition-shadow duration-150"
  >
    <div class="shrink-0">
      <MediaDisplay
        :id="props.productionView.id"
        :src="props.mainCrop"
        size="md"
        :rounded="true"
        :show-icon="true"
        class="object-cover"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 max-w-[70%]">
          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
            <h3
              class="text-2xl sm:text-3xl font-semibold text-card-foreground leading-tight truncate min-w-0"
            >
              {{ props.productionView.titel }}
            </h3>

            <ProductionSeriesBadge :series-list="props.linkedSeriesList" />
          </div>
          <!-- Artist -->
          <p
            v-if="
              props.productionView.artist &&
              props.productionView.artist !== 'N/A'
            "
            class="mt-0.5 text-sm text-muted-foreground leading-normal line-clamp-1"
          >
            {{ props.productionView.artist }}
          </p>

          <p class="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <svg
              class="w-4 h-4 text-muted-foreground shrink-0"
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
            <span>{{ props.dateRangeText }}</span>
          </p>
        </div>

        <!-- Admin buttons -->
        <div v-if="props.isAdmin" class="flex items-center gap-2 shrink-0">
          <!-- WARNING -->
          <AdminWarningButton
            v-if="props.isFutureProduction"
            :title="t('admin-productions.warning-title')"
            :description="t('admin-productions.warning-description')"
          />

          <!-- NORMAL ACTIONS -->
          <template v-else>
            <NuxtLink
              :to="
                ROUTES.admin.productions.edit(Number(props.productionView.id))
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
        </div>
      </div>

      <!-- Tags container -->
      <div class="mt-2 overflow-hidden">
        <div class="flex items-center gap-2">
          <TagPill
            v-for="tag in props.tags"
            :key="tag.id"
            :label="typeof tag.tag === 'string' ? tag.tag : ''"
          />
          <TagPill
            v-if="props.tags.length === 0"
            :label="'/'"
            class="opacity-0 pointer-events-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

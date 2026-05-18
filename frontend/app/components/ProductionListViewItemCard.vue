<script setup lang="ts">
import type { ProductionView, TagView, SeriesView } from "@repo/common";
import type { MediaCrop } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const { t, locale } = useI18n();

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

function getSeriesTitle(series: SeriesView) {
  if (!series) return "";
  const titel = series.titel;
  if (typeof titel === "string") return titel;
  return titel?.[locale.value as "en" | "nl"] || "";
}
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card hover:border-ring hover:shadow-sm hover:bg-card-hover transition-colors transition-shadow duration-150"
  >
    <div class="shrink-0">
      <MediaDisplay
        :id="props.productionView.id"
        :src="mainCrop"
        size="md"
        :rounded="true"
        :show-icon="true"
        class="object-cover"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 max-w-[70%]">
          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <h3
              class="text-2xl sm:text-3xl font-semibold text-card-foreground leading-tight truncate"
            >
              {{ props.productionView.titel }}
            </h3>

            <div v-if="props.linkedSeriesList?.length" class="shrink-0">
              <NuxtLink
                v-if="props.linkedSeriesList.length === 1"
                :to="ROUTES.series.byId(props.linkedSeriesList[0].id)"
                @click.prevent="
                  $router.push(ROUTES.series.byId(props.linkedSeriesList[0].id))
                "
                class="group/single-badge inline-flex items-center gap-1.5 bg-muted text-foreground hover:text-accent border border-border text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm transition-colors"
              >
                <svg
                  class="w-2.5 h-2.5 text-muted-foreground group-hover/single-badge:text-accent transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
                  />
                </svg>
                <span class="max-w-[100px] truncate">{{
                  getSeriesTitle(props.linkedSeriesList[0])
                }}</span>
              </NuxtLink>

              <div
                v-else
                class="relative group/series-dropdown inline-block"
                @click.prevent
              >
                <div
                  class="inline-flex items-center gap-1.5 bg-muted text-foreground hover:text-accent border border-border text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm cursor-pointer transition-colors"
                >
                  <svg
                    class="w-2.5 h-2.5 text-muted-foreground group-hover/series-dropdown:text-accent transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"
                    />
                  </svg>
                  <span>{{ props.linkedSeriesList.length }} series</span>
                </div>

                <div
                  class="absolute left-0 top-full hidden group-hover/series-dropdown:flex flex-col gap-1 pt-1 z-30"
                >
                  <div
                    class="flex flex-col gap-1 bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-lg shadow-lg min-w-[130px] max-h-[200px] overflow-y-auto [scrollbar-width:thin] animate-in fade-in slide-in-from-top-1 duration-100"
                  >
                    <NuxtLink
                      v-for="series in props.linkedSeriesList"
                      :key="series.id"
                      :to="ROUTES.series.byId(series.id)"
                      @click.prevent="
                        $router.push(ROUTES.series.byId(series.id))
                      "
                      class="group/item flex items-center gap-1.5 text-foreground hover:text-accent-hover text-[9px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-md hover:bg-muted transition-colors whitespace-nowrap"
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
                      <span class="max-w-[110px] truncate">{{
                        getSeriesTitle(series)
                      }}</span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
            <span>{{ dateRangeText }}</span>
          </p>
        </div>

        <div v-if="props.isAdmin" class="flex items-center gap-2 shrink-0">
          <AdminWarningButton
            v-if="isFutureProduction"
            :title="t('admin-productions.warning-title')"
            :description="t('admin-productions.warning-description')"
          />

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
</template>

<style scoped></style>

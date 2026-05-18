<script setup lang="ts">
import { computed } from "vue";
import type { ProductionView, TagView } from "@repo/common";
import type { MediaCrop } from "@repo/common";
import { ROUTES } from "~/utils/routes";
import { useI18n } from "vue-i18n";
import { Check } from "lucide-vue-next";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    productionView: ProductionView;
    isAdmin?: boolean;
    isBatchMode?: boolean;
    selected?: boolean;
    mainCrop: MediaCrop | null;
    dateRangeText: string;
    tags: TagView[];
    isFutureProduction: boolean;
  }>(),
  {
    isAdmin: false,
    isBatchMode: false,
    selected: false,
  },
);

const emit = defineEmits<{
  (e: "delete", production: ProductionView): void;
}>();

// Future productions are not selectable in batch mode
const isSelectableInBatchMode = computed(() => !props.isFutureProduction);
</script>

<template>
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

          <p class="mt-2 text-sm text-muted-foreground flex items-center gap-2">
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
                  ROUTES.admin.productions.edit(Number(props.productionView.id))
                "
                @click.stop
              >
                <AdminEditButton label="Edit production" />
              </NuxtLink>

              <AdminDeleteButton
                label="Delete production"
                @click="emit('delete', props.productionView)"
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
</template>

<style scoped>
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

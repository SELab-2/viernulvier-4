<!--
  BatchSelectedPanel.vue

  A floating overlay panel that appears when productions are selected in batch edit mode.
  - Does NOT take up layout space (position: fixed)
  - Collapsible / expandable
  - Shows list of selected productions with remove actions
  - Contains "Proceed to Batch Edit" CTA
-->
<script setup lang="ts">
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import { useI18n } from "vue-i18n";
import { ROUTES } from "~/utils/routes";
import { ChevronUp, ChevronDown, X, ArrowRight, Layers } from "lucide-vue-next";

const { t } = useI18n();
const {
  selectedProductions,
  selectedCount,
  hasSelections,
  isPanelCollapsed,
  deselectProduction,
  togglePanel,
} = useProductionBatchEdit();
</script>

<template>
  <Transition name="panel-slide">
    <div
      class="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 bg-primary cursor-pointer select-none"
        @click="togglePanel"
      >
        <div class="flex items-center gap-2">
          <Layers :size="15" class="text-primary-foreground/80" />
          <span
            class="font-brand font-black text-[11px] uppercase tracking-widest text-primary-foreground leading-none"
          >
            {{
              t("admin-productions.batch.selected", { count: selectedCount })
            }}
          </span>
        </div>
        <component
          :is="isPanelCollapsed ? ChevronUp : ChevronDown"
          :size="15"
          class="text-primary-foreground/80"
        />
      </div>

      <!-- Body -->
      <Transition name="collapse">
        <div v-if="!isPanelCollapsed">
          <!-- EMPTY STATE -->
          <div v-if="!hasSelections" class="px-4 py-10 text-center">
            <div class="flex flex-col items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border"
              >
                <Layers :size="18" class="text-muted-foreground" />
              </div>
              <p
                class="text-sm font-brand font-black uppercase tracking-widest text-muted-foreground"
              >
                {{ t("admin-productions.batch.hint") }}
              </p>
            </div>
          </div>
          <!-- Selected list -->
          <ul class="max-h-52 overflow-y-auto divide-y divide-border">
            <li
              v-for="production in selectedProductions"
              :key="production.id"
              class="flex items-center justify-between gap-3 px-4 py-2.5 group hover:bg-muted/50 transition-colors"
            >
              <span
                class="text-sm font-medium text-card-foreground truncate leading-snug"
              >
                {{ production.titel }}
              </span>
              <button
                class="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                :aria-label="`Remove ${production.titel} from selection`"
                @click="deselectProduction(production)"
              >
                <X :size="13" />
              </button>
            </li>
          </ul>

          <!-- Footer CTA -->
          <div
            class="px-4 py-3 border-t border-border"
            :class="{ 'opacity-40 pointer-events-none': !hasSelections }"
          >
            <NuxtLink
              :to="ROUTES.admin.productions.batchEdit"
              class="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-accent-fixed border-2 border-accent-fixed text-accent-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-accent transition"
            >
              {{ t("admin-productions.batch.proceed") }}
              <ArrowRight :size="13" />
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Panel slide in from bottom-right */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.96);
}

/* Collapse body */
.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 300px;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>

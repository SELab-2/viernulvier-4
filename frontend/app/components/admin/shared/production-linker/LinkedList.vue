<!--
  components/admin/shared/production-linker/LinkedList.vue
  ========================================================
  Scrollable list of productions linked to the entity in the current session.

  The list is capped at max-h-64 (16rem) with overflow-y-auto so it stays
  usable regardless of how many productions are linked. Each row shows:
  - A green check badge
  - Production title and ID
  - A "View production" external link
  - An "Unlink" button that fires the 'unlink' event

  Props:
  - type  What page this will be used on.
  - productions   array of ProductionView objects currently linked
  - unlinkingId   ID of the production currently being unlinked (shows spinner)

  Emits:
  - unlink(productionId)  user clicked the Unlink button
-->

<script setup lang="ts">
import type { ProductionView } from "@repo/common";

const props = defineProps<{
  type: "blog" | "print" | "series";
  productions: ProductionView[];
  unlinkingId: number | null;
}>();

const emit = defineEmits<{
  (e: "unlink", productionId: number): void;
}>();

const { t } = useI18n();

const baseKey = computed(() =>
  props.type === "blog" ? "admin.blogs" : "prints",
);
const sectionLabelKey = computed(() => `${baseKey.value}.linkedThisSession`);
const emptyLabelKey = computed(() => `${baseKey.value}.noLinkedProductions`);
const unlinkBtnKey = computed(() => `${baseKey.value}.unlinkBtn`);
const viewProdKey = computed(() => `${baseKey.value}.viewProduction`);
</script>

<template>
  <div v-if="productions.length" class="space-y-2">
    <p
      class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
    >
      {{ t(sectionLabelKey) }}
    </p>

    <!--
      Scrollable container — max-h-64 so the list never pushes the search
      input off-screen when many productions are linked.
    -->
    <div class="max-h-64 overflow-y-auto space-y-1.5 pr-1 overscroll-contain">
      <div
        v-for="prod in productions"
        :key="prod.id"
        class="flex items-center gap-3 rounded-lg border border-feedback-success-border bg-feedback-success-bg px-3 py-2.5"
      >
        <!-- Green check badge -->
        <div
          class="w-6 h-6 rounded-md bg-feedback-success-text/10 flex items-center justify-center shrink-0"
        >
          <svg
            class="w-3 h-3 text-feedback-success-text"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <!-- Title and ID -->
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-semibold text-foreground leading-tight"
          >
            {{ prod.titel }}
          </p>
          <p
            class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
          >
            ID {{ prod.id }}
          </p>
        </div>

        <!-- Actions row -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Open the production detail page in a new tab -->
          <NuxtLink
            :to="ROUTES.productions.byId(prod.id)"
            target="_blank"
            class="inline-flex items-center gap-1 text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              class="w-3 h-3 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="15 3 21 3 21 9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line x1="10" y1="14" x2="21" y2="3" stroke-linecap="round" />
            </svg>
            {{ t(viewProdKey) }}
          </NuxtLink>

          <!-- Unlink button with spinner while in flight -->
          <button
            type="button"
            :disabled="unlinkingId === prod.id"
            class="inline-flex items-center gap-1 text-[9px] font-brand font-black uppercase tracking-widest text-feedback-error-text hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            @click="emit('unlink', prod.id)"
          >
            <svg
              v-if="unlinkingId === prod.id"
              class="w-3 h-3 animate-spin"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ unlinkingId === prod.id ? "…" : t(unlinkBtnKey) }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty state when no productions are linked yet -->
  <p
    v-else
    class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground/40 text-center py-1"
  >
    {{ t(emptyLabelKey) }}
  </p>
</template>

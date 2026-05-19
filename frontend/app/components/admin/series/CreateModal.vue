<!--
  components/admin/series/CreateModal.vue
  =========================================
  Modal for creating a new series.
-->

<script setup lang="ts">
import { X, Save, Loader2 } from "lucide-vue-next";
import type { NewSeries } from "~/composables/productions/steps/productionSeries";

const props = defineProps<{
  show: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "create", data: NewSeries): void;
}>();

const { t } = useI18n();

const initialItem: NewSeries = {
  type: "new",
  titel: { nl: "", en: "" },
  description: { nl: "", en: "" },
};

const item = ref<NewSeries>(structuredClone(initialItem));

// Reset when modal opens
watch(
  () => props.show,
  (isShowing) => {
    if (isShowing) {
      item.value = structuredClone(initialItem);
    }
  },
);

function handleUpdate(updated: any) {
  item.value = updated;
}

function onCreate() {
  if (!item.value.titel.nl) return;
  emit("create", item.value);
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-background/80 backdrop-blur-sm"
        @click="emit('close')"
      />

      <!-- Modal Content -->
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-border px-6 py-4"
        >
          <h2
            class="font-brand font-black text-xl uppercase tracking-tight text-foreground"
          >
            {{ t("series.create") }}
          </h2>
          <button
            class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            @click="emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <AdminProductionsSeriesItemEditor
            :item="item"
            @update="handleUpdate"
          />
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/30"
        >
          <button
            class="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            :disabled="loading"
            @click="emit('close')"
          >
            {{ t("general.cancel", "Cancel") }}
          </button>
          <button
            class="flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50"
            :disabled="loading || !item.titel.nl"
            @click="onCreate"
          >
            <Save v-if="!loading" :size="14" />
            <Loader2 v-else :size="14" class="animate-spin" />
            {{ t("general.create", "Create") }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

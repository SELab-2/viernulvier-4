<script setup lang="ts">
/**
 * Reusable warning action button.
 * Wraps ActionButton with a yellow/orange style and TriangleAlert icon.
 * On click, opens a popup with a title, description and close button.
 * Title and description are passed as props.
 */
import { ref } from "vue";
import { TriangleAlert, X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

interface Props {
  title: string;
  description: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
});

const { t } = useI18n();

const open = ref(false);
</script>

<template>
  <div class="relative">
    <!-- Button: opens popup -->
    <AdminActionButton
      :label="props.title"
      :size="props.size"
      variant="warning"
      @click="open = true"
    >
      <template #default="{ iconSize }">
        <TriangleAlert :size="iconSize" />
      </template>
    </AdminActionButton>

    <!-- Popup -->
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-xl p-4 z-50"
    >
      <!-- Header: icon + title + close button "X" -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2 min-h-8">
          <div
            class="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-action-warning-hover text-action-warning-icon flex items-center justify-center"
          >
            <TriangleAlert :size="16" />
          </div>

          <p class="text-sm font-semibold text-foreground leading-tight">
            {{ props.title }}
          </p>
        </div>

        <button
          type="button"
          class="text-muted-foreground hover:text-foreground transition"
          @click="open = false"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Body: description -->
      <p class="text-xs leading-relaxed text-muted-foreground">
        {{ props.description }}
      </p>

      <!-- Footer: close button -->
      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center px-3.5 py-2 rounded-lg border-2 border-border bg-background text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-muted hover:border-foreground transition"
          @click="open = false"
        >
          {{ t("general.close") }}
        </button>
      </div>
    </div>
  </div>
</template>

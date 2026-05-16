<!--
  components/admin/blogs/CropSlot.vue
  =====================================
  Single crop slot inside the ImageSection grid. Renders the preview image,
  upload/replace and delete buttons, and a spinner overlay while busy.

  The hidden file <input> is passed via the default slot so the parent can
  bind its own @change handler without prop-drilling a callback.
-->
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";

const props = defineProps<{
  cropName: string;
  label: string;
  hint: string;
  crop: MediaCrop | null;
  uploading: boolean;
  deleting: boolean;
  blogId: number;
}>();

const emit = defineEmits<{
  (e: "trigger-upload"): void;
  (e: "delete"): void;
}>();

const { t } = useI18n();

const isBusy = computed(() => props.uploading || props.deleting);
</script>

<template>
  <div
    class="rounded-lg border overflow-hidden bg-background transition-colors"
    :class="crop ? 'border-accent/40' : 'border-card-border'"
  >
    <!-- Image preview area -->
    <div class="relative aspect-[16/7]">
      <MediaDisplay
        :id="blogId"
        :src="crop"
        size="fill"
        :show-icon="true"
        :show-border="false"
        :rounded="false"
        class="w-full h-full"
      />

      <!-- Spinner overlay while uploading or deleting -->
      <div
        v-if="isBusy"
        class="absolute inset-0 bg-black/40 flex items-center justify-center z-10"
      >
        <svg
          class="w-6 h-6 animate-spin text-white"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      <!-- "Uploaded" badge -->
      <span
        v-if="crop"
        class="absolute top-1.5 left-1.5 bg-accent/90 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded z-10 flex items-center gap-1"
      >
        <svg
          class="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ t("admin.blogs.image.uploaded") }}
      </span>
    </div>

    <!-- Label, hint and action buttons -->
    <div class="px-3 py-2.5 space-y-1.5">
      <div>
        <p
          class="text-[11px] font-brand font-black uppercase tracking-widest text-foreground leading-tight"
        >
          {{ label }}
        </p>
        <p class="text-[9px] text-muted-foreground leading-snug mt-0.5">
          {{ hint }}
        </p>
      </div>

      <div class="flex gap-2 pt-0.5">
        <!-- Upload / Replace button -->
        <button
          :disabled="isBusy"
          class="btn-outline flex-1 justify-center h-9 px-3 gap-1.5 text-[9px] disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('trigger-upload')"
        >
          <svg
            class="w-3 h-3 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{
            crop
              ? t("admin.blogs.image.replace")
              : t("admin.blogs.image.upload")
          }}
        </button>

        <!-- Delete button — only shown when a crop exists -->
        <button
          v-if="crop"
          :disabled="isBusy"
          class="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-action-red-border text-action-red-icon hover:bg-action-red-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :title="t('admin.delete')"
          @click="emit('delete')"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Hidden file input injected by the parent -->
    <slot />
  </div>
</template>

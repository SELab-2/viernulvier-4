<script setup lang="ts">
/**
 * A single grid item for PrintsFileGrid.
 * Thumbnailplaceholder or image, file name, category and date.
 * File previews, clickable files.
 *
 * Usage:
 * <PrintsFileGridItem
 *    :file="file"
 *    category="affiche"
 * />
 */
import type { PrintItemView } from "@repo/common";
const { t } = useI18n();

interface Props {
  file: PrintItemView;
  category: string;
}
defineProps<Props>();
const { locale } = useI18n();

const fileLabel = "text-[11px] font-bold uppercase truncate";
const openFile = (src: string) => window.open(src, "_blank"); // for opening the PDF in a new browser tab
</script>

<template>
  <div class="group flex flex-col cursor-pointer">
    <!-- Thumbnail -->
    <div
      class="relative w-full rounded-lg overflow-hidden border border-border aspect-[3/4] group-hover:border-accent/60 transition-colors duration-150"
      @click="openFile(file.url)"
    >
      <MediaDisplay :src="file" size="fill" :show-icon="true" />
    </div>

    <!-- File info -->
    <div class="mt-2">
      <p
        :class="[
          fileLabel,
          'group-hover:text-accent transition-colors duration-150',
        ]"
      >
        {{ file.titel }}
      </p>
      <div class="flex items-center gap-2 mt-1">
        <span
          :class="[
            fileLabel,
            'tracking-widest border border-border rounded px-1.5 py-0.5 text-muted-foreground',
          ]"
        >
          {{ t(`prints.types.${category}`) }}
        </span>
        <span
          v-if="file.created_at"
          class="text-[11px] text-muted-foreground ml-auto"
        >
          {{
            new Date(file.created_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

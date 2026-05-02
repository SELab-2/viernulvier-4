<script setup lang="ts">
/**
 * A single grid item for PrintsFileGrid.
 * Thumbnailplaceholder or image, file name, category and date.
 * File previews, clickable files.
 *
 * Usage:
 * <PrintsFileGridItem
 *    :file="file"
 * />
 */
import type { PrintItemView } from "@repo/common";
import { Info, X } from "lucide-vue-next";

interface Props {
  file: PrintItemView;
}
defineProps<Props>();
const { t, locale } = useI18n();

const fileLabel = "text-[11px] font-bold uppercase truncate";
const openFile = (src: string) => window.open(src, "_blank"); // for opening the PDF in a new browser tab
const showInfo = ref(false); // if the info (description) section is opened or if not
</script>

<template>
  <div class="group flex flex-col cursor-pointer">
    <!-- Thumbnail -->
    <div
      class="relative w-full rounded-lg overflow-hidden border border-border aspect-[3/4] group-hover:border-accent/60 transition-colors duration-150"
      @click="openFile(file.url)"
    >
      <div @click="openFile(file.url)" class="w-full h-full">
        <MediaDisplay :src="file" size="fill" :show-icon="true" />
      </div>
      <!-- Info button -->
      <button
        v-if="file.description && file.description != ''"
        @click.stop="showInfo = true"
        class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
      >
        <Info class="w-3.5 h-3.5 text-white" />
      </button>
      <!-- Info/description section -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showInf"
            class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-35"
          >
            <div
              class="relative bg-background border border-border rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[80vh] flex flex-col"
            >
              <!-- Close button -->
              <button
                @click.stop="showInfo = false"
                class="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors shrink-0"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <!-- Title -->
              <p
                class="text-[11px] font-bold uppercase tracking-widest mb-3 pr-8 shrink-0"
              >
                {{ file.titel }}
              </p>
              <!-- Description -->
              <p
                class="text-sm leading-relaxed text-muted-foreground overflow-y-auto break-words"
              >
                {{ file.description }}
              </p>
            </div>
          </div>
        </Transition>
      </Teleport>
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
          {{ t(`prints.types.${file.print_type}`) }}
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

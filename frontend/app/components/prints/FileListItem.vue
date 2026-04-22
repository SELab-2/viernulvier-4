<script setup lang="ts">
/**
 * A single list item for PrintsFileList.
 * Displays file icon, name, category, date and action buttons (download + delete).
 * File previews, clickable files.
 *
 * Usage:
 * <PrintsFileListItem
 *    :file="file"
 * />
 */
import { FileText } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common";

interface Props {
  file: PrintItemView;
}
const props = defineProps<Props>();
const { t, locale } = useI18n();

const emit = defineEmits<{
  (e: "delete", file: PrintItemView): void;
}>();

const openFile = (src: string) => window.open(src, "_blank");
const fileExtension = computed(() => {
  // extract file extension based on url
  if (!props.file.url) return "";
  // pop takes last element, split("?") to take away query strings
  // it is assumed the file has a valid extension
  const ext = props.file.url.split(".").pop()?.split("?")[0];
  return ext ? `.${ext.toLowerCase()}` : "";
});
// constants
const rowBase =
  "group relative flex items-center gap-4 px-4 py-3 border-t border-border bg-card hover:bg-card-hover transition-colors duration-150 cursor-pointer";
</script>

<template>
  <div :class="rowBase" @click="file.url ? openFile(file.url) : undefined">
    <!-- Icon -->
    <div
      class="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0"
    >
      <FileText :size="18" class="text-muted-foreground" />
    </div>

    <!-- File info -->
    <div class="flex-1 min-w-0">
      <p
        class="text-[13px] font-bold truncate group-hover:text-accent transition-colors duration-150"
      >
        {{ file.titel }}
        <span
          v-if="fileExtension"
          class="text-[10px] font-normal text-muted-foreground"
          >{{ fileExtension }}</span
        >
      </p>
      <p
        class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5"
      >
        {{ t(`prints.types.${file.print_type}`) }} |
        <span v-if="file.created_at">
          {{
            new Date(file.created_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }}
        </span>
      </p>
    </div>

    <!-- Buttons -->
    <div class="flex items-center gap-2 shrink-0" @click.stop>
      <AdminDownloadButton
        v-if="file.url"
        :label="t('prints.download')"
        :size="37"
        :src="file.url"
        :name="file.titel"
      />
      <AdminDeleteButton
        :label="t('prints.delete')"
        :size="37"
        @click="emit('delete', file)"
      />
    </div>
  </div>
</template>

<style scoped></style>

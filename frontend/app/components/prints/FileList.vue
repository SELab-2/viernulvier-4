<script setup lang="ts">
import { FileText } from "lucide-vue-next";
interface PrintsFile { //TODO replace this with actual object later
  id: number;
  name: string;
  year?: number;
  image?: string | null;
}

interface Props {
  files: PrintsFile[];
}
const props = defineProps<Props>();
const { t } = useI18n();

const sortedFiles = computed(() => // oldest first
    [...props.files].sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
)

// constants
const rowBase = "flex items-c+enter gap-4 px-4 py-3 border-t border-border bg-card hover:bg-card-hover transition-colors duration-150 cursor-pointer"
</script>

<template>
  <div>
    <!-- List -->
    <div v-if="files.length" class="rounded-lg border border-border overflow-hidden">
      <div
          v-for="file in sortedFiles"
          :key="file.id"
          :class="rowBase"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
          <FileText :size="18" class="text-muted-foreground" />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold truncate">{{ file.name }}</p>
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            <span v-if="file.year">{{ file.year }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
        v-else
        class="rounded-lg border border-border bg-card p-4 text-[12px] text-muted-foreground"
    >
      {{ t('prints.noFiles') }}
    </div>
  </div>
</template>

<style scoped>

</style>
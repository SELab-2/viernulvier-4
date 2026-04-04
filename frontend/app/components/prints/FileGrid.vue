<script setup lang="ts">
import { ChevronUp, ChevronDown } from "lucide-vue-next";

interface ProductionFile { //TODO replace this with actual object later
  id: number;
  name: string;
  year?: number;
  image?: string | null;
}

interface Props {
  category: string;
  files: ProductionFile[];
}
defineProps<Props>();
const { t } = useI18n();

const isOpen = ref(true);
const toggle = () => isOpen.value = !isOpen.value;

//constants
const chevron = "shrink-0 text-muted-foreground"
const fileLabel = "text-[11px] font-bold uppercase truncate"
</script>

<template>
  <div class="m-4">
    <!-- Header -->
    <button
        class="w-full flex items-center gap-3 mb-3 group cursor-pointer"
        @click="toggle"
    >
      <span class="text-[20px] font-bold uppercase shrink-0">{{ category }}</span>
      <span class="text-[11px] text-muted-foreground shrink-0">{{ files.length }} {{ t('production.files') }}</span>
      <span class="flex-1 h-px bg-border" />
      <ChevronUp v-if="isOpen" :size="14" :class="chevron" />
      <ChevronDown v-else :size="14" :class="chevron" />
    </button>

    <!-- Grid -->
    <div v-if="isOpen && files.length">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
            v-for="file in files"
            :key="file.id"
            class="group flex flex-col cursor-pointer"
        >
          <!-- Thumbnail -->
          <div class="relative w-full rounded-lg overflow-hidden border border-border aspect-[3/4]">
            <img
                v-if="file.image"
                :src="file.image"
                :alt="file.name"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <ThumbnailPlaceholder
                :id="file.id"
                size="fill"
                :show-icon="true"
                :show-border="false"
                :rounded="false"
            />
          </div>

          <!-- File info -->
          <div class="mt-2">
            <p :class="fileLabel">{{ file.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span
                  :class="[fileLabel, 'tracking-widest border border-border rounded px-1.5 py-0.5 text-muted-foreground']"
              >{{ category }}
              </span>
              <span v-if="file.year" class="text-[11px] text-muted-foreground ml-auto">{{ file.year }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No files (empty) -->
    <div
        v-else-if="!files.length"
        class="rounded-lg border border-border bg-card p-4 text-[12px] text-muted-foreground"
    >
      {{ t('production.noFiles') }}
    </div>
  </div>
</template>

<style scoped>
</style>
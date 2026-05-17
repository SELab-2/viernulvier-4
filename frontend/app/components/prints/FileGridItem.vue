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
import { ref, watch, onMounted, computed, onUnmounted } from "vue";
import type { PrintItemView, ProductionView } from "@repo/common";
import { Info, X } from "lucide-vue-next";
import { useProductionApi } from "~/composables/useProductionApi"; // Uses your existing production composable
import { ROUTES } from "~/utils/routes";

interface Props {
  file: PrintItemView;
}
const props = defineProps<Props>();
const { t, locale } = useI18n();
const { getAll: getProductions } = useProductionApi();

const fileLabel = "text-[11px] font-bold uppercase truncate";
const openFile = (src: string) => window.open(src, "_blank"); // for opening the PDF in a new browser tab
const showInfo = ref(false); // if the info (description) section is opened or if not

const linkedProductions = ref<ProductionView[]>([]);
const isLoadingProductions = ref(false);

const loadLinkedProductions = async () => {
  if (!props.file?.id) return;

  isLoadingProductions.value = true;
  try {
    const resp = await getProductions({
      productionFilters: { print_id: props.file.id },
      paginationFilters: { page: 0, limit: 50, descending: false }, // Request a safe layout limit
      languageFilters: { lang: locale.value },
    });

    if (resp.data && Array.isArray(resp.data.objects)) {
      linkedProductions.value = resp.data.objects as ProductionView[];
    }
  } catch (err) {
    console.error("Error loading linked productions for print item:", err);
  } finally {
    isLoadingProductions.value = false;
  }
};

const hasInfoAvailable = computed(() => {
  const hasDescription =
    props.file.description && props.file.description !== "";
  const hasProductions = linkedProductions.value.length > 0;
  return hasDescription || hasProductions || isLoadingProductions.value;
});

onMounted(() => {
  loadLinkedProductions();
});

watch(
  () => props.file?.id,
  () => {
    loadLinkedProductions();
  },
);

watch(showInfo, (val) => {
  // Prevents scrolling when description is opened
  // (paddingRight compensates for the scrollbar width to prevent the layout from shifting)
  if (val) {
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});
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
        v-if="hasInfoAvailable"
        @click.stop="showInfo = true"
        class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
      >
        <Info class="w-3.5 h-3.5 text-white" />
      </button>
      <!-- Info/description section -->
      <Teleport to="body">
        <Transition name="fade">
          <!-- z-index is set to very high so the header doesn't cover it -->
          <div
            v-if="showInfo"
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            @click="showInfo = false"
          >
            <div
              class="relative bg-background border border-border rounded-lg p-6 max-w-4xl w-full shadow-xl max-h-[85vh] flex flex-col"
              @click.stop
            >
              <!-- Close button -->
              <button
                @click.stop="showInfo = false"
                class="absolute top-3 right-3 w-7 h-7 rounded-full bg-foreground/10 hover:bg-foreground/20 border border-border flex items-center justify-center transition-colors shrink-0"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <!-- Title -->
              <p
                class="font-brand text-md font-bold uppercase tracking-widest mb-6 pr-8 shrink-0"
              >
                {{ file.titel }}
              </p>

              <div
                class="overflow-y-auto pr-2 space-y-6 flex-1 custom-scrollbar"
              >
                <div v-if="file.description && file.description !== ''">
                  <h4
                    class="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 border-b border-border pb-1"
                  >
                    {{ t("prints.description") }}
                  </h4>
                  <p
                    class="text-sm leading-relaxed text-muted-foreground break-words pt-1"
                  >
                    {{ file.description }}
                  </p>
                </div>

                <div
                  v-if="isLoadingProductions || linkedProductions.length"
                  class="flex flex-col"
                >
                  <h4
                    class="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4 border-b border-border pb-1"
                  >
                    {{ t("prints.relatedProductions") }}
                  </h4>

                  <div
                    v-if="isLoadingProductions"
                    class="text-xs text-muted-foreground animate-pulse py-1"
                  >
                    Loading productions...
                  </div>

                  <div
                    v-else-if="linkedProductions.length"
                    class="flex flex-col gap-4"
                  >
                    <ProductionListViewItem
                      v-for="prod in linkedProductions"
                      :key="prod.id"
                      :production-view="prod"
                      :is-admin="false"
                      @click="showInfo = false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

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

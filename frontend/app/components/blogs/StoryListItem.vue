<!--
  components/blogs/StoryListItem.vue
  ====================================
  Single story card. Receives a BlogView — all fields are already flat strings
  because the parent fetches with a lang param.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogStory } from "~/composables/blogs/useBlogStory";
import { useGallery } from "~/composables/media/useGallery";

const { getMainImageCrop } = useGallery();
const { getMediaGallery } = useBlogApi();
const { locale } = useI18n();

const props = defineProps<{ story: BlogView }>();
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const mainCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "hd_ready");
});

const { title, description, formattedDate } = useBlogStory(
  computed(() => props.story),
);

/**
 * Sanitizes raw text by removing escape characters.
 */
const cleanText = (text: string | null | undefined) => {
  if (!text) return "";
  return text.replace(/\\/g, "").trim();
};

const cleanDescription = computed(() => cleanText(description.value));

async function loadGallery() {
  if (!props.story?.id) return;
  gallery.value = await getMediaGallery(props.story.id, locale.value);
}

onMounted(() => {
  loadGallery();
});

watch(
  () => props.story.id,
  () => {
    loadGallery();
  },
);
</script>

<template>
  <article
    class="group flex overflow-hidden rounded-lg border transition-all duration-150 bg-white border-gray-200 hover:border-purple-400/60 dark:bg-[#1e2130]/60 dark:border-[#2e3347] dark:hover:border-purple-500/50 shadow-sm hover:shadow-md hover:shadow-purple-500/10 dark:shadow-none relative"
  >
    <!-- Purple left accent bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      aria-hidden="true"
    />

    <!-- Thumbnail -->
    <div
      class="w-32 sm:w-48 shrink-0 relative overflow-hidden rounded-lg"
      style="min-height: 84px"
    >
      <MediaDisplay
        :id="props.story.id"
        :src="mainCrop"
        :rounded="true"
        :show-icon="true"
      />
    </div>

    <!-- Text content -->
    <div
      class="flex-1 min-w-0 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4"
    >
      <div>
        <h3
          class="font-brand font-black text-sm sm:text-base uppercase tracking-tight leading-snug mb-1 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-150 text-gray-900 dark:text-gray-100"
        >
          {{ title }}
        </h3>

        <p
          v-if="cleanDescription"
          class="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400"
          v-html="cleanDescription"
        ></p>
      </div>

      <div class="flex items-center mt-3">
        <span
          v-if="formattedDate"
          class="flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest text-gray-400 dark:text-gray-500"
        >
          <svg
            class="w-3 h-3 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {{ formattedDate }}
        </span>
      </div>
    </div>
  </article>
</template>

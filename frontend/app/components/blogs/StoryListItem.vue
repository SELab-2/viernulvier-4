<!--
  components/blogs/StoryListItem.vue
  ====================================
  Single story card. Receives a BlogView — all fields are already flat strings
  because the parent fetches with a lang param.
  Description is rendered as HTML (v-html) to preserve editor formatting.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import { useBlogView } from "~/composables/blogs/useBlogView";

const { getMainImageCrop } = useGallery();
const { getMediaGallery } = useBlogApi();
const { useBlogStory } = useBlogView();
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

const cleanDescription = computed(() => cleanText(description.value));

async function loadGallery() {
  if (!props.story?.id) return;
  gallery.value = await getMediaGallery(props.story.id, locale.value);
}

onMounted(() => loadGallery());
watch(
  () => props.story.id,
  () => loadGallery(),
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
      <div class="overflow-hidden">
        <h3
          class="font-brand font-black text-sm sm:text-base uppercase tracking-tight leading-snug mb-1 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-150 text-gray-900 dark:text-gray-100 break-words"
        >
          {{ title }}
        </h3>

        <p
          v-if="cleanDescription"
          class="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400"
          v-html="cleanDescription"
        ></p>
      </div>

      <div class="flex items-center mt-2">
        <span
          v-if="formattedDate"
          class="flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest text-gray-400 dark:text-gray-500"
        >
          {{ formattedDate }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
/*
  Flatten all block-level elements inside the preview to inline so that
  the two-line clamp works cleanly across any HTML structure from the editor.
*/
.story-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.8rem;
  overflow: hidden;
  overflow-wrap: break-word;
  word-break: break-word;
}

.story-preview :deep(p),
.story-preview :deep(h1),
.story-preview :deep(h2),
.story-preview :deep(h3),
.story-preview :deep(h4),
.story-preview :deep(li),
.story-preview :deep(blockquote) {
  display: inline;
  margin: 0;
  padding: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
}

h3 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
}

.story-preview :deep(ul),
.story-preview :deep(ol) {
  display: inline;
  padding: 0;
  list-style: none;
}

.story-preview :deep(br) {
  display: none;
}
.story-preview :deep(hr) {
  display: none;
}

/* Preserve inline formatting */
.story-preview :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  pointer-events: none; /* list items aren't clickable, the card is */
}
.story-preview :deep(strong) {
  font-weight: 700;
}
.story-preview :deep(em) {
  font-style: italic;
}
.story-preview :deep(s) {
  text-decoration: line-through;
}
</style>

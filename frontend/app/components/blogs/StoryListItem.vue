<!--
  components/blogs/StoryListItem.vue
  =====================================
  Single story card used both on the public stories page and in the admin
  blog list. Pass `is-admin` to show edit/delete action buttons.

  The card intentionally has a fixed height so all list items align neatly.
  On hover the left accent bar fades in and the title turns purple.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import { useBlogView } from "~/composables/blogs/useBlogView";

const props = withDefaults(
  defineProps<{
    story: BlogView;
    isAdmin?: boolean;
    deleting?: boolean;
  }>(),
  {
    isAdmin: false,
    deleting: false,
  },
);

const emit = defineEmits<{
  (e: "delete"): void;
}>();

const { getMainImageCrop } = useGallery();
const { getMediaGallery } = useBlogApi();
const { useBlogStory } = useBlogView();
const { locale, t } = useI18n();

const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const mainCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "hd_ready") : null,
);

const { title, description, formattedDate } = useBlogStory(
  computed(() => props.story),
);

// Truncate so all cards stay the same height regardless of title length.
const MAX_TITLE_CHARS = 80;
const displayTitle = computed(() => {
  const t = title.value;
  if (t.length <= MAX_TITLE_CHARS) return t;
  const cut = t.slice(0, MAX_TITLE_CHARS).replace(/\s+\S*$/, "");
  return cut + "…";
});

const cleanDescription = computed(() => cleanText(description.value));

async function loadGallery() {
  if (!props.story?.id) return;
  try {
    gallery.value = await getMediaGallery(props.story.id, locale.value);
  } catch {
    gallery.value = null;
  }
}

onMounted(loadGallery);
watch(() => props.story.id, loadGallery);
</script>

<template>
  <article
    class="group flex overflow-hidden rounded-lg border transition-all duration-150 relative"
    :class="[
      isAdmin
        ? 'h-auto min-h-[88px] bg-card border-card-border hover:bg-card-hover'
        : 'h-[120px] sm:h-[136px] bg-white border-gray-200 hover:border-purple-400/60 dark:bg-[#1e2130]/60 dark:border-[#2e3347] dark:hover:border-purple-500/50 shadow-sm hover:shadow-md hover:shadow-purple-500/10 dark:shadow-none',
    ]"
  >
    <!-- Purple left accent bar (public view only) -->
    <div
      v-if="!isAdmin"
      class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      aria-hidden="true"
    />

    <!-- Thumbnail -->
    <div
      class="shrink-0 self-stretch relative overflow-hidden"
      :class="isAdmin ? 'w-24 h-16 my-auto ml-3 rounded-lg' : 'w-36 sm:w-52'"
    >
      <MediaDisplay
        :id="story.id"
        :src="mainCrop"
        :rounded="isAdmin"
        :show-icon="true"
        size="fill"
      />
    </div>

    <!-- Text content -->
    <div
      class="flex-1 min-w-0 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4"
    >
      <div class="overflow-hidden">
        <h3
          class="font-brand font-black text-sm sm:text-base uppercase tracking-tight leading-snug mb-1 transition-colors duration-150 break-words"
          :class="
            isAdmin
              ? 'text-card-foreground group-hover:text-accent'
              : 'text-gray-900 dark:text-gray-100 group-hover:text-purple-500 dark:group-hover:text-purple-400'
          "
        >
          {{ displayTitle }}
        </h3>

        <p
          v-if="cleanDescription && !isAdmin"
          class="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400"
          v-html="cleanDescription"
        />
      </div>

      <div class="flex items-center justify-between mt-2">
        <span
          v-if="formattedDate"
          class="text-[9px] font-brand font-black uppercase tracking-widest text-gray-400 dark:text-gray-500"
        >
          {{ formattedDate }}
        </span>

        <!-- Admin action buttons -->
        <div v-if="isAdmin" class="flex items-center gap-2 shrink-0 ml-auto">
          <AdminEditButton
            :label="t('admin.edit')"
            :size="34"
            @click="navigateTo(ROUTES.admin.stories.edit(story.id))"
          />
          <AdminDeleteButton
            :label="deleting ? '…' : t('admin.delete')"
            :size="34"
            @click="emit('delete')"
          />
        </div>
      </div>
    </div>
  </article>
</template>

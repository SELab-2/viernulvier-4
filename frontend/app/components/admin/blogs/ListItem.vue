<!--
  components/admin/blogs/ListItem.vue
  This component renders a single blog entry within the admin blog list.

    It displays a compact overview of a blog post, including:
    - The main (cropped) image from the blog’s media gallery
    - The localized title based on the current language
    - A formatted publication date (if available)

    The component automatically:
    - Fetches and updates the blog’s media gallery on mount and when the blog ID changes
    - Extracts the appropriate image crop for display
    - Adapts content to the active locale

    It also provides actions for:
    - Navigating to the edit page of the blog post
    - Triggering deletion via an emitted event

    Designed for use in admin lists where multiple blog items are displayed.
-->
<script setup lang="ts">
import type { BlogView } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogStory } from "~/composables/blogs/useBlogStory";
import { useGallery } from "~/composables/media/useGallery";

const props = defineProps<{
  blog: BlogView;
  deleting?: boolean;
}>();

const emit = defineEmits<{ (e: "delete"): void }>();

const { getMediaGallery } = useBlogApi();
const { getMainImageCrop } = useGallery();
const { locale, t } = useI18n();

const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);

const mainCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "hd_ready") : null,
);

async function loadGallery() {
  try {
    gallery.value = await getMediaGallery(props.blog.id, locale.value);
  } catch {
    gallery.value = null;
  }
}

onMounted(loadGallery);
watch(() => props.blog.id, loadGallery);

const { title, formattedDate } = useBlogStory(computed(() => props.blog));
</script>

<template>
  <article
    class="flex items-center gap-4 rounded-xl border border-card-border bg-card px-4 py-3 hover:bg-card-hover transition-colors"
  >
    <div class="w-24 h-16 shrink-0 rounded-lg overflow-hidden">
      <MediaDisplay
        :id="blog.id"
        :src="mainCrop"
        size="sm"
        :rounded="true"
        :show-icon="true"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-card-foreground truncate">
        {{ title || "—" }}
      </p>
      <p
        v-if="formattedDate"
        class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground mt-0.5"
      >
        {{ formattedDate }}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <AdminEditButton
        :label="t('admin.edit')"
        :size="36"
        @click="navigateTo(ROUTES.admin.stories.edit(blog.id))"
      />

      <AdminDeleteButton
        :label="deleting ? '…' : t('admin.delete')"
        :size="36"
        :disabled="deleting"
        @click="emit('delete')"
      />
    </div>
  </article>
</template>

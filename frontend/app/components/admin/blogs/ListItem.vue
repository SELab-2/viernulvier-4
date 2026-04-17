<!--
  components/admin/blogs/ListItem.vue
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

<!--
  components/admin/blogs/ListItem.vue

  Single blog row.  Mirrors the public StoryListItem (thumbnail + date + title)
  but adds Edit / Delete action buttons.

  Props:
    blog      — BlogView (flat strings, already localised by ListView)
    deleting  — shows a spinner while the parent is deleting this row

  Emits:
    delete  — parent handles the actual API call
-->
<script setup lang="ts">
import type { BlogView } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogStory } from "~/composables/blogs/useBlogStory";
import { useGallery } from "~/composables/media/useGallery";

// ── Props & emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  blog: BlogView; // ← MUST match what ListView sends (:blog="…")
  deleting?: boolean;
}>();

const emit = defineEmits<{ (e: "delete"): void }>();

// ── Composables ──────────────────────────────────────────────────────────────
const { getMediaGallery } = useBlogApi();
const { getMainImageCrop } = useGallery();
const { locale, t } = useI18n();

// ── Gallery / crop ───────────────────────────────────────────────────────────
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);

const mainCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "hd_ready") : null,
);

// getMediaGallery returns GalleryWithItems | null directly (not ApiResponse)
async function loadGallery() {
  gallery.value = await getMediaGallery(props.blog.id, locale.value);
}

onMounted(loadGallery);
watch(() => props.blog.id, loadGallery);

// ── Derived display values ───────────────────────────────────────────────────
// useBlogStory expects a BlogView — pass it directly via computed
const { title, formattedDate } = useBlogStory(computed(() => props.blog));
</script>

<template>
  <article
    class="flex items-center gap-4 rounded-xl border border-card-border bg-card px-4 py-3 hover:bg-card-hover transition-colors"
  >
    <!-- Thumbnail -->
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

    <!-- Text -->
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

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <NuxtLink
        :to="ROUTES.admin.stories.edit(blog.id)"
        class="inline-flex items-center rounded-md border-2 border-action-blue-border text-action-blue-icon hover:bg-action-blue-hover transition-colors px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
      >
        {{ t("admin.edit") }}
      </NuxtLink>

      <button
        :disabled="deleting"
        class="inline-flex items-center rounded-md border-2 border-action-red-border text-action-red-icon hover:bg-action-red-hover disabled:opacity-40 transition-colors px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
        @click="emit('delete')"
      >
        {{ deleting ? "…" : t("admin.delete") }}
      </button>
    </div>
  </article>
</template>

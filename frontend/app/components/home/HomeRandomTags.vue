<!-- components/home/HomeRandomTags.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useTagApi } from "~/composables/useTagApi";
import { Tag } from "lucide-vue-next";
import type { TagView } from "@repo/common";
const { getAll } = useTagApi();
const router = useRouter();
const { locale } = useI18n();
const { tagIds } = useArchiveView();

const randomTags = ref<TagView[]>([]);

async function loadRandomTags() {
  try {
    // We only need to fetch the first page (limit 100) to get a healthy pool of tags to randomize
    const resp = await getAll({
      paginationFilters: { page: 0, limit: 100, descending: false },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    if (resp.data) {
      // Filter out invalid placeholder tags
      const validTags = resp.data.objects.filter((tag) => tag.tag !== "N/A");

      // Shuffle the array and slice the first 5 for the home page
      const shuffled = validTags.sort(() => 0.5 - Math.random());
      randomTags.value = shuffled.slice(0, 15);
    }
  } catch (err) {
    console.error("Failed to load tags for home page", err);
  }
}

// Route to the archive page with the tag ID in the query string
function goToTag(tagId: number) {
  tagIds.value = [tagId];
  router.push({ path: "/productions" });
}

onMounted(loadRandomTags);

// Refetch if the user switches languages
watch(locale, loadRandomTags);
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex items-center gap-2 text-muted-foreground border-b border-border/30 pb-2"
    >
      <Tag :size="14" stroke-width="3" class="text-accent" />
      <span class="font-brand text-[10px] font-black uppercase tracking-widest">
        Ontdek Thema's
      </span>
    </div>

    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="tag in randomTags"
        :key="tag.id"
        class="h-8 px-4 rounded-full border border-border/50 bg-muted/20 text-[9px] font-brand font-black uppercase tracking-widest text-foreground transition-all hover:border-accent hover:bg-accent/10 hover:text-accent focus:ring-2 focus:ring-accent/50 outline-none"
        @click="goToTag(tag.id)"
      >
        {{ tag.tag }}
      </button>
    </div>
  </div>
</template>

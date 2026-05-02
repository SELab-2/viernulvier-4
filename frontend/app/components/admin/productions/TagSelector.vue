<!--
  components/admin/productions/TagSelector.vue

  Adapted from TagFilter.vue for use in the admin production form flow.
  Instead of reading/writing to useArchiveView, it manages its own selected
  state and calls addTag / removeTag on the production directly.

  Props:
    productionId  — the production to link tags to
    initialTagIds — tag IDs already linked (for edit mode)
-->
<script setup lang="ts">
import type { TagView, PaginatedResponse } from "@repo/common";

const props = defineProps<{
  productionId: number;
  initialTagIds?: number[];
}>();

const { t, locale } = useI18n();
const { getAll } = useTagApi();
const { addTag, removeTag } = useProductionApi();

const tags = ref<TagView[]>([]);
const selectedIds = ref<number[]>([...(props.initialTagIds ?? [])]);
const isLoading = ref(true);
const pendingIds = ref<Set<number>>(new Set());

const hasSelection = computed(() => selectedIds.value.length > 0);

// ─── Fetch all tags ───────────────────────────────────────────────────────────
async function fetchTags() {
  isLoading.value = true;
  try {
    const allTags: TagView[] = [];
    let page = 0;
    const limit = 100;
    let totalPages = 1;

    do {
      const resp = await getAll({
        paginationFilters: { page, limit, descending: false },
        languageFilters: { lang: locale.value as "nl" | "en" },
      });

      if (!resp.data) break;

      const data = resp.data as PaginatedResponse<TagView>;
      allTags.push(...data.objects.filter((t) => t.tag !== "N/A"));

      totalPages = Math.ceil(data.totalItems / limit);
      page += 1;
    } while (page < totalPages);

    tags.value = allTags;
  } catch (err) {
    console.error("Failed to fetch tags", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchTags);
watch(locale, fetchTags);

// ─── Toggle a tag (optimistic UI + API call) ──────────────────────────────────
async function toggle(id: number) {
  if (pendingIds.value.has(id)) return;
  pendingIds.value.add(id);

  const isSelected = selectedIds.value.includes(id);

  if (isSelected) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }

  try {
    if (isSelected) {
      await removeTag(props.productionId, id);
    } else {
      await addTag(props.productionId, id);
    }
  } catch {
    // rollback
    if (isSelected) {
      selectedIds.value = [...selectedIds.value, id];
    } else {
      selectedIds.value = selectedIds.value.filter((i) => i !== id);
    }
  } finally {
    pendingIds.value.delete(id);
  }
}

async function clearAll() {
  const toRemove = [...selectedIds.value];
  selectedIds.value = [];
  await Promise.allSettled(
    toRemove.map((id) => removeTag(props.productionId, id)),
  );
}

const isSelected = (id: number) => selectedIds.value.includes(id);
const isPending = (id: number) => pendingIds.value.has(id);
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="flex flex-wrap gap-2">
      <div
        v-for="i in 12"
        :key="i"
        class="h-8 rounded-full bg-muted animate-pulse"
        :style="{ width: `${60 + (i % 4) * 20}px` }"
      />
    </div>

    <div v-else class="flex flex-wrap gap-2 items-center">
      <!-- Tag pills -->
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="h-8 px-3 rounded-full border text-[9px] font-brand font-black uppercase tracking-widest transition-all"
        :class="[
          isPending(tag.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer',
          isSelected(tag.id)
            ? 'bg-accent text-accent-foreground border-accent'
            : 'bg-accent/10 text-accent border-border hover:border-accent',
        ]"
        :disabled="isPending(tag.id)"
        @click="toggle(tag.id)"
      >
        {{ tag.tag }}
      </button>

      <!-- Clear all -->
      <button
        v-if="hasSelection"
        class="h-8 px-3 rounded-full text-[9px] font-brand font-black uppercase tracking-widest border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-all"
        @click="clearAll"
      >
        {{ t("archive.clear_tags", "Clear") }} ({{ selectedIds.length }})
      </button>
    </div>
  </div>
</template>

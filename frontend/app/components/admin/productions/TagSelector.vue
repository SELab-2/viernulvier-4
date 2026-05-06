<!--
  components/admin/productions/TagSelector.vue

  Fully local tag selector — no API calls happen here.
  Selected tags are emitted upward and persisted only when finish() is called.

  Features:
  - Shows all available tags (no show-more pagination needed in admin context)
  - Toggle select/deselect
  - Inline "create new tag" input
  - Emits @change with the full array of selected TagItem objects

  Props:
    selected     — current selected tags (controlled from parent via composable)
    mode         — 'create' | 'edit' (for showing reset button)
  Emits:
    change       — TagItem[] whenever selection changes
    reset        — user clicked the reset button
-->
<script setup lang="ts">
import type { TagView, PaginatedResponse } from "@repo/common";
import type { TagItem } from "~/composables/productions/useProductionForm";
import { Plus, X, RotateCcw } from "lucide-vue-next";

const props = defineProps<{
  selected: TagItem[];
  mode: "create" | "edit";
}>();

const emit = defineEmits<{
  change: [TagItem[]];
  reset: [];
}>();

const { t, locale } = useI18n();
const { getAll } = useTagApi();

const availableTags = ref<TagView[]>([]);
const isLoading = ref(true);
const newTagInput = ref("");
const showNewTagInput = ref(false);
const newTagInputRef = ref<HTMLInputElement | null>(null);

// ─── Fetch all available tags ────────────────────────────────────────────────
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
      allTags.push(...data.objects.filter((t) => t.tag && t.tag !== "N/A"));
      totalPages = Math.ceil(data.totalItems / limit);
      page += 1;
    } while (page < totalPages);

    availableTags.value = allTags;
  } catch (err) {
    console.error("Failed to fetch tags", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchTags);
watch(locale, fetchTags);

// ─── Toggle an existing tag ──────────────────────────────────────────────────
function toggle(tag: TagView) {
  const current = [...props.selected];
  const idx = current.findIndex((t) => t.id === tag.id);
  if (idx === -1) {
    emit("change", [...current, { id: tag.id, tag: tag.tag }]);
  } else {
    current.splice(idx, 1);
    emit("change", current);
  }
}

const isSelected = (id: number) => props.selected.some((t) => t.id === id);

// ─── Create a new tag (local only until finish) ──────────────────────────────
function openNewTagInput() {
  showNewTagInput.value = true;
  nextTick(() => newTagInputRef.value?.focus());
}

function confirmNewTag() {
  const label = newTagInput.value.trim();
  if (!label) {
    showNewTagInput.value = false;
    return;
  }

  // Check for duplicates (case-insensitive)
  const exists = [
    ...availableTags.value.map((t) => t.tag.toLowerCase()),
    ...props.selected.filter((t) => t.isNew).map((t) => t.tag.toLowerCase()),
  ].includes(label.toLowerCase());

  if (!exists) {
    // Use a temporary negative ID to distinguish from real IDs
    const tempId = -Date.now();
    emit("change", [
      ...props.selected,
      { id: tempId, tag: label, isNew: true },
    ]);
  }

  newTagInput.value = "";
  showNewTagInput.value = false;
}

function cancelNewTag() {
  newTagInput.value = "";
  showNewTagInput.value = false;
}

function removeNewTag(id: number) {
  emit(
    "change",
    props.selected.filter((t) => t.id !== id),
  );
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <p
        class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ t("admin.productions.tags.available", "Available tags") }}
      </p>
      <div class="flex items-center gap-2">
        <!-- Reset button (edit mode only) -->
        <button
          v-if="mode === 'edit'"
          class="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
          @click="emit('reset')"
        >
          <RotateCcw :size="10" stroke-width="3" />
          {{ t("admin.productions.reset", "Reset") }}
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="flex flex-wrap gap-2">
      <div
        v-for="i in 16"
        :key="i"
        class="h-8 rounded-full bg-muted animate-pulse"
        :style="{ width: `${60 + (i % 5) * 18}px` }"
      />
    </div>

    <template v-else>
      <!-- All available tags -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in availableTags"
          :key="tag.id"
          class="h-8 px-3 rounded-full border text-[9px] font-brand font-black uppercase tracking-widest transition-all"
          :class="
            isSelected(tag.id)
              ? 'bg-accent text-accent-foreground border-accent'
              : 'bg-accent/10 text-accent border-border hover:border-accent'
          "
          @click="toggle(tag)"
        >
          {{ tag.tag }}
        </button>

        <!-- New tag button -->
        <button
          v-if="!showNewTagInput"
          class="h-8 px-3 rounded-full border border-dashed border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-all flex items-center gap-1.5"
          @click="openNewTagInput"
        >
          <Plus :size="10" stroke-width="3" />
          {{ t("admin.productions.tags.createNew", "New tag") }}
        </button>

        <!-- Inline new tag input -->
        <div
          v-if="showNewTagInput"
          class="flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-accent bg-accent/10"
        >
          <input
            ref="newTagInputRef"
            v-model="newTagInput"
            class="bg-transparent outline-none text-[9px] font-black uppercase tracking-widest text-accent w-24 placeholder:text-accent/40"
            :placeholder="
              t('admin.productions.tags.newPlaceholder', 'Tag name…')
            "
            @keydown.enter="confirmNewTag"
            @keydown.escape="cancelNewTag"
          />
          <button
            class="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center hover:opacity-80 transition-opacity"
            @click="confirmNewTag"
          >
            <Plus :size="9" stroke-width="3" />
          </button>
          <button
            class="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            @click="cancelNewTag"
          >
            <X :size="9" stroke-width="3" />
          </button>
        </div>
      </div>

      <!-- Selected new tags (isNew = not yet in DB) -->
      <div
        v-if="selected.some((t) => t.isNew)"
        class="pt-2 border-t border-border"
      >
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2"
        >
          {{
            t(
              "admin.productions.tags.newTags",
              "New tags (will be created on finish)",
            )
          }}
        </p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in selected.filter((t) => t.isNew)"
            :key="tag.id"
            class="h-8 pl-3 pr-2 rounded-full border border-dashed border-accent bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            {{ tag.tag }}
            <button
              class="w-4 h-4 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors"
              @click="removeNewTag(tag.id)"
            >
              <X :size="8" stroke-width="3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Selection summary -->
      <div
        v-if="selected.length > 0"
        class="flex items-center justify-between pt-1"
      >
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ selected.length }}
          {{ t("admin.productions.tags.selected", "selected") }}
        </p>
        <button
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          @click="emit('change', [])"
        >
          {{ t("archive.clear_tags", "Clear all") }}
        </button>
      </div>
    </template>
  </div>
</template>

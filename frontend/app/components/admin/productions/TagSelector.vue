<!--
  components/admin/productions/TagSelector.vue

  Pure display component for tag selection.
  All state lives in the useProductionTags composable — this component
  only reads the draft and emits mutations upward via @change.

  Props:
    selected  — current ProductionTagItem[] draft from the composable
  Emits:
    change    — ProductionTagItem[] whenever selection changes
-->
<script setup lang="ts">
import type { TagView, PaginatedResponse } from "@repo/common";
import type {
  ProductionTagItem,
  ExistingTag,
  NewTag,
} from "~/composables/productions/steps/productionTags";
import { Plus, X } from "lucide-vue-next";

const props = defineProps<{
  selected: ProductionTagItem[];
}>();

const emit = defineEmits<{
  change: [ProductionTagItem[]];
}>();

const { t, locale } = useI18n();
const { getAll } = useTagApi();

const availableTags = ref<TagView[]>([]);
const isLoading = ref(true);

const newTagNL = ref("");
const newTagEN = ref("");
const isInputtingEN = ref(false);
const showNewTagInput = ref(false);
const newTagInputRefNL = ref<HTMLInputElement | null>(null);
const newTagInputRefEN = ref<HTMLInputElement | null>(null);

// ─── Fetch all available tags ─────────────────────────────────────────────────
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

// ─── Toggle an existing tag ───────────────────────────────────────────────────
function toggle(tag: TagView) {
  const current = [...props.selected];
  const idx = current.findIndex(
    (t): t is ExistingTag => t.type === "existing" && t.id === tag.id,
  );

  if (idx === -1) {
    emit("change", [
      ...current,
      { type: "existing", id: tag.id, label: tag.tag } satisfies ExistingTag,
    ]);
  } else {
    current.splice(idx, 1);
    emit("change", current);
  }
}

const isSelected = (id: number) =>
  props.selected.some(
    (t): t is ExistingTag => t.type === "existing" && t.id === id,
  );

// ─── Create a new tag (local-only until finish) ───────────────────────────────
function openNewTagInput() {
  showNewTagInput.value = true;
  isInputtingEN.value = false;
  nextTick(() => newTagInputRefNL.value?.focus());
}

function nextStage() {
  if (!newTagNL.value.trim()) {
    cancelNewTag();
    return;
  }
  isInputtingEN.value = true;
  nextTick(() => newTagInputRefEN.value?.focus());
}

function confirmNewTag() {
  const nl = newTagNL.value.trim();
  const en = newTagEN.value.trim(); // Optional, fallback handled in orchestrator

  if (!nl) {
    cancelNewTag();
    return;
  }

  const allLabels = [
    ...availableTags.value.map((t) => t.tag.toLowerCase()),
    ...props.selected
      .filter((t): t is NewTag => t.type === "new")
      .map((t) => t.label.nl.toLowerCase()),
  ];

  if (!allLabels.includes(nl.toLowerCase())) {
    emit("change", [
      ...props.selected,
      { type: "new", label: { nl, en } } satisfies NewTag,
    ]);
  }

  newTagNL.value = "";
  newTagEN.value = "";
  isInputtingEN.value = false;
  showNewTagInput.value = false;
}

function cancelNewTag() {
  newTagNL.value = "";
  newTagEN.value = "";
  isInputtingEN.value = false;
  showNewTagInput.value = false;
}

function removeNewTag(labelNL: string) {
  emit(
    "change",
    props.selected.filter(
      (t): boolean => !(t.type === "new" && t.label.nl === labelNL),
    ),
  );
}

const newTags = computed(() =>
  props.selected.filter((t): t is NewTag => t.type === "new"),
);
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <p
      class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
    >
      {{ t("admin-productions.tags.available") }}
    </p>

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
      <!-- Available tags + new tag button/input -->
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

        <!-- New tag trigger -->
        <button
          v-if="!showNewTagInput"
          class="h-8 px-3 rounded-full border border-dashed border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-all flex items-center gap-1.5"
          @click="openNewTagInput"
        >
          <Plus :size="10" stroke-width="3" />
          {{ t("admin-productions.tags.createNew") }}
        </button>

        <!-- Inline new tag input -->
        <div
          v-if="showNewTagInput"
          class="flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-accent bg-accent/10"
        >
          <template v-if="!isInputtingEN">
            <input
              ref="newTagInputRefNL"
              v-model="newTagNL"
              class="bg-transparent outline-none text-[9px] font-black uppercase tracking-widest text-accent w-24 placeholder:text-accent/40"
              :placeholder="
                t('admin-productions.tags.newPlaceholderNL', 'NL NAME')
              "
              @keydown.enter="nextStage"
              @keydown.escape="cancelNewTag"
            />
            <button
              class="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              @click="nextStage"
            >
              <Plus :size="9" stroke-width="3" />
            </button>
          </template>
          <template v-else>
            <input
              ref="newTagInputRefEN"
              v-model="newTagEN"
              class="bg-transparent outline-none text-[9px] font-black uppercase tracking-widest text-accent w-24 placeholder:text-accent/40"
              :placeholder="
                t('admin-productions.tags.newPlaceholderEN', 'EN (OPTIONAL)')
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
          </template>
          <button
            class="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            @click="cancelNewTag"
          >
            <X :size="9" stroke-width="3" />
          </button>
        </div>
      </div>

      <!-- Pending new tags (not yet in DB) -->
      <div v-if="newTags.length > 0" class="pt-2 border-t border-border">
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2"
        >
          {{ t("admin-productions.tags.newTags") }}
        </p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in newTags"
            :key="tag.label.nl"
            class="h-8 pl-3 pr-2 rounded-full border border-dashed border-accent bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            {{ tag.label.nl }}
            <span v-if="tag.label.en">/ {{ tag.label.en }}</span>
            <button
              class="w-4 h-4 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors"
              @click="removeNewTag(tag.label.nl)"
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
          {{ t("admin-productions.tags.selected") }}
        </p>
        <button
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          @click="emit('change', [])"
        >
          {{ t("admin-productions.tags.clearTags") }}
        </button>
      </div>
    </template>
  </div>
</template>

<!--
  components/admin/productions/Preview.vue

  Live preview that mirrors the public /productions/[id] page exactly.

  Props:
    core    — draft ref from useProductionCore  (ProductionCoreForm)
    tags    — draft ref from useProductionTags  (ProductionTagsForm)
    events  — draft ref from useProductionEvents (ProductionEventsForm)
    series  — draft ref from useProductionSeries (ProductionSeriesForm)
    media   — draft ref from useProductionMedia  (ProductionMediaForm)  [optional]

  Usage in FormPage.vue:
    <AdminProductionsPreview
      :core="(form.steps[0].draft.value as ProductionCoreForm)"
      :tags="(form.steps[1].draft.value as ProductionTagsForm)"
      :media="(form.steps[2].draft.value as ProductionMediaForm)"
      :events="(form.steps[3].draft.value as ProductionEventsForm)"
      :series="(form.steps[4].draft.value as ProductionSeriesForm)"
    />
-->
<script setup lang="ts">
import { Smartphone, Monitor, ArrowUp, ChevronLeft } from "lucide-vue-next";
import { cleanText } from "~/utils/formatters";
import type { ProductionCoreForm } from "~/composables/productions/steps/productionCore";
import type { ProductionTagsForm } from "~/composables/productions/steps/productionTags";
import type {
  ProductionEventsForm,
  EventDraft,
} from "~/composables/productions/steps/productionEvents";
import type { ProductionSeriesForm } from "~/composables/productions/steps/productionSeries";
import type {
  ProductionMediaForm,
  MediaItemDraft,
} from "~/composables/productions/steps/productionMedia";
import type { MediaCrop } from "@repo/common";

type ActiveMediaItemDraft = Extract<MediaItemDraft, { crops: unknown }>;

// ─── Props ─────────────────────────────────────────────────────────────────────

const props = defineProps<{
  core: ProductionCoreForm;
  tags?: ProductionTagsForm;
  events?: ProductionEventsForm;
  series?: ProductionSeriesForm;
  media?: ProductionMediaForm;
}>();

// ─── i18n ──────────────────────────────────────────────────────────────────────

const { t } = useI18n();

// ─── Preview controls ──────────────────────────────────────────────────────────

const previewLang = ref<"nl" | "en">("nl");
const previewMode = ref<"phone" | "desktop">("phone");

// ─── Derived display values ────────────────────────────────────────────────────

/**
 * Resolve a per-locale nullable string from the core draft.
 * Falls back to NL when EN is empty, which matches the public page's i18n fallback.
 */
function get(key: keyof ProductionCoreForm["nl"]): string {
  const val = props.core[previewLang.value][key];
  if (val && String(val).trim()) return String(val).trim();
  // Fallback to NL
  const nlVal = props.core.nl[key];
  return nlVal ? String(nlVal).trim() : "";
}

/**
 * Mirrors the public page's isValid helper — filters out empty / "N/A" strings.
 */
function isValid(val: string | null | undefined): boolean {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s !== "" && s !== "N/A" && s !== "UNDEFINED";
}

const title = computed(
  () => get("titel") || t("admin-productions.preview.title"),
);
const artist = computed(() => get("artist"));
const tagline = computed(() => get("tagline"));
const credits = computed(() => get("credits"));
const fullDescription = computed(() => cleanText(get("description1")) || "");
const description2Raw = computed(() => get("description2"));

// Tags: filter out blanks (mirrors [id].vue: `t.tag.trim().length > 1`)
const visibleTags = computed(() =>
  (props.tags ?? []).filter((tag) => {
    const label =
      tag.type === "new"
        ? tag.label[previewLang.value] || tag.label.nl
        : tag.label;
    return label && String(label).trim().length > 1;
  }),
);

function tagLabel(tag: ProductionTagsForm[number]): string {
  if (tag.type === "new") {
    return tag.label[previewLang.value] || tag.label.nl || "";
  }
  return tag.label;
}

// Series: only non-deleted items
const visibleSeries = computed(() =>
  (props.series ?? []).filter((s) => s.type === "existing" || s.type === "new"),
);

function seriesLabel(s: ProductionSeriesForm[number]): string {
  return s.titel[previewLang.value] || s.titel.nl || "";
}

// Events: only non-deleted events that have a starttime (mirrors [id].vue logic)
const visibleEvents = computed((): EventDraft[] =>
  (props.events ?? []).filter((e): e is EventDraft => {
    if (e.kind === "existing" && e.deleted) return false;
    return !(e.kind === "new" && (!e.starttime || e.starttime.trim() === ""));
  }),
);

// Determines whether the draft currently contains a usable main header image.
const hasHeaderImage = computed(() => !!headerImage.value);

const headerImage = computed<MediaCrop | null>(() => {
  if (!props.media) return null;

  const mainItem = props.media.items.find(
    (item): item is ActiveMediaItemDraft => {
      if (item.kind === "existing" && item.deleted) {
        return false;
      }

      return item.position === "main" && "crops" in item;
    },
  );

  if (!mainItem) return null;

  const crop = mainItem.crops.FE3_header;

  if (!crop || crop.type === "empty") {
    return null;
  }

  // Existing persisted crop
  if (crop.type === "existing") {
    return {
      id: crop.id,
      name: "FE3_header",
      url: crop.url,
      created_at: "",
      updated_at: "",
    };
  }

  // Newly uploaded / replaced crop
  if (crop.type === "new" || crop.type === "replaced") {
    return {
      id: -1,
      name: "FE3_header",
      url: URL.createObjectURL(crop.file),
      created_at: "",
      updated_at: "",
    };
  }

  return null;
});

const hasContent = computed(() =>
  [title.value, artist.value, tagline.value, fullDescription.value].some(
    Boolean,
  ),
);

// ─── Scroll-to-top FAB ─────────────────────────────────────────────────────────

const scrollArea = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

function handleScroll() {
  if (!scrollArea.value) return;
  showScrollTop.value = scrollArea.value.scrollTop > 200;
}
function scrollToTop() {
  scrollArea.value?.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Read-more (mirrors [id].vue expand behaviour) ─────────────────────────────

const isExpanded = ref(false);
const isExpanded2 = ref(false);

// Reset expand state whenever the language switches (content changes)
watch(previewLang, () => {
  isExpanded.value = false;
  isExpanded2.value = false;
});

// ─── Simple date formatter (mirrors ProductionEventTable display) ──────────────

function formatDatetime(dt: string | null): string {
  if (!dt) return "—";
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;

    return new Intl.DateTimeFormat(
      previewLang.value === "nl" ? "nl-BE" : "en-GB",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(d);
  } catch {
    return dt;
  }
}

function eventLocation(e: EventDraft): string {
  if (e.kind === "existing" && e.deleted) return "";
  const loc = (e as Extract<EventDraft, { deleted?: false }>).location;
  if (!loc) return "";

  if (loc.type === "new") {
    return loc.label[previewLang.value] || loc.label.nl || "";
  }
  return loc.label;
}
</script>

<template>
  <div class="flex flex-col gap-3 select-none">
    <!-- ── Controls bar ─────────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-xl border border-border"
    >
      <!-- Device toggle -->
      <div
        class="flex items-center gap-0.5 bg-background border border-border rounded-lg p-0.5"
      >
        <button
          v-for="mode in ['phone', 'desktop'] as const"
          :key="mode"
          class="p-1.5 rounded-md transition-all"
          :class="
            previewMode === mode
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          :title="mode === 'phone' ? 'Mobile' : 'Desktop'"
          @click="previewMode = mode"
        >
          <Smartphone v-if="mode === 'phone'" :size="13" />
          <Monitor v-else :size="13" />
        </button>
      </div>

      <!-- Language toggle -->
      <div class="flex items-center gap-2">
        <span
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.preview.preview") }}
        </span>
        <div
          class="inline-flex bg-background border border-border rounded-lg p-0.5 overflow-hidden"
        >
          <button
            v-for="lang in ['nl', 'en'] as const"
            :key="lang"
            class="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
            :class="
              previewLang === lang
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="previewLang = lang"
          >
            {{ lang }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Device shell ─────────────────────────────────────────────────────── -->
    <div
      class="relative mx-auto transition-all duration-500 ease-in-out border border-border bg-white dark:bg-[#1e2230] shadow-2xl ring-1 ring-inset ring-foreground/5 overflow-hidden h-[640px]"
      :class="
        previewMode === 'phone'
          ? 'w-full max-w-[375px] rounded-[3rem] p-3'
          : 'w-full rounded-2xl'
      "
    >
      <!-- Phone notch -->
      <div
        v-if="previewMode === 'phone'"
        class="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-background rounded-b-2xl z-30"
      />

      <div
        ref="scrollArea"
        class="h-full w-full overflow-y-auto overflow-x-hidden relative preview-scroll"
        :class="previewMode === 'phone' ? 'rounded-[2.2rem]' : 'rounded-xl'"
        @scroll="handleScroll"
      >
        <!-- ════════════════════════════════════════════════════════════════════
             HERO — mirrors [id].vue <section class="relative h-[400px] …">
             ════════════════════════════════════════════════════════════════ -->
        <section
          class="relative flex items-end overflow-hidden shrink-0 bg-muted"
          :class="[
            previewMode === 'phone' ? 'h-52' : 'h-72',
            hasHeaderImage ? 'image-overlay text-white' : '',
          ]"
        >
          <!-- Header image from current media draft -->
          <MediaDisplay
            :src="headerImage"
            size="fill"
            :show-icon="false"
            :show-border="false"
            :rounded="false"
            class="absolute inset-0 w-full h-full object-cover z-0"
          />

          <!-- Gradient overlay (always present, same as [id].vue image-overlay) -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70 z-[1]"
          />

          <!-- Content positioned at bottom-left, mirrors [id].vue page-container pb-12 -->
          <div class="relative z-10 px-5 pb-5 w-full">
            <!-- Back button row + performer type — mirrors [id].vue exactly -->
            <div class="flex items-center gap-3 mb-4">
              <span
                :class="hasHeaderImage ? 'text-white' : 'text-foreground'"
                class="flex items-center gap-1 text-[9px] font-black uppercase tracking-[2px] opacity-60"
              >
                <ChevronLeft :size="11" stroke-width="3" />
                {{ t("general.back") }}
              </span>

              <span
                v-if="isValid(core[previewLang].artist)"
                :class="
                  hasHeaderImage
                    ? 'border-white text-white'
                    : 'border-foreground text-foreground'
                "
                class="border border-[1.5px] px-2 py-0.5 text-[8px] font-black uppercase rounded-sm"
              >
                <!-- performer_type not part of draft, show artist as type hint if distinct from title -->
                {{ core[previewLang].artist }}
              </span>
            </div>

            <!-- Title — mirrors [id].vue dynamic font-size logic -->
            <h1
              class="font-brand font-black uppercase italic leading-[0.88] tracking-[-2px]"
              :class="[
                hasHeaderImage ? 'text-white' : 'text-foreground',
                previewMode === 'phone'
                  ? title.length > 30
                    ? 'text-2xl'
                    : 'text-3xl'
                  : title.length > 35
                    ? 'text-3xl'
                    : title.length > 25
                      ? 'text-4xl'
                      : 'text-5xl',
              ]"
            >
              {{ title }}
            </h1>

            <!-- Artist — mirrors [id].vue `production.artist !== production.titel` guard -->
            <p
              v-if="isValid(artist) && artist !== title"
              class="mt-1.5 font-medium opacity-80"
              :class="[
                hasHeaderImage ? 'text-white' : 'text-foreground',
                previewMode === 'phone' ? 'text-sm' : 'text-lg',
              ]"
            >
              {{ artist }}
            </p>

            <!-- Tags — mirrors [id].vue flex-wrap gap-3 mt-8 -->
            <div
              v-if="visibleTags.length > 0"
              class="flex flex-wrap gap-1.5 mt-3"
            >
              <span
                v-for="tag in visibleTags"
                :key="tag.type === 'existing' ? tag.id : tag.label.nl"
                class="bg-accent text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
                :class="
                  tag.type === 'new'
                    ? 'opacity-70 border border-dashed border-white/40'
                    : ''
                "
              >
                {{ tagLabel(tag) }}
              </span>
            </div>

            <!-- No-tags hint (only when there are truly no tags yet) -->
            <div
              v-else
              class="mt-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span
                class="text-[9px] font-black uppercase tracking-widest text-white/60"
              >
                {{ t("admin-productions.preview.hint") }}
              </span>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════════════════════════════════
             BODY — mirrors [id].vue <section class="py-20"> page-container
             ════════════════════════════════════════════════════════════════ -->
        <div
          class="px-5 py-7 bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
          :class="previewMode === 'desktop' ? 'md:px-10 md:py-10' : ''"
        >
          <!-- Empty state spinner -->
          <div
            v-if="!hasContent"
            class="border-2 border-dashed border-border rounded-2xl p-10 text-center"
          >
            <div
              class="w-8 h-8 mx-auto mb-4 rounded-full border-2 border-muted-foreground/20 border-t-accent animate-spin"
            />
            <p
              class="text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest leading-relaxed"
            >
              {{ t("admin-productions.preview.bodyPlaceholder") }}
            </p>
          </div>

          <template v-else>
            <!-- Tagline — mirrors [id].vue border-l-4 border-[var(--accent)] -->
            <div v-if="isValid(tagline)" class="mb-7">
              <p
                class="border-l-4 border-[var(--accent)] pl-4 font-black italic leading-relaxed text-gray-900 dark:text-white"
                :class="
                  previewMode === 'phone' ? 'text-sm' : 'text-base lg:text-lg'
                "
              >
                {{ tagline }}
              </p>
            </div>

            <!-- Description 1 — mirrors [id].vue line-clamp + read-more toggle -->
            <div
              v-if="fullDescription"
              class="description-content leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200 mb-4 transition-all duration-500"
              :class="[
                previewMode === 'phone' ? 'text-sm' : 'text-base lg:text-lg',
                isExpanded
                  ? 'line-clamp-none'
                  : 'line-clamp-[6] md:line-clamp-[8] should-fade',
              ]"
              v-html="fullDescription"
            />
            <button
              v-if="fullDescription"
              class="mb-6 text-[9px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
              @click="isExpanded = !isExpanded"
            >
              {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
            </button>

            <!-- ── Events — mirrors [id].vue ProductionEventTable section ── -->
            <div class="mt-4 mb-8">
              <h2 class="text-[11px] uppercase font-black mb-4 tracking-widest">
                {{ t("production.events") }}
              </h2>

              <!-- Events table (simplified mirror of ProductionEventTable) -->
              <template v-if="visibleEvents.length > 0">
                <div class="flex flex-col divide-y divide-border">
                  <div
                    v-for="(event, i) in visibleEvents"
                    :key="event.kind === 'existing' ? event.id : `new-${i}`"
                    class="py-3 flex flex-col gap-0.5"
                  >
                    <span
                      class="text-[10px] font-black uppercase tracking-widest"
                      :class="previewMode === 'phone' ? 'text-[9px]' : ''"
                    >
                      {{
                        formatDatetime(
                          event.kind === "existing" && !event.deleted
                            ? event.starttime
                            : event.kind === "new"
                              ? event.starttime
                              : null,
                        )
                      }}
                    </span>
                    <span
                      v-if="eventLocation(event)"
                      class="text-[9px] opacity-60 font-medium"
                    >
                      {{ eventLocation(event) }}
                    </span>
                    <!-- Deleted badge (only visible in preview if somehow shown) -->
                    <span
                      v-if="event.kind === 'existing' && event.deleted"
                      class="text-[8px] text-red-400 font-black uppercase tracking-widest"
                    >
                      {{ t("admin-productions.preview.deleted") }}
                    </span>
                  </div>
                </div>
              </template>

              <div v-else class="py-4 opacity-60 italic text-[11px]">
                {{ t("production.noEvents") }}
              </div>
            </div>

            <!-- Description 2 — mirrors [id].vue bg-gray-100 italic block -->
            <div v-if="isValid(description2Raw)" class="mb-8">
              <div
                class="description-content p-5 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 rounded-2xl transition-all duration-500"
                :class="[
                  previewMode === 'phone' ? 'text-sm' : 'text-base lg:text-lg',
                  isExpanded2
                    ? 'line-clamp-none'
                    : 'line-clamp-[6] should-fade',
                ]"
                v-html="cleanText(description2Raw)"
              />
              <button
                class="mt-3 ml-5 text-[9px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
                @click="isExpanded2 = !isExpanded2"
              >
                {{
                  isExpanded2 ? t("general.readLess") : t("general.readMore")
                }}
              </button>
            </div>

            <!-- Series — not shown on [id].vue yet but present in draft; shown as subtle chips -->
            <div
              v-if="visibleSeries.length > 0"
              class="mb-6 flex flex-wrap gap-1.5"
            >
              <span
                v-for="(s, i) in visibleSeries"
                :key="s.type === 'existing' ? s.id : `new-${i}`"
                class="inline-flex items-center px-2 py-0.5 rounded-sm border border-border text-muted-foreground text-[8px] font-black uppercase tracking-widest"
                :class="s.type === 'new' ? 'opacity-60 border-dashed' : ''"
              >
                {{ seriesLabel(s) }}
              </span>
            </div>

            <!-- Credits — mirrors [id].vue centered credits block -->
            <div
              v-if="isValid(credits)"
              class="pt-6 border-t border-border flex flex-col items-center text-center"
            >
              <h4
                class="text-[9px] uppercase font-black opacity-40 mb-4 tracking-widest"
              >
                {{ t("production.credits") }}
              </h4>
              <div
                class="description-content max-w-xs text-[11px] leading-relaxed opacity-70 text-gray-600 dark:text-gray-400"
                v-html="credits"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- Scroll-to-top FAB -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="opacity-0 translate-y-3"
      >
        <button
          v-if="showScrollTop"
          class="absolute bottom-6 right-6 w-9 h-9 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-transform"
          @click="scrollToTop"
        >
          <ArrowUp :size="15" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Thin scrollbar — same as before */
.preview-scroll::-webkit-scrollbar {
  width: 4px;
}
.preview-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.preview-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}
:global(.dark) .preview-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}

/* description-content — mirrors [id].vue .description-content */
.description-content :deep(a) {
  text-decoration: underline;
  text-underline-offset: 4px;
  overflow-wrap: break-word;
}
.description-content :deep(a:hover) {
  opacity: 0.7;
}
.description-content :deep(p) {
  margin: 0.75rem 0;
}
.description-content :deep(ul),
.description-content :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.75rem 0;
}
.description-content :deep(strong) {
  font-weight: 700;
}
.description-content :deep(em) {
  font-style: italic;
}

/* Read-more fade — mirrors [id].vue .should-fade */
.should-fade {
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}
.line-clamp-none {
  mask-image: none !important;
  -webkit-mask-image: none !important;
}

/* Hero overlay (applied when header image is present) — mirrors [id].vue .image-overlay::after */
.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
  pointer-events: none;
}
</style>

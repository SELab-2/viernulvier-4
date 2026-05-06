<!--
  components/admin/productions/Preview.vue

  Live preview mirroring the public /productions/[id] page.
  Updated to show:
    - Tags row (below hero, matching public page style)
    - Series badge (shown if any series are selected)
    - Media placeholder with hint chip
    - All existing content (title, artist, tagline, descriptions, credits)

  Props:
    data    — previewData from useProductionForm
    tags    — selected TagItem[] from composable
    series  — selected SeriesItem[] from composable
-->
<script setup lang="ts">
import { Smartphone, Monitor, ArrowUp } from "lucide-vue-next";
import type {
  TagItem,
  SeriesItem,
} from "~/composables/productions/useProductionForm";

interface LocalizedPair {
  nl: string;
  en: string;
}

interface PreviewData {
  id?: number;
  titel: LocalizedPair;
  description1: LocalizedPair;
  description2: LocalizedPair;
  tagline: LocalizedPair;
  credits: LocalizedPair;
  artist: LocalizedPair;
  performer_type?: string | null;
}

const props = defineProps<{
  data: PreviewData;
  tags?: TagItem[];
  series?: SeriesItem[];
}>();

const { t } = useI18n();

const previewLang = ref<"nl" | "en">("nl");
const previewMode = ref<"phone" | "desktop">("phone");

const get = (pair: LocalizedPair) =>
  pair[previewLang.value]?.trim() || pair.nl?.trim() || "";

const title = computed(
  () =>
    get(props.data.titel) ||
    t("admin.productions.preview.placeholderTitle", "Untitled production"),
);
const artist = computed(() => get(props.data.artist));
const tagline = computed(() => get(props.data.tagline));
const description1 = computed(() => get(props.data.description1));
const description2 = computed(() => get(props.data.description2));
const credits = computed(() => get(props.data.credits));
const visibleTags = computed(() => props.tags?.filter((t) => t.tag) ?? []);
const visibleSeries = computed(() => props.series ?? []);

const hasContent = computed(() =>
  [title.value, artist.value, tagline.value, description1.value].some(Boolean),
);

const scrollArea = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

function handleScroll() {
  if (!scrollArea.value) return;
  showScrollTop.value = scrollArea.value.scrollTop > 200;
}
function scrollToTop() {
  scrollArea.value?.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="flex flex-col gap-3 select-none">
    <!-- ── Controls bar ──────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-xl border border-border"
    >
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

      <div class="flex items-center gap-2">
        <span
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.preview.lang", "Preview") }}
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

    <!-- ── Device shell ──────────────────────────────────────────────────── -->
    <div
      class="relative mx-auto transition-all duration-500 ease-in-out border border-border bg-white dark:bg-[#1e2230] shadow-2xl ring-1 ring-inset ring-foreground/5 overflow-hidden h-[640px]"
      :class="
        previewMode === 'phone'
          ? 'w-full max-w-[375px] rounded-[3rem] p-3'
          : 'w-full rounded-2xl'
      "
    >
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
        <!-- ── Hero ──────────────────────────────────────────────────────── -->
        <section
          class="relative flex items-end overflow-hidden shrink-0"
          :class="previewMode === 'phone' ? 'h-52' : 'h-72'"
        >
          <MediaDisplay
            :id="data.id"
            :src="null"
            size="fill"
            :show-icon="false"
            :show-border="false"
            :rounded="false"
            class="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/75 z-[1]"
          />

          <div class="relative z-10 px-5 pb-5 w-full">
            <!-- Series badge -->
            <div
              v-if="visibleSeries.length > 0"
              class="mb-2 flex flex-wrap gap-1"
            >
              <span
                v-for="s in visibleSeries"
                :key="s.id"
                class="inline-flex items-center px-2 py-0.5 rounded-sm border border-white/40 text-white/70 text-[8px] font-black uppercase tracking-widest"
              >
                {{ s.name }}
              </span>
            </div>

            <!-- Performer type -->
            <div
              v-if="data.performer_type"
              class="mb-2 inline-block border border-white/60 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-sm"
            >
              {{ data.performer_type }}
            </div>

            <!-- Title -->
            <h1
              class="font-brand font-black uppercase italic leading-[0.88] tracking-[-2px] text-white"
              :class="[
                previewMode === 'phone'
                  ? title.length > 30
                    ? 'text-2xl'
                    : 'text-3xl'
                  : title.length > 30
                    ? 'text-4xl'
                    : 'text-5xl',
              ]"
            >
              {{ title }}
            </h1>

            <!-- Artist -->
            <p
              v-if="artist && artist !== title"
              class="mt-1.5 text-white/75 font-medium"
              :class="previewMode === 'phone' ? 'text-sm' : 'text-base'"
            >
              {{ artist }}
            </p>

            <!-- Tags row (matches public page) -->
            <div
              v-if="visibleTags.length > 0"
              class="flex flex-wrap gap-1.5 mt-3"
            >
              <span
                v-for="tag in visibleTags"
                :key="tag.id"
                class="bg-accent text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
                :class="
                  tag.isNew
                    ? 'opacity-70 border border-dashed border-white/40'
                    : ''
                "
              >
                {{ tag.tag }}
              </span>
            </div>

            <!-- Media hint (when no tags and no media yet) -->
            <div
              v-if="visibleTags.length === 0"
              class="mt-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span
                class="text-[9px] font-black uppercase tracking-widest text-white/60"
              >
                {{
                  t(
                    "admin.productions.preview.imageHint",
                    "Images & tags added in later steps",
                  )
                }}
              </span>
            </div>
          </div>
        </section>

        <!-- ── Body ──────────────────────────────────────────────────────── -->
        <div
          class="px-5 py-7 bg-white dark:bg-[#1e2230]"
          :class="previewMode === 'desktop' ? 'md:px-10 md:py-10' : ''"
        >
          <!-- Empty state -->
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
              {{
                t(
                  "admin.productions.preview.bodyPlaceholder",
                  "Start typing to see a live preview",
                )
              }}
            </p>
          </div>

          <template v-else>
            <!-- Tagline -->
            <div v-if="tagline" class="mb-7">
              <p
                class="border-l-4 border-accent pl-4 text-gray-900 dark:text-white font-black italic leading-relaxed"
                :class="previewMode === 'phone' ? 'text-sm' : 'text-base'"
              >
                {{ tagline }}
              </p>
            </div>

            <!-- Description 1 -->
            <div
              v-if="description1"
              class="prod-body text-gray-800 dark:text-gray-200 leading-relaxed mb-6 line-clamp-[8]"
              :class="previewMode === 'phone' ? 'text-sm' : 'text-base'"
              v-html="description1"
            />

            <!-- Description 2 -->
            <div
              v-if="description2"
              class="prod-body p-5 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic text-gray-700 dark:text-gray-300 rounded-2xl mb-6 line-clamp-[5]"
              :class="previewMode === 'phone' ? 'text-sm' : 'text-base'"
              v-html="description2"
            />

            <!-- Media placeholder -->
            <div
              class="my-6 py-6 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-center"
            >
              <span class="text-xl opacity-30">🖼</span>
              <span
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30"
              >
                {{
                  t(
                    "admin.productions.preview.mediaHint",
                    "Media added in step 3",
                  )
                }}
              </span>
            </div>

            <!-- Credits -->
            <div
              v-if="credits"
              class="pt-6 border-t border-border flex flex-col items-center text-center"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3"
              >
                {{ t("production.credits", "Credits") }}
              </p>
              <div
                class="prod-body text-xs text-gray-600 dark:text-gray-400 leading-relaxed opacity-80"
                v-html="credits"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- Scroll to top FAB -->
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
.prod-body :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: break-word;
}
.prod-body :deep(p) {
  margin: 0.75rem 0;
}
.prod-body :deep(ul),
.prod-body :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.75rem 0;
}
.prod-body :deep(strong) {
  font-weight: 700;
}
.prod-body :deep(em) {
  font-style: italic;
}
</style>

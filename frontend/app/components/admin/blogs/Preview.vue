<!--
  components/admin/blogs/Preview.vue

  Live "site preview" — scrolls with the page (no fixed height, no sticky).
  Title fades out when too long, matching the production detail page style.
-->
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";
import { Smartphone, Monitor, RefreshCcw } from "lucide-vue-next";

interface LocalizedPair {
  nl: string;
  en: string;
}

const props = defineProps<{
  data: {
    titel: LocalizedPair;
    description: LocalizedPair;
    id?: number;
  };
  headerCrop: MediaCrop | null;
}>();

const { t } = useI18n();

const previewLang = ref<"nl" | "en">("nl");
const previewMode = ref<"phone" | "desktop">("phone");

const title = computed(
  () =>
    props.data.titel[previewLang.value]?.trim() ||
    props.data.titel.nl?.trim() ||
    t("admin.blogs.preview.placeholderTitle"),
);

const body = computed(
  () =>
    props.data.description[previewLang.value]?.trim() ||
    props.data.description.nl?.trim() ||
    "",
);

const readingTime = computed(() => {
  const plain = body.value.replace(/<[^>]*>/g, " ").trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

const today = computed(() => {
  const d = new Date();
  const lang = previewLang.value === "en" ? "en-GB" : "nl-BE";
  return d.toLocaleDateString(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

// Font size based on title length — same logic as production detail page
const titleSizeClass = computed(() => {
  const len = title.value.length;
  if (previewMode.value === "phone") {
    return len > 35 ? "text-2xl" : len > 25 ? "text-3xl" : "text-4xl";
  }
  return len > 35 ? "text-3xl" : len > 25 ? "text-4xl" : "text-5xl";
});

// Whether title is long enough to need the fade
const titleIsLong = computed(() => title.value.length > 55);

// Title overflow detection: only enable scrolling when the title actually
// wraps onto more than one rendered line.
const titleText = ref<HTMLElement | null>(null);
const titleScrollable = ref(false);
let __ro: ResizeObserver | null = null;

function updateTitleScrollable() {
  nextTick(() => {
    const el = titleText.value;
    if (!el) {
      titleScrollable.value = false;
      return;
    }

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
    if (!lineHeight) {
      titleScrollable.value = false;
      return;
    }

    const lines = Math.round(el.scrollHeight / lineHeight);
    titleScrollable.value = lines > 1;
  });
}

onMounted(() => {
  updateTitleScrollable();
  __ro = new ResizeObserver(updateTitleScrollable);
  if (titleText.value) __ro.observe(titleText.value);
});

onBeforeUnmount(() => {
  __ro?.disconnect();
});

watch([title, previewMode], updateTitleScrollable);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Controls -->
    <div
      class="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border"
    >
      <div class="flex items-center gap-1">
        <button
          v-for="mode in ['phone', 'desktop'] as const"
          :key="mode"
          class="p-2 rounded-lg transition-all"
          :class="
            previewMode === mode
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="previewMode = mode"
          :title="mode.charAt(0).toUpperCase() + mode.slice(1)"
        >
          <Smartphone v-if="mode === 'phone'" :size="16" />
          <Monitor v-else :size="16" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground mr-2"
        >
          {{ t("admin.blogs.preview.lang") }}
        </span>
        <div
          class="inline-flex bg-background rounded-lg p-0.5 border border-border overflow-hidden"
        >
          <button
            v-for="lang in ['nl', 'en'] as const"
            :key="lang"
            class="px-3 py-1 rounded-md text-[10px] font-brand font-black uppercase tracking-widest transition-all"
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

    <!--
      Preview frame — NO fixed height, NO overflow scroll.
      Grows with content and scrolls naturally with the rest of the page.
    -->
    <div
      class="relative mx-auto border border-card-border bg-white dark:bg-[#1e2230] shadow-xl ring-1 ring-inset ring-foreground/5 overflow-hidden transition-all duration-300"
      :class="
        previewMode === 'phone'
          ? 'w-full max-w-[375px] rounded-3xl p-2.5'
          : 'w-full rounded-2xl'
      "
    >
      <!-- Phone notch -->
      <div
        v-if="previewMode === 'phone'"
        class="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-background rounded-b-2xl z-30 pointer-events-none"
      />

      <div
        :class="
          previewMode === 'phone'
            ? 'rounded-[1.4rem] overflow-hidden'
            : 'rounded-xl overflow-hidden'
        "
      >
        <!-- Hero -->
        <div class="relative flex items-end overflow-hidden aspect-video">
          <MediaDisplay
            :id="props.data.id"
            :src="headerCrop"
            size="fill"
            :show-icon="false"
            :show-border="false"
            :rounded="false"
            class="absolute inset-0 w-full h-full z-0"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]"
          />

          <div class="relative z-10 px-5 pb-5 w-full">
            <!--
              Title: vertical scroll with a soft bottom fade.
              This keeps a consistent title area while long titles stay readable.
            -->
            <div
              class="title-scroll-wrap"
              :class="[
                previewMode === 'phone'
                  ? 'title-scroll-wrap-phone'
                  : 'title-scroll-wrap-desktop',
                titleIsLong ? 'title-scroll-fade' : '',
                titleScrollable ? 'title-scroll-scrollable' : '',
              ]"
            >
              <h1
                ref="titleText"
                class="font-brand font-black uppercase tracking-tighter leading-[0.9] text-white italic title-scroll-text"
                :class="titleSizeClass"
              >
                {{ title }}
              </h1>
            </div>

            <div
              class="flex items-center gap-3 mt-3 font-brand font-black text-[9px] uppercase tracking-widest text-white/70"
            >
              <span>{{ today }}</span>
              <span class="w-1 h-1 rounded-full bg-white/30" />
              <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 py-7 bg-white dark:bg-[#1e2230]">
          <div
            v-if="!body"
            class="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/10"
          >
            <RefreshCcw
              class="w-7 h-7 mx-auto mb-3 text-muted-foreground/30 animate-spin-slow"
            />
            <p
              class="text-muted-foreground/50 text-xs font-brand font-black uppercase tracking-widest leading-relaxed"
            >
              {{ t("admin.blogs.preview.bodyPlaceholder") }}
            </p>
          </div>

          <div
            v-else
            class="story-body story-body-scroll text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-200 break-words"
            v-html="body"
          />

          <div
            class="mt-8 pt-6 border-t border-border flex items-center justify-between opacity-40"
          >
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent" />
              <span
                class="text-[9px] font-brand font-black uppercase tracking-widest"
              >
                {{ t("admin.blogs.preview.badge") }}
              </span>
            </div>
            <span
              class="text-[9px] font-brand font-black uppercase tracking-widest"
              >{{ today }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Long-title scroller with a soft fade. */
.title-scroll-wrap {
  max-width: 100%;
  /* default: no scrolling unless JS enables it */
  overflow-y: hidden;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.title-scroll-wrap::-webkit-scrollbar {
  display: none;
}

.title-scroll-wrap-phone {
  max-height: 5.6rem;
}

.title-scroll-wrap-desktop {
  max-height: 8.6rem;
}

/* When the title actually overflows the wrapper we enable scrolling */
.title-scroll-scrollable {
  overflow-y: auto;
}

.title-scroll-scrollable::-webkit-scrollbar {
  display: block;
  width: 6px;
}

.title-scroll-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.title-scroll-scrollable::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

.title-scroll-fade {
  mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
}

.title-scroll-text {
  display: block;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.story-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: break-word;
}

.story-body-scroll {
  max-height: 24rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  scrollbar-width: thin;
}

.story-body-scroll::-webkit-scrollbar {
  width: 6px;
}

.story-body-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.story-body-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

:global(.dark) .story-body-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
}
.story-body :deep(h1) {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 1.25rem 0 0.6rem;
  line-height: 1.1;
  text-transform: uppercase;
  font-family: var(--font-brand);
}
.story-body :deep(h2) {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 1rem 0 0.4rem;
}
.story-body :deep(p) {
  margin: 0.75rem 0;
}
.story-body :deep(ul),
.story-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}
.story-body :deep(blockquote) {
  border-left: 3px solid #9333ea;
  padding: 0.4rem 0 0.4rem 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}
</style>

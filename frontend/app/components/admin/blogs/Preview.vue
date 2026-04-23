<!--
  components/admin/blogs/Preview.vue

  Live "site preview" panel shown next to the story form on the create page.

  Renders a read-only replica of how the blog story will look on the public
  /stories/[id] page so editors can see their content take shape in real time
  without leaving the admin area.

  Props:
    data — { titel: { nl, en }, description: { nl, en }, id? }
            Updated live by the parent (create.vue) via the form's preview-update event.
    headerCrop — The MediaCrop object for the hero banner.

  The component shows the NL content by default (the required language),
  with a small toggle to switch to the EN preview.
  It also features a device toggle (phone/desktop) and handles internal scrolling for long posts.
-->
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";
import { Smartphone, Monitor, ArrowUp, RefreshCcw } from "lucide-vue-next";

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
  headerCrop?: MediaCrop | null;
}>();

const { t } = useI18n();

// Let editors toggle which language they preview without affecting the form
const previewLang = ref<"nl" | "en">("nl");

// Preview mode: 'phone' or 'desktop'
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

// Rough reading-time estimate (same logic as the public story detail page)
const readingTime = computed(() => {
  const plain = body.value.replace(/<[^>]*>/g, " ").trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

// Today's date for the preview datestamp
const today = computed(() => {
  const d = new Date();
  const lang = previewLang.value === "en" ? "en-GB" : "nl-BE";
  return d.toLocaleDateString(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

// Handle internal scrolling
const scrollArea = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

function handleScroll() {
  if (!scrollArea.value) return;
  showScrollTop.value = scrollArea.value.scrollTop > 300;
}

function scrollToTop() {
  scrollArea.value?.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Preview Controls -->
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
      Preview Container
      The container simulates a device based on previewMode.
    -->
    <div
      class="relative mx-auto transition-all duration-500 ease-in-out border border-card-border bg-white dark:bg-[#1e2230] shadow-2xl ring-1 ring-inset ring-foreground/5 overflow-hidden"
      :class="[
        previewMode === 'phone'
          ? 'w-full max-w-[375px] rounded-[3rem] p-3'
          : 'w-full rounded-2xl',
        'h-[650px]',
      ]"
    >
      <!-- Phone Frame Elements -->
      <template v-if="previewMode === 'phone'">
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl z-30"
        />
      </template>

      <!-- Scrollable Device Screen -->
      <div
        ref="scrollArea"
        class="h-full w-full overflow-y-auto overflow-x-hidden relative scroll-container"
        :class="previewMode === 'phone' ? 'rounded-[2.2rem]' : 'rounded-xl'"
        @scroll="handleScroll"
      >
        <!-- Hero banner (mirrors the public page hero) -->
        <div
          class="relative flex items-end overflow-hidden shrink-0"
          :class="previewMode === 'phone' ? 'h-56' : 'h-72'"
        >
          <!-- Using MediaDisplay for unified image/placeholder handling -->
          <MediaDisplay
            :id="props.data.id"
            :src="headerCrop"
            size="fill"
            :show-icon="false"
            :show-border="false"
            :rounded="false"
            class="absolute inset-0 w-full h-full object-cover z-0"
          />

          <!-- Dark gradient overlay for readability (matches stories/[id].vue) -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]"
          />

          <div class="relative z-10 px-6 pb-6 w-full">
            <!-- Title -->
            <h1
              class="font-brand font-black uppercase tracking-tighter leading-[0.9] text-white italic"
              :class="[
                previewMode === 'phone'
                  ? title.length > 40
                    ? 'text-xl'
                    : 'text-3xl'
                  : title.length > 40
                    ? 'text-3xl'
                    : 'text-5xl',
              ]"
            >
              {{ title }}
            </h1>

            <!-- Meta row -->
            <div
              class="flex items-center gap-3 mt-4 font-brand font-black text-[9px] uppercase tracking-widest text-white/70"
            >
              <span>{{ today }}</span>
              <span class="w-1 h-1 rounded-full bg-white/30" />
              <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
            </div>
          </div>
        </div>

        <!-- Article body -->
        <div class="px-6 py-8 md:px-10 md:py-12 bg-white dark:bg-[#1e2230]">
          <!-- Empty state -->
          <div
            v-if="!body"
            class="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-muted/10"
          >
            <RefreshCcw
              class="w-8 h-8 mx-auto mb-4 text-muted-foreground/30 animate-spin-slow"
            />
            <p
              class="text-muted-foreground/50 text-xs font-brand font-black uppercase tracking-widest leading-relaxed"
            >
              {{ t("admin.blogs.preview.bodyPlaceholder") }}
            </p>
          </div>

          <!-- Rendered HTML -->
          <div
            v-else
            class="story-body text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-200 break-words"
            v-html="body"
          />

          <!-- Subtle footer -->
          <div
            class="mt-12 pt-8 border-t border-border flex items-center justify-between opacity-50"
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
            >
              {{ today }}
            </span>
          </div>
        </div>

        <!-- Scroll to Top FAB (within preview) -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <button
            v-if="showScrollTop"
            class="absolute bottom-6 right-6 w-10 h-10 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
            @click="scrollToTop"
          >
            <ArrowUp :size="18" />
          </button>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* Custom scrollbar for the preview area */
.scroll-container::-webkit-scrollbar {
  width: 5px;
}
.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
:global(.dark) .scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.story-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: break-word;
}
.story-body :deep(h1) {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 1.5rem 0 0.75rem;
  line-height: 1.1;
  text-transform: uppercase;
  font-family: var(--font-brand);
}
.story-body :deep(h2) {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 1.25rem 0 0.6rem;
  line-height: 1.2;
}
.story-body :deep(p) {
  margin: 1rem 0;
}
.story-body :deep(ul),
.story-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 1rem 0;
}
.story-body :deep(blockquote) {
  border-left: 4px solid #9333ea;
  padding: 0.5rem 0 0.5rem 1.25rem;
  margin: 1.5rem 0;
  color: #6b7280;
  font-style: italic;
  font-size: 1.1em;
}
</style>

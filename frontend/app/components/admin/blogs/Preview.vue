<!--
  components/admin/blogs/Preview.vue

  Live "site preview" panel shown next to the story form on the create page.

  Renders a read-only replica of how the blog story will look on the public
  /stories/[id] page so editors can see their content take shape in real time
  without leaving the admin area.

  Props:
    data — { titel: { nl, en }, description: { nl, en } }
            Updated live by the parent (create.vue) via the form's preview-update event.

  The component shows the NL content by default (the required language),
  with a small toggle to switch to the EN preview.

  It intentionally mirrors the story detail page's typography styles
  (.story-body) so the preview matches production as closely as possible.
-->
<script setup lang="ts">
interface LocalizedPair {
  nl: string;
  en: string;
}

const props = defineProps<{
  data: {
    titel: LocalizedPair;
    description: LocalizedPair;
  };
}>();

const { t, locale } = useI18n();

// Let editors toggle which language they preview without affecting the form
const previewLang = ref<"nl" | "en">("nl");

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
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Preview label + language toggle -->
    <div class="flex items-center justify-between">
      <span
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        {{ t("admin.blogs.preview.label") }}
      </span>

      <!-- NL / EN language toggle -->
      <div
        class="inline-flex rounded-lg border border-border overflow-hidden text-[10px] font-brand font-black uppercase tracking-widest"
      >
        <button
          :class="[
            'px-3 py-1.5 transition-colors',
            previewLang === 'nl'
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ]"
          @click="previewLang = 'nl'"
        >
          NL
        </button>
        <button
          :class="[
            'px-3 py-1.5 transition-colors border-l border-border',
            previewLang === 'en'
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ]"
          @click="previewLang = 'en'"
        >
          EN
        </button>
      </div>
    </div>

    <!--
      Preview card — styled to match the public story detail page.
      Uses a scaled-down version of the hero + article layout.
    -->
    <div
      class="rounded-xl border border-card-border bg-white dark:bg-[#1e2230] overflow-hidden shadow-md text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-foreground/5"
    >
      <!-- Hero banner placeholder (no image yet in create mode) -->
      <div
        class="relative h-32 bg-gradient-to-br from-muted to-muted/60 flex items-end"
      >
        <!-- Purple gradient overlay (mirrors the real page) -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />

        <div class="relative z-10 px-5 pb-4 w-full">
          <!-- Title -->
          <h1
            class="font-brand font-black uppercase tracking-tighter leading-none text-white"
            :class="title.length > 40 ? 'text-lg' : 'text-xl'"
          >
            {{ title }}
          </h1>

          <!-- Meta row -->
          <div
            class="flex items-center gap-3 mt-1.5 font-brand font-black text-[9px] uppercase tracking-widest text-white/70"
          >
            <span>{{ today }}</span>
            <span>·</span>
            <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
          </div>
        </div>
      </div>

      <!-- Article body -->
      <div class="px-5 py-4 max-h-96 overflow-y-auto">
        <!--
          Empty state: shown before the editor has any content.
          Uses a subtle dashed border so it is clearly a placeholder.
        -->
        <div
          v-if="!body"
          class="border-2 border-dashed border-border rounded-lg p-6 text-center"
        >
          <p
            class="text-muted-foreground/50 text-xs font-brand font-black uppercase tracking-widest"
          >
            {{ t("admin.blogs.preview.bodyPlaceholder") }}
          </p>
        </div>

        <!--
          Rendered HTML from the TipTap editor.
          Uses the same .story-body CSS class as the public page
          so typography is faithful to what visitors will see.
        -->
        <div
          v-else
          class="story-body text-sm leading-7 text-gray-700 dark:text-gray-300 break-words"
          v-html="body"
        />
      </div>

      <!-- Subtle footer -->
      <div
        class="px-5 py-2 border-t border-border bg-muted/30 flex items-center gap-2"
      >
        <div class="w-1.5 h-1.5 rounded-full bg-accent" />
        <span
          class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.blogs.preview.badge") }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Mirror the public story page typography so the preview is faithful.
  These styles intentionally duplicate /pages/stories/[id].vue's .story-body rules.
*/

.story-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: break-word;
}
.story-body :deep(h1) {
  font-size: 1.4rem;
  font-weight: 900;
  margin: 1rem 0 0.4rem;
  line-height: 1.2;
}
.story-body :deep(h2) {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0.9rem 0 0.3rem;
  line-height: 1.25;
}
.story-body :deep(h3) {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0.75rem 0 0.25rem;
}
.story-body :deep(p) {
  margin: 0.5rem 0;
}
.story-body :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.story-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.story-body :deep(li) {
  margin: 0.2rem 0;
}
.story-body :deep(blockquote) {
  border-left: 3px solid #9333ea;
  padding: 0.2rem 0 0.2rem 0.75rem;
  margin: 0.75rem 0;
  color: #6b7280;
  font-style: italic;
}
.story-body :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0;
}
.story-body :deep(strong) {
  font-weight: 700;
}
.story-body :deep(em) {
  font-style: italic;
}
.story-body :deep(s) {
  text-decoration: line-through;
}
.story-body :deep(u) {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>

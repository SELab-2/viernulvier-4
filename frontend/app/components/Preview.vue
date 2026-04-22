<!--
  components/admin/blogs/Preview.vue

  Shared live preview component for both create and edit pages.
  Shows how the story looks on the public site.

  Props:
    data           – { titel, description } both NL and EN
    headerCropUrl  – resolved URL of the FE3_header crop (optional)
    compact        – smaller height for mobile
-->
<script setup lang="ts">
interface LocalizedPair {
  nl: string;
  en: string;
}

const props = defineProps<{
  data: { titel: LocalizedPair; description: LocalizedPair };
  headerCropUrl?: string | null;
  compact?: boolean;
}>();

const { t, locale } = useI18n();
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
const readingTime = computed(() => {
  const words = body.value
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});
const today = computed(() => {
  return new Date().toLocaleDateString(
    previewLang.value === "en" ? "en-GB" : "nl-BE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Header row: label + language toggle -->
    <div class="flex items-center justify-between">
      <span
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
      >
        <svg
          class="w-3.5 h-3.5 opacity-60"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" stroke-linecap="round" />
        </svg>
        {{ t("admin.blogs.preview.label") }}
      </span>
      <div
        class="inline-flex rounded-lg border border-border overflow-hidden text-[10px] font-brand font-black uppercase tracking-widest"
      >
        <button
          type="button"
          :class="[
            'px-3 py-1.5 transition-colors cursor-pointer',
            previewLang === 'nl'
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ]"
          @click="previewLang = 'nl'"
        >
          NL
        </button>
        <button
          type="button"
          :class="[
            'px-3 py-1.5 transition-colors border-l border-border cursor-pointer',
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

    <!-- Preview card -->
    <div
      class="rounded-xl border border-card-border overflow-hidden shadow-lg text-gray-900 dark:text-gray-100"
      style="background: var(--card)"
    >
      <!-- Hero banner -->
      <div
        class="relative flex items-end overflow-hidden w-full"
        :style="{ height: compact ? '112px' : '176px' }"
      >
        <!-- Real uploaded image -->
        <img
          v-if="headerCropUrl"
          :src="headerCropUrl"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
          style="z-index: 0"
        />

        <!-- Placeholder gradient when no image yet -->
        <div
          v-if="!headerCropUrl"
          class="absolute inset-0 w-full h-full"
          style="
            z-index: 0;
            background: linear-gradient(
              135deg,
              #1e1047 0%,
              #3b1fa3 40%,
              #6b21a8 70%,
              #0f172a 100%
            );
          "
        >
          <!-- Mesh blobs -->
          <div
            class="absolute inset-0"
            style="
              background:
                radial-gradient(
                  ellipse at 20% 60%,
                  rgba(139, 92, 246, 0.55) 0%,
                  transparent 55%
                ),
                radial-gradient(
                  ellipse at 80% 25%,
                  rgba(167, 139, 250, 0.35) 0%,
                  transparent 45%
                ),
                radial-gradient(
                  ellipse at 50% 100%,
                  rgba(79, 70, 229, 0.4) 0%,
                  transparent 40%
                );
            "
          ></div>
          <!-- Centered icon -->
          <div class="absolute inset-0 flex items-center justify-center">
            <svg
              class="w-10 h-10"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path
                d="m3 15 4-4 6 6 4-5 4 5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- Gradient overlay for readability (always) -->
        <div
          class="absolute inset-0"
          style="
            z-index: 1;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.85) 0%,
              rgba(0, 0, 0, 0.25) 55%,
              transparent 100%
            );
          "
        ></div>

        <!-- Title + meta -->
        <div class="relative px-4 pb-3 w-full" style="z-index: 2">
          <h1
            class="font-brand font-black uppercase tracking-tighter leading-none text-white mb-1.5"
            :style="{
              fontSize:
                title.length > 45
                  ? '0.9rem'
                  : title.length > 30
                    ? '1.05rem'
                    : '1.2rem',
            }"
          >
            {{ title }}
          </h1>
          <div
            class="flex items-center gap-3 font-brand font-black text-[9px] uppercase tracking-widest"
            style="color: rgba(255, 255, 255, 0.65)"
          >
            <span>{{ today }}</span>
            <span>·</span>
            <span>{{ readingTime }} {{ t("stories.minRead") }}</span>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div
        class="overflow-y-auto"
        :style="{
          padding: '12px 16px',
          maxHeight: compact ? '180px' : '300px',
        }"
      >
        <div
          v-if="!body"
          class="rounded-lg border-2 border-dashed py-8 text-center"
          style="border-color: var(--border)"
        >
          <p
            class="text-[10px] font-brand font-black uppercase tracking-widest"
            style="color: var(--muted-foreground); opacity: 0.5"
          >
            {{ t("admin.blogs.preview.bodyPlaceholder") }}
          </p>
        </div>
        <div
          v-else
          class="story-body text-sm leading-7 break-words"
          style="color: var(--foreground); opacity: 0.85"
          v-html="body"
        />
      </div>

      <!-- Footer chip -->
      <div
        class="flex items-center gap-2 px-4 py-2 border-t"
        style="
          border-color: var(--border);
          background: var(--muted);
          opacity: 0.9;
        "
      >
        <div
          class="w-1.5 h-1.5 rounded-full"
          style="background: var(--accent)"
        ></div>
        <span
          class="text-[9px] font-brand font-black uppercase tracking-widest"
          style="color: var(--muted-foreground)"
        >
          {{ t("admin.blogs.preview.badge") }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  overflow-wrap: break-word;
}
.story-body :deep(h1) {
  font-size: 1.25rem;
  font-weight: 900;
  margin: 0.85rem 0 0.3rem;
  line-height: 1.2;
}
.story-body :deep(h2) {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0.75rem 0 0.25rem;
}
.story-body :deep(h3) {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0.6rem 0 0.2rem;
}
.story-body :deep(p) {
  margin: 0.4rem 0;
}
.story-body :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.4rem 0;
}
.story-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.4rem 0;
}
.story-body :deep(li) {
  margin: 0.15rem 0;
}
.story-body :deep(blockquote) {
  border-left: 3px solid #9333ea;
  padding-left: 0.75rem;
  margin: 0.6rem 0;
  font-style: italic;
  opacity: 0.8;
}
.story-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0.75rem 0;
}
.story-body :deep(strong) {
  font-weight: 700;
}
.story-body :deep(em) {
  font-style: italic;
}
</style>

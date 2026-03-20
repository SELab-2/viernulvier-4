<script lang="ts" setup>
import type { Blog, BlogView, PaginatedResponse } from "@repo/common";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";

const { t, locale, setLocale } = useI18n();
const { getAll } = useBlogApi();

// ── Dark mode (test page only) ────────────────────────────────────────────
const isDark = ref(
  typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark"),
);
const toggleDark = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

// ── Locale toggle (test page only) ───────────────────────────────────────
const toggleLocale = () => setLocale(locale.value === "nl" ? "en" : "nl");

// ── Toolbar state ─────────────────────────────────────────────────────────
const sortOrder  = ref<"newest" | "oldest">("newest");
const showFilter = ref(false);

// ── Data fetching ─────────────────────────────────────────────────────────
const { data, pending, error, refresh } = await useAsyncData(
  "generalStoryTest-blogs",
  () => getAll({ limit: 0, page: 0 }),
);

const apiStories = computed<Array<Blog | BlogView>>(() => {
  const raw = (data.value as unknown) as PaginatedResponse<Blog | BlogView> | null | undefined;
  return raw?.objects ?? [];
});

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1503095396549-807759245b35?w=480&q=75",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=480&q=75",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=480&q=75",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=480&q=75",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=480&q=75",
];

const MOCK_TITLES = [
  { nl: "Achter de schermen bij De Grote Voorstelling", en: "Behind the Scenes of The Great Show" },
  { nl: "Interview met een pionier van de avant-garde dans", en: "Interview with a Pioneer of Avant-garde Dance" },
  { nl: "50 jaar muziek in het hart van Gent", en: "50 Years of Music in the Heart of Ghent" },
  { nl: "De geschiedenis van onze grote zaal", en: "The History of our Main Hall" },
  { nl: "Nachtelijke repetities: een fotoreportage", en: "Night Rehearsals: a Photo Report" },
  { nl: "Hoe we theater toegankelijk maken", en: "How We Make Theatre Accessible" },
  { nl: "Jaarboek — terugblik op een seizoen", en: "Yearbook — Looking Back on a Season" },
  { nl: "Portret van een technisch directeur", en: "Portrait of a Technical Director" },
  { nl: "De nieuwe generatie Gentse theatermakers", en: "The New Generation of Ghent Theatre Makers" },
  { nl: "Muziek als politiek statement", en: "Music as a Political Statement" },
];

const MOCK_DESCS = [
  { nl: "Een blik achter de coulissen van een van onze meest spraakmakende producties.", en: "A look behind the curtain of one of our most talked-about productions." },
  { nl: "We spraken met de choreograaf over inspiratie, discipline en de toekomst.", en: "We spoke with the choreographer about inspiration, discipline and the future." },
  { nl: "Een overzicht van vijf decennia live muziek, van jazz tot elektronisch.", en: "A retrospective of five decades of live music, from jazz to electronic." },
  { nl: "De grote zaal heeft een rijke geschiedenis die begint in de vroege jaren '70.", en: "The main hall has a rich history dating back to the early 1970s." },
  { nl: "Onze fotograaf bracht een week door met de dansers tijdens avondrepeties.", en: "Our photographer spent a week with dancers during evening rehearsals." },
  { nl: "Gebarentolk, audiodescriptie en toegankelijke programmatie — hoe we het aanpakken.", en: "Sign language, audio description and accessible programming — how we approach it." },
  { nl: "Alle voorstellingen, concerten en evenementen van een bewogen seizoen.", en: "All performances, concerts and events from an eventful season." },
  { nl: "Twintig jaar lang het technische brein achter elke productie.", en: "Twenty years as the technical brain behind every production." },
  { nl: "Jong talent, nieuwe stemmen en fris perspectief op het podium.", en: "Young talent, new voices and fresh perspective on stage." },
  { nl: "Hoe artiesten de politieke realiteit omzetten in geluid en beweging.", en: "How artists translate political reality into sound and movement." },
];

// Generates a random ISO timestamp between 2016-01-01 and today
const randomDate = (): string => {
  const start = new Date("2016-01-01T00:00:00Z").getTime();
  const end   = Date.now();
  return new Date(start + Math.random() * (end - start)).toISOString();
};

let mockIdCounter = -1;
const mockStories = ref<Array<Blog>>([]);

const addMockStory = () => {
  const idx       = mockStories.value.length % MOCK_TITLES.length;
  const withImage = mockStories.value.length % 2 === 0;
  const date      = randomDate();

  mockStories.value.push({
    id:          mockIdCounter--,
    titel:       MOCK_TITLES[idx] as { nl: string; en: string },
    description: MOCK_DESCS[idx]  as { nl: string; en: string },
    created_at:  date,
    updated_at:  date,
    ...(withImage ? { image: MOCK_IMAGES[idx % MOCK_IMAGES.length] } : {}),
  } as any);
};

// ── Combined list ─────────────────────────────────────────────────────────
const allStories = computed<Array<Blog | BlogView>>(() => [
  ...apiStories.value,
  ...mockStories.value,
]);
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">

    <!-- ── Toolbar ────────────────────────────────────────────────────── -->
    <section class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
      <div class="container mx-auto px-4 max-w-4xl py-3 flex items-center gap-2">

        <!-- Filter toggle -->
        <button
          class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 flex items-center gap-2"
          :class="showFilter ? 'border-foreground text-foreground bg-muted' : ''"
          @click="showFilter = !showFilter"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          filters
        </button>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Add mock story -->
        <button
          class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 flex items-center gap-2"
          @click="addMockStory"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add test story
          <span
            v-if="mockStories.length > 0"
            class="ml-1 text-[8px] bg-foreground text-background px-1.5 py-0.5 rounded-full leading-none"
          >
            {{ mockStories.length }}
          </span>
        </button>

        <!-- Locale toggle (test only) -->
        <button
          class="h-10 w-14 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          :title="`Switch to ${locale === 'nl' ? 'English' : 'Nederlands'}`"
          @click="toggleLocale"
        >
          {{ locale === "nl" ? "EN" : "NL" }}
        </button>

        <!-- Dark mode toggle (test only) -->
        <button
          class="h-10 w-10 flex items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark"
        >
          <!-- Sun -->
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1"  x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3"  y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
          </svg>
          <!-- Moon -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- Result count -->
        <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 pl-1">
          {{ allStories.length }} {{ t("stories.results") }}
        </span>
      </div>

      <!-- Filter panel -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showFilter"
          class="container mx-auto px-4 max-w-4xl pb-3 border-t border-border pt-3 flex items-center gap-3"
        >
          <select
            v-model="sortOrder"
            class="h-10 px-3 bg-muted border-none text-[11px] font-brand font-black uppercase tracking-wide text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30 cursor-pointer"
          >
            <option value="newest">{{ t("stories.sortNewest") }}</option>
            <option value="oldest">{{ t("stories.sortOldest") }}</option>
          </select>

          <!-- Clear mock stories -->
          <button
            v-if="mockStories.length > 0"
            class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:bg-muted transition-colors duration-150"
            @click="mockStories = []"
          >
            Clear test stories
          </button>
        </div>
      </Transition>
    </section>

    <!-- ── Content ────────────────────────────────────────────────────── -->
    <div class="container mx-auto px-4 max-w-4xl py-12">

      <!-- Loading skeleton -->
      <div v-if="pending" class="space-y-12" :aria-label="t('stories.loading')">
        <div v-for="i in 2" :key="i">
          <div class="flex items-center gap-4 mb-5">
            <div class="h-8 w-16 bg-muted animate-pulse" />
            <div class="h-5 w-20 bg-muted animate-pulse" />
            <div class="flex-1 h-px bg-muted" />
          </div>
          <div class="border border-border divide-y divide-border">
            <div v-for="j in 3" :key="j" class="flex animate-pulse">
              <div class="w-32 sm:w-40 bg-muted" style="aspect-ratio:4/3;min-height:88px;" />
              <div class="flex-1 px-5 py-4 space-y-2">
                <div class="h-3.5 bg-muted w-3/4" />
                <div class="h-3 bg-muted w-1/2" />
                <div class="h-3 bg-muted w-full mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-24 text-center">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-30 mb-3">
          Error
        </p>
        <p class="font-brand font-black text-[10px] uppercase tracking-widest text-red-500 mb-8">
          {{ error.message }}
        </p>
        <button
          class="px-6 py-3 border border-border font-brand font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-all"
          @click="refresh()"
        >
          {{ t("stories.retry") }}
        </button>
      </div>

      <!-- Timeline — max 10 visible per year -->
      <StoryTimeline
        v-else
        :stories="allStories"
        :sort-order="sortOrder"
        :initial-visible-per-year="10"
        @story-click="(s) => s.id && s.id > 0 && navigateTo(`/blog/${s.id}`)"
      />
    </div>

  </div>
</template>
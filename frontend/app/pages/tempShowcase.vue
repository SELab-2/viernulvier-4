<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { ChevronLeft } from "lucide-vue-next";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

const production = {
  id: 13189,
  titel: {
    en: "KAPITEIN WINOKIO",
    nl: "KAPITEIN WINOKIO",
  },
  artist: {
    en: "KUKELEKU! DE GROTE BOERDERIJ SHOW",
    nl: "KUKELEKU! DE GROTE BOERDERIJ SHOW",
  },
  tagline: {
    en: "A musical adventure for the little farmers.",
    nl: "Een knotsgekke muzikale show vol dierenplezier.",
  },
  description1: {
    en: `<p>Kapitein Winokio neemt je mee naar de vrolijkste boerderij van het land.<br>Is iedereen daar? Zitten jullie klaar?<br>Lichten uit en spots aan want de show gaat beginnen!</p>\r\n<p>Samen met de muziekmatrozen, Mevrouw de Poes en alle dieren op de boerderij zingen we loeiende liedjes, kikkermelodietjes en stampen we stoer mee op het ritme van de hele gróte .... oh, neen, dat verklappen we nog niet. Dat blijft nog even een verrassing! De koe doet “boe!”, het varken knort en zelfs de leeuw en de octopus zingen luidkeels mee, want op de boerderij van Kapitein Winokio zijn ALLE dieren welkom.</p>\r\n<p>Een knotsgekke muzikale show vol dierenplezier, meezingvreugde en boerderijgrappen en grollen.</p>`,
    nl: `<p>Kapitein Winokio neemt je mee naar de vrolijkste boerderij van het land.<br>Is iedereen daar? Zitten jullie klaar?<br>Lichten uit en spots aan want de show gaat beginnen!</p>\r\n<p>Samen met de muziekmatrozen, Mevrouw de Poes en alle dieren op de boerderij zingen we loeiende liedjes, kikkermelodietjes en stampen we stoer mee op het ritme van de hele gróte .... oh, neen, dat verklappen we nog niet. Dat blijft nog even een verrassing! De koe doet “boe!”, het varken knort en zelfs de leeuw en de octopus zingen luidkeels mee, want op de boerderij van Kapitein Winokio zijn ALLE dieren welkom.</p>\r\n<p>Een knotsgekke muzikale show vol dierenplezier, meezingvreugde en boerderijgrappen en grollen.</p>`,
  },
  description2: {
    nl: `<p>Het publiek kan voor de voorstelling verzoeknummers doorgeven via de website van de kapitein. Zo wordt elke boerderij-avond een unieke belevenis voor jong en oud.</p>`,
    en: `<p>The audience can submit song requests before the show via the website. This makes every farm evening a unique experience for all ages.</p>`,
  },
  credits: {
    en: "<p><strong>Kapitein Winokio</strong>: Winok Seresia - <strong>Mevrouw de Poes</strong>: Marie-Anne Coppens - <strong>Seba - synth, accordeon</strong>: Sebastian Rodriguez - <strong>Stoofvlees - gitaar</strong>: Stoffel Verlackt - <strong>Petrolium - basgitaren</strong>: Peter Pask - <strong>Laurenzo - drum</strong>: Laurens Van Bouwelen - <strong>Pierre Sonoroor - geluidsontwerp</strong>: Pierre Leconte - <strong>Michelangelo - lichtontwerp</strong>: Michel Jacobs - <strong>Regie</strong>: Mich Walschaerts - <strong>Saartje Knipschaartje - Decor/kostuum</strong>: Sarah Fissette - <strong>Tourmanagement</strong>: nog ongekend</p>",
    nl: "<p><strong>Kapitein Winokio</strong>: Winok Seresia - <strong>Mevrouw de Poes</strong>: Marie-Anne Coppens - <strong>Seba - synth, accordeon</strong>: Sebastian Rodriguez - <strong>Stoofvlees - gitaar</strong>: Stoffel Verlackt - <strong>Petrolium - basgitaren</strong>: Peter Pask - <strong>Laurenzo - drum</strong>: Laurens Van Bouwelen - <strong>Pierre Sonoroor - geluidsontwerp</strong>: Pierre Leconte - <strong>Michelangelo - lichtontwerp</strong>: Michel Jacobs - <strong>Regie</strong>: Mich Walschaerts - <strong>Saartje Knipschaartje - Decor/kostuum</strong>: Sarah Fissette - <strong>Tourmanagement</strong>: nog ongekend</p>",
  },
  performer_type: "group",
  attendance_mode: "offline",

  // Extra: mock data voor de componenten die je net hebt gemaakt
  events: [
    {
      id: 1,
      starttime: "2026-11-14T19:00:00Z",
      location: { location: "Theaterzaal, Vooruit" },
      prices: [
        { id: 101, name: "Volwassenen", price: 25.0 },
        { id: 102, name: "Kinderen (-12)", price: 0.0 },
        { id: 103, name: "Gezelschap", price: 0.0 },
        { id: 104, name: "EDC-begeleider", price: 0.0 },
      ],
    },
    {
      id: 2,
      starttime: "2026-11-15T14:00:00Z",
      location: { location: "Balzaal, Vooruit" },
      prices: [
        { id: 201, name: "Standaard", price: 27.0 },
        { id: 202, name: "Reductie", price: 22.0 },
      ],
    },
    {
      id: 3,
      starttime: "2027-01-10T11:00:00Z",
      location: { location: "Minard Schouwburg" },
      prices: [{ id: 301, name: "Eenheidsprijs", price: 15.0 }],
    },
    {
      id: 4,
      starttime: "2027-02-10T11:00:00Z",
      location: { location: "Minard Schouwburg" },
      prices: [
        { id: 201, name: "Standaard", price: 27.0 },
        { id: 202, name: "Reductie", price: 22.0 },
      ],
    },
  ],

  stories: [
    {
      id: 1,
      titel: "REHEARSAL DIARIES: DE BOERDERIJ",
      description:
        "Een exclusieve blik achter de schermen tijdens de bouw van het reusachtige kippenhok-decor.",
      created_at: "2026-03-10T00:00:00Z",
    },
    {
      id: 2,
      titel: "INTERVIEW MET MICH WALSCHAERTS",
      description:
        "De regisseur over hoe je humor voor kleuters vertaalt naar een groot podium.",
      created_at: "2026-03-15T00:00:00Z",
    },
    {
      id: 3,
      titel: "voorbeeld 3",
      description:
        "De regisseur over hoe je humor voor kleuters vertaalt naar een groot podium.",
      created_at: "2026-03-15T00:00:00Z",
    },
    {
      id: 4,
      titel: "Voorbeeld 4",
      description:
        "De regisseur over hoe je humor voor kleuters vertaalt naar een groot podium.",
      created_at: "2026-03-15T00:00:00Z",
    },
  ],
};
const tags = ref([
  { id: 1, tag: "Muziek" },
  { id: 2, tag: "Familie" },
]);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/productions"); // Fallback
  }
};

const productionId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

/** 3. Helper om "N/A" of lege velden te checken */
const isValid = (val: any) => {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return (
    s !== "" && s !== "N/A" && s !== "UNDEFINED" && s !== "\\N" && s !== "\N"
  );
};

const image = undefined;
const bannerGradient = computed(() =>
  pickPlaceholderGradient(productionId.value ?? 0),
);

const cleanText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .replace(/\\/g, "") //alleen deze nodig? .trim()
    .trim()
    .replace(/(\r?\n){2,}/g, "\n\n")
    .replace(/\n/g, "<br />");
};

const isExpanded = ref(false);
const showReadMoreButton = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  const el = descriptionRef.value;
  if (el) {
    showReadMoreButton.value = el.scrollHeight > el.clientHeight;
  }
};
onMounted(async () => {
  await nextTick();
  checkOverflow();
  window.addEventListener("resize", checkOverflow);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOverflow);
});

const fullDescription = computed(
  () => cleanText(production.description1[locale.value as "nl" | "en"]) || "",
);
</script>

<template>
  <main
    v-if="production"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <section
      class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden"
      :style="{ background: image ? 'var(--muted)' : bannerGradient }"
    >
      <img
        v-if="image"
        :src="image"
        class="absolute inset-0 h-full w-full object-cover opacity-80 dark:opacity-50"
      />

      <div
        class="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20 pb-12"
      >
        <div class="flex items-center gap-4 mb-8">
          <button
            @click="goBack()"
            class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] text-foreground hover:text-accent transition-colors"
          >
            <ChevronLeft :size="14" stroke-width="3" />
            {{ t("general.back") }}
          </button>

          <span
            v-if="isValid(production.performer_type)"
            class="border border-[1.5px] border-foreground text-foreground px-2 py-1 text-[10px] font-black uppercase rounded-sm"
          >
            {{ production.performer_type }}
          </span>
        </div>

        <div class="text-foreground">
          <h1
            class="font-brand text-6xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic"
          >
            {{ production.titel[locale as "nl" | "en"] }}
          </h1>
          <p
            v-if="
              isValid(production.artist) &&
              production.artist !== production.titel
            "
            class="text-2xl lg:text-3xl font-medium opacity-80"
          >
            {{ production.artist[locale as "nl" | "en"] }}
          </p>
        </div>

        <div
          v-if="tags?.some((t) => isValid(t.tag))"
          class="flex flex-wrap gap-3 mt-8"
        >
          <template v-for="tag in tags" :key="tag.id">
            <span
              v-if="isValid(tag.tag)"
              class="bg-accent text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]"
            >
              {{ tag.tag }}
            </span>
          </template>
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20">
        <div class="w-full">
          <div v-if="isValid(production.tagline)" class="mb-10">
            <p
              class="border-l-4 border-[var(--accent)] pl-6 text-lg lg:text-xl font-black italic leading-relaxed text-gray-900 dark:text-white"
            >
              {{ production.tagline[locale as "nl" | "en"] }}
            </p>
          </div>

          <div
            ref="descriptionRef"
            class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200 transition-all duration-500"
            :class="[
              isExpanded
                ? 'line-clamp-none'
                : 'line-clamp-[6] md:line-clamp-[8]',
            ]"
            v-html="fullDescription"
          ></div>

          <button
            v-if="showReadMoreButton || isExpanded"
            @click="isExpanded = !isExpanded"
            class="mt-6 mb-4 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
          >
            {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
          </button>
        </div>

        <div class="mt-8 mb-16">
          <h1 class="text-[16px] uppercase font-black mb-6 tracking-widest">
            {{ t("production.events") }}
          </h1>
          <ProductionEventTable
            v-if="production.events && (production.events as any).length > 0"
            :events="production.events as any"
          />
          <div v-else class="py-4 opacity-60 italic text-sm">
            {{ t("production.noEvents") }}
          </div>
        </div>

        <div
          v-if="isValid(production.description2[locale as 'nl' | 'en'])"
          class="description-content mb-16 p-8 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 text-lg lg:text-xl rounded-2xl"
          v-html="cleanText(production.description2[locale as 'nl' | 'en'])"
        ></div>

        <div
          v-if="production.stories && (production.stories as any).length > 0"
          class="my-16"
        >
          <h1 class="text-[16px] uppercase font-black mb-6 tracking-widest">
            {{ t("production.stories") }}
          </h1>
          <ProductionStoryListView :stories="production.stories as any" />
        </div>

        <div
          v-if="isValid(production.credits)"
          class="pt-12 flex flex-col items-center"
        >
          <div class="max-w-2xl text-center">
            <h4
              class="text-[10px] uppercase font-black opacity-40 mb-6 tracking-widest"
            >
              {{ t("production.credits") }}
            </h4>
            <div
              class="text-sm leading-relaxed opacity-70"
              v-html="production.credits[locale as 'nl' | 'en']"
            ></div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* links in description */
.description-content :deep(a) {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.description-content :deep(a:hover) {
  opacity: 0.7;
}
</style>

<!--
  components/blogs/StoryNav.vue
  ==============================
  Vertical year-navigation sidebar.

  Core idea
  ---------
  The sticky inner wrapper fills the available viewport height (from below
  the header to the bottom of the screen). The dots are spread evenly inside
  that space using flex + justify-between. When there are more years than fit
  at the minimum spacing (MIN_ITEM_H), the list becomes scrollable and dots
  use MIN_ITEM_H spacing instead.

  The full-height line is on the <nav> element (absolute top-0 bottom-0),
  completely separate from the dot list, so it always runs the full page.
-->
<script lang="ts" setup>
const props = defineProps<{
  years: string[];
  activeYear: string;
}>();

const emit = defineEmits<{
  (e: "scroll-to", year: string): void;
}>();

// Minimum px between dot centres when the list is scrollable
const MIN_ITEM_H = 52;

// ── Header height (for sticky offset + available height calculation) ────────
const headerH = ref(0);
let headerRo: ResizeObserver | null = null;

const measureHeader = () => {
  const h = document.querySelector<HTMLElement>("header");
  if (h) headerH.value = h.offsetHeight;
};

// ── Available viewport height for the dot list ─────────────────────────────
const viewportH = ref(0);
const updateViewportH = () => { viewportH.value = window.innerHeight; };

// Available height = viewport minus header minus small padding
const availableH = computed(() => Math.max(100, viewportH.value - headerH.value - 32));

// How many dots fit at MIN_ITEM_H spacing?
const maxFit = computed(() => Math.floor(availableH.value / MIN_ITEM_H));

// Do we need to scroll the dot list?
const needsScroll = computed(() => props.years.length > maxFit.value);

// When not scrollable: spread dots evenly across availableH
// When scrollable: each dot gets MIN_ITEM_H, list scrolls
const itemH = computed(() => {
  if (!needsScroll.value && props.years.length > 1) {
    return availableH.value / props.years.length;
  }
  return MIN_ITEM_H;
});

const dotListH = computed(() =>
  needsScroll.value
    ? maxFit.value * MIN_ITEM_H   // visible window height
    : availableH.value,           // full available height
);

onMounted(() => {
  measureHeader();
  updateViewportH();

  window.addEventListener("resize", () => {
    measureHeader();
    updateViewportH();
  }, { passive: true });

  const h = document.querySelector<HTMLElement>("header");
  if (h) {
    headerRo = new ResizeObserver(() => {
      measureHeader();
      updateViewportH();
    });
    headerRo.observe(h);
  }

  const el = dotListEl.value;
  if (el) innerScrollMax.value = el.scrollHeight - el.clientHeight;
});
onUnmounted(() => headerRo?.disconnect());

// ── Inner dot-list scroll ──────────────────────────────────────────────────
const dotListEl      = ref<HTMLElement | null>(null);
const innerScrollTop = ref(0);
const innerScrollMax = ref(0);

const canScrollUp   = computed(() => innerScrollTop.value > 2);
const canScrollDown = computed(() => innerScrollTop.value < innerScrollMax.value - 2);

const thumbH   = computed(() =>
  needsScroll.value ? (maxFit.value / props.years.length) * 100 : 100,
);
const thumbTop = computed(() =>
  innerScrollMax.value
    ? (innerScrollTop.value / innerScrollMax.value) * (100 - thumbH.value)
    : 0,
);

function onDotListScroll() {
  const el = dotListEl.value;
  if (!el) return;
  innerScrollTop.value = el.scrollTop;
  innerScrollMax.value = el.scrollHeight - el.clientHeight;
}

watch(needsScroll, async () => {
  await nextTick();
  const el = dotListEl.value;
  if (el) innerScrollMax.value = el.scrollHeight - el.clientHeight;
});

// Auto-scroll active year into the visible dot window
watch(() => props.activeYear, async (year) => {
  await nextTick();
  if (!needsScroll.value) return; // no scrolling needed when all fit
  const el = dotListEl.value;
  if (!el || !year) return;
  const idx = props.years.indexOf(year);
  if (idx === -1) return;
  const target = idx * MIN_ITEM_H - (maxFit.value / 2 - 0.5) * MIN_ITEM_H;
  el.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
});
</script>

<template>
  <nav
    v-if="years.length >= 1"
    class="w-14 sm:w-16 shrink-0 self-stretch relative"
    aria-label="Year navigation"
  >
    <!-- Full-height line — always spans the entire nav column -->
    <div
      class="absolute inset-y-0 w-px bg-foreground/20 pointer-events-none z-0"
      style="left: calc(50% - 0.5px);"
      aria-hidden="true"
    />

    <!--
      Sticky wrapper — stays in the viewport as user scrolls.
      top = header offsetHeight (immune to translate animation).
      No overflow:hidden here — that breaks position:sticky.
    -->
    <div
      class="sticky self-start z-10"
      :style="{ top: `${headerH}px` }"
    >
      <div class="flex gap-1">

        <div class="relative flex-1">

          <!-- Fade top (only when scrollable and scrolled down) -->
          <div
            v-if="canScrollUp"
            class="absolute top-0 inset-x-0 h-8 z-10 pointer-events-none
                   bg-gradient-to-b from-background to-transparent"
            aria-hidden="true"
          />

          <!-- Dot list -->
          <div
            ref="dotListEl"
            :class="needsScroll ? 'overflow-y-auto' : 'overflow-y-hidden'"
            :style="{ height: `${dotListH}px` }"
            style="scrollbar-width: none;"
            @scroll="onDotListScroll"
          >
            <!--
              When not scrollable: justify-between spreads dots evenly.
              When scrollable: fixed itemH per dot, scrolls naturally.
            -->
            <div
              class="flex flex-col items-center h-full"
              :class="needsScroll ? '' : 'justify-between'"
            >
              <button
                v-for="year in years"
                :key="year"
                class="relative flex flex-col items-center justify-center w-full
                       cursor-pointer focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-purple-400 rounded
                       shrink-0"
                :style="needsScroll ? { height: `${MIN_ITEM_H}px` } : {}"
                :aria-label="`Scroll to ${year}`"
                :aria-current="activeYear === year ? 'true' : undefined"
                @click="emit('scroll-to', year)"
              >
                <!-- Dot -->
                <div
                  class="w-4 h-4 rounded-full border-2 relative z-10
                         transition-all duration-200"
                  :class="
                    activeYear === year
                      ? 'bg-purple-500 border-purple-500 scale-125 shadow-[0_0_8px_2px_rgba(168,85,247,0.45)]'
                      : 'bg-background border-foreground/40 hover:border-purple-400'
                  "
                />
                <!-- Year label -->
                <span
                  class="mt-1 font-brand font-black text-[9px] uppercase tracking-widest
                         select-none leading-none pointer-events-none"
                  :class="activeYear === year ? 'text-purple-500' : 'text-foreground/40'"
                >
                  {{ year }}
                </span>
              </button>
            </div>
          </div>

          <!-- Fade bottom -->
          <div
            v-if="canScrollDown"
            class="absolute bottom-0 inset-x-0 h-8 z-10 pointer-events-none
                   bg-gradient-to-t from-background to-transparent"
            aria-hidden="true"
          />
        </div>

        <!-- Scroll-position thumb track -->
        <div
          v-if="needsScroll"
          class="w-0.5 rounded-full bg-foreground/10 relative overflow-hidden shrink-0"
          :style="{ height: `${dotListH}px` }"
          aria-hidden="true"
        >
          <div
            class="absolute left-0 right-0 rounded-full bg-purple-500/60
                   transition-all duration-150"
            :style="{ top: `${thumbTop}%`, height: `${thumbH}%` }"
          />
        </div>

      </div>
    </div>
  </nav>
</template>

<style scoped>
div::-webkit-scrollbar { display: none; }
</style>
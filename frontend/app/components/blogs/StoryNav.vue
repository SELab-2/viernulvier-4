<!--
  components/blogs/StoryNav.vue
  ==============================
  Vertical year-navigation sidebar.

  • Shows MAX_VISIBLE years at a time (responsive: 4 on mobile, 6 on sm+).
  • The list scrolls when there are more years than the visible window.
  • Fade gradients at top / bottom signal that more items are reachable.
  • A thin purple "thumb" track on the right edge shows scroll position.
  • The active year is auto-scrolled into view whenever it changes.
-->
<script lang="ts" setup>
const props = defineProps<{
  years: string[];
  activeYear: string;
}>();

const emit = defineEmits<{
  (e: "scroll-to", year: string): void;
}>();

// ── Responsive window size ───────────────────────────────────────────────────
// How many years are visible without scrolling.
const MAX_MOBILE = 4;   // < sm breakpoint
const MAX_DESKTOP = 6;  // sm+

const isSm = ref(false);
onMounted(() => {
  const mq = window.matchMedia("(min-width: 640px)");
  isSm.value = mq.matches;
  mq.addEventListener("change", (e) => (isSm.value = e.matches));
});

const maxVisible = computed(() => (isSm.value ? MAX_DESKTOP : MAX_MOBILE));

// Each year slot = dot (16px) + label (12px) + vertical padding (24px) ≈ 56px
const ITEM_H = 56; // px — must match the button's py-3 (24px) + inner content

const containerMaxH = computed(() => `${maxVisible.value * ITEM_H}px`);
const needsScroll   = computed(() => props.years.length > maxVisible.value);

// ── Scroll-state tracking ────────────────────────────────────────────────────
const scrollEl  = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const scrollMax = ref(0);

const canScrollUp   = computed(() => scrollTop.value > 2);
const canScrollDown = computed(() => scrollTop.value < scrollMax.value - 2);

/** Thumb height and offset as % of the scroll container height. */
const thumbH = computed(() => {
  if (!needsScroll.value) return 100;
  return (maxVisible.value / props.years.length) * 100;
});
const thumbTop = computed(() => {
  if (!scrollMax.value) return 0;
  return (scrollTop.value / scrollMax.value) * (100 - thumbH.value);
});

function onScroll() {
  const el = scrollEl.value;
  if (!el) return;
  scrollTop.value = el.scrollTop;
  scrollMax.value = el.scrollHeight - el.clientHeight;
}

// ── Auto-scroll active year into view ───────────────────────────────────────
watch(
  () => props.activeYear,
  async (year) => {
    await nextTick();
    const el = scrollEl.value;
    if (!el || !year) return;
    const idx = props.years.indexOf(year);
    if (idx === -1) return;
    // Centre the active item within the visible window.
    const target = idx * ITEM_H - (maxVisible.value / 2 - 0.5) * ITEM_H;
    el.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  },
);

onMounted(() => {
  const el = scrollEl.value;
  if (el) scrollMax.value = el.scrollHeight - el.clientHeight;
});
</script>

<template>
  <nav
    v-if="years.length >= 1"
    class="w-14 sm:w-16 shrink-0"
    aria-label="Year navigation"
  >
    <div class="sticky top-20">

      <!-- Wrapper: scroll track lives here as a sibling of the list -->
      <div class="relative flex gap-1">

        <!-- ── Scrollable list ──────────────────────────────────────────── -->
        <div
          ref="scrollEl"
          class="relative flex-1 overflow-y-auto scroll-smooth"
          :style="{ maxHeight: containerMaxH }"
          :class="needsScroll ? 'overflow-y-auto' : 'overflow-y-hidden'"
          style="scrollbar-width: none;"
          @scroll="onScroll"
        >
          <!-- Connecting rule -->
          <div
            class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border"
            aria-hidden="true"
          />

          <!-- Fade: top -->
          <Transition name="fade">
            <div
              v-if="canScrollUp"
              class="
                sticky top-0 left-0 right-0 h-6 z-10 pointer-events-none
                bg-gradient-to-b from-background to-transparent
              "
              aria-hidden="true"
            />
          </Transition>

          <div class="flex flex-col items-center py-2 gap-0">
            <button
              v-for="year in years"
              :key="year"
              class="relative flex flex-col items-center w-full py-3 group focus-visible:outline-none"
              :aria-label="`Scroll to ${year}`"
              :aria-current="activeYear === year ? 'true' : undefined"
              @click="emit('scroll-to', year)"
            >
              <!-- Dot -->
              <div
                class="w-4 h-4 rounded-full border-2 z-10 transition-all duration-200"
                :class="
                  activeYear === year
                    ? 'bg-purple-500 border-purple-500 scale-125 shadow-[0_0_8px_2px_rgba(168,85,247,0.45)]'
                    : 'bg-background border-muted-foreground/40 group-hover:border-purple-400'
                "
              />
              <!-- Label -->
              <span
                class="
                  mt-1.5 font-brand font-black text-[9px] uppercase tracking-widest
                  transition-colors duration-150 select-none leading-none
                "
                :class="
                  activeYear === year
                    ? 'text-purple-500'
                    : 'text-muted-foreground/50 group-hover:text-foreground'
                "
              >
                {{ year }}
              </span>
            </button>
          </div>

          <!-- Fade: bottom -->
          <Transition name="fade">
            <div
              v-if="canScrollDown"
              class="
                sticky bottom-0 left-0 right-0 h-6 z-10 pointer-events-none
                bg-gradient-to-t from-background to-transparent
              "
              aria-hidden="true"
            />
          </Transition>
        </div>

        <!-- ── Scroll-position track ────────────────────────────────────── -->
        <div
          v-if="needsScroll"
          class="w-0.5 rounded-full bg-border/50 self-stretch my-2 relative overflow-hidden"
          aria-hidden="true"
        >
          <!-- Thumb -->
          <div
            class="absolute left-0 right-0 rounded-full bg-purple-500/70 transition-all duration-150"
            :style="{
              top: `${thumbTop}%`,
              height: `${thumbH}%`,
            }"
          />
        </div>

      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Hide the native scrollbar (WebKit) */
div::-webkit-scrollbar { display: none; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from,
.fade-leave-to   { opacity: 0; }
</style>
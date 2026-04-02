<!--
  components/ScrollToTop.vue
  ============================
  Floating "back to top" button. Appears once the user has scrolled past
  `threshold` pixels and smoothly scrolls the page back to the top on click.

  The button uses the same design tokens (purple accent, font-brand, etc.)
  as the rest of the stories section so it feels native.
-->
<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /** How far the user must scroll (px) before the button appears. */
  threshold?: number;
}>(), {
  threshold: 320,
});

const visible = ref(false);

const onScroll = () => {
  visible.value = window.scrollY > props.threshold;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // initialise in case page loads mid-scroll
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <button
      v-if="visible"
      type="button"
      class="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        h-9 px-3
        rounded border-2 border-purple-500
        bg-background text-purple-500
        font-brand font-black text-[9px] uppercase tracking-widest
        shadow-lg shadow-purple-500/20
        transition-colors duration-150
        hover:bg-purple-500 hover:text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
      "
      aria-label="Scroll back to top"
      @click="scrollToTop"
    >
      <!-- Up arrow -->
      <svg
        class="w-3 h-3 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
      TOP
    </button>
  </Transition>
</template>
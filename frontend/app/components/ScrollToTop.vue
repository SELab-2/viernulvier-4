<!--
  components/ScrollToTop.vue
  ============================
  Floating "back to top" button. Appears once the user has scrolled past
  `threshold` pixels. Centered horizontally within the page content area.
-->
<script lang="ts" setup>
const props = withDefaults(defineProps<{
  threshold?: number;
}>(), {
  threshold: 320,
});

const visible = ref(false);

const onScroll = () => { visible.value = window.scrollY > props.threshold; };
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-3"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-3"
  >
    <button
      v-if="visible"
      type="button"
      class="
        fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        w-14 h-14 rounded-full
        bg-purple-500 text-white
        shadow-xl shadow-purple-500/40
        flex items-center justify-center
        transition-all duration-150
        hover:bg-purple-600 hover:scale-110 hover:shadow-purple-500/60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
      "
      aria-label="Scroll back to top"
      @click="scrollToTop"
    >
      <svg
        class="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>
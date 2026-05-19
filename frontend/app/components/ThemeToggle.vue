<!--
  Theme Toggle Component

  This component allows users to switch between light and dark mode.
  It stores the selected theme in localStorage and applies it to the document.
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Sun, Moon } from "lucide-vue-next";

withDefaults(
  defineProps<{
    isCompact?: boolean;
  }>(),
  {
    isCompact: false,
  },
);

const isDark = ref(false);

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");

  // signal theme changed
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("theme-changed"));
  }
};

const toggleDark = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
};

const initDark = () => {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  isDark.value = stored ? stored === "dark" : prefersDark;
  applyTheme(isDark.value);
};

onMounted(() => {
  initDark();
});
</script>

<template>
  <button
    class="btn-outline flex items-center justify-center gap-2"
    @click="toggleDark"
  >
    <Sun v-if="isDark" :size="16" />
    <Moon v-else :size="16" />

    <span :class="isCompact ? 'hidden xl:inline' : 'hidden lg:inline'">
      {{ isDark ? "LIGHT" : "DARK" }}
    </span>
  </button>
</template>

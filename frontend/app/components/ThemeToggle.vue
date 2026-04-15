<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Sun, Moon } from "lucide-vue-next";

const isDark = ref(false);

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
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

    <span class="hidden sm:inline">
      {{ isDark ? "LIGHT" : "DARK" }}
    </span>
  </button>
</template>

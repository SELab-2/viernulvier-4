<!--
  components/blogs/StoriesHeader.vue
  ------------------------------------
  Sticky top bar with:
  - Page title
  - Language toggle (nl ↔ en)
  - Dark-mode toggle

  Dark mode implementation
  ------------------------
  Adds the "dark" class to <html> AND overrides --background / --muted to a
  lighter dark palette (#0f1117 → #151821 for background, etc.) so the page
  feels like a dark theme rather than a pitch-black screen.
  Values are removed when switching back to light mode so the light-mode
  Tailwind defaults take over again.
-->

<script lang="ts" setup>
const { t, locale, setLocale } = useI18n();

const isDark = ref(false);

onMounted(() => {
  // Restore stored preference, fall back to system preference.
  const stored = localStorage.getItem("vnv-theme");
  if (stored) {
    isDark.value = stored === "dark";
  } else {
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();
});

watch(isDark, () => {
  localStorage.setItem("vnv-theme", isDark.value ? "dark" : "light");
  applyTheme();
});

/**
 * Toggle the "dark" class on <html> and override CSS custom properties so
 * the dark palette uses a noticeably lighter dark-navy rather than near-black.
 *
 * Background scale used:
 *   page bg    → #151821  (dark navy)
 *   card / muted → #1e2130  (slightly lighter)
 *   border     → #2e3347
 *
 * These are intentionally NOT pitch-black so cards and text have contrast.
 */
function applyTheme() {
  const html = document.documentElement;

 if (isDark.value) {
    html.classList.add("dark");
    html.style.setProperty("--background", "228 17% 18%");   
    html.style.setProperty("--foreground", "220 13% 95%");   
    html.style.setProperty("--muted", "228 17% 24%");        
    html.style.setProperty("--muted-foreground", "220 10% 65%");
    html.style.setProperty("--border", "228 17% 30%");       
    html.style.setProperty("--card", "228 17% 20%");
  } else {
    html.classList.remove("dark");

    // Remove all overrides so Tailwind's light-mode defaults take over.
    const overrides = [
      "--background",
      "--foreground",
      "--muted",
      "--muted-foreground",
      "--border",
      "--card",
    ];
    overrides.forEach((v) => html.style.removeProperty(v));
  }
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
}

function toggleLanguage() {
  const nextLang = locale.value === "nl" ? "en" : "nl";
  setLocale(nextLang);
}
</script>

<template>
  <header
    class="
      stories-header sticky top-0 z-20
      bg-white/95 dark:bg-[#151821]/95
      backdrop-blur-sm border-b border-gray-200 dark:border-[#2e3347]
      transition-colors duration-200
    "
  >
    <div class="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">

      <!-- Page title -->
      <h1 class="text-lg font-brand font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
        {{ t("stories.title") }}
      </h1>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">

        <!-- Language toggle -->
        <button
          class="
            h-8 px-3 font-brand font-black text-[10px] uppercase tracking-widest
            border rounded transition-colors duration-150
            border-gray-300 text-gray-500 hover:border-gray-700 hover:text-gray-900
            dark:border-[#2e3347] dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-100
          "
          :aria-label="t('stories.changeLanguage')"
          @click="toggleLanguage"
        >
          {{ locale.toUpperCase() }}
        </button>

        <!-- Dark / light toggle -->
        <button
          class="
            h-8 w-8 flex items-center justify-center
            border rounded transition-colors duration-150
            border-gray-300 text-gray-500 hover:border-gray-700 hover:text-gray-900
            dark:border-[#2e3347] dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-100
          "
          :aria-label="isDark ? t('stories.lightMode') : t('stories.darkMode')"
          @click="toggleDarkMode"
        >
          <!-- Sun — shown in dark mode to switch to light -->
          <svg
            v-if="isDark"
            class="w-4 h-4"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
          </svg>
          <!-- Moon — shown in light mode to switch to dark -->
          <svg
            v-else
            class="w-4 h-4"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

      </div>
    </div>
  </header>
</template>
<!--
  HomeAbout.vue

  Implements the "About the archive" section on the home page.

  This section introduces VIERNULVIER's archive to visitors using:
  - A heading and two body paragraphs sourced from i18n translation keys
    (about.title, about.body1, about.body2)
  - A drop cap on the first paragraph for editorial styling (uses the
    .dropcap utility defined in main.css)
  - An accompanying photo displayed in a 4:3 aspect ratio container

  The section uses an inverted color scheme (black background in light mode,
  white background in dark mode) to create visual contrast on the home page.
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section
    class="bg-black dark:bg-white text-white dark:text-black border-t border-white/5 dark:border-black/5"
  >
    <div class="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <!-- Text content -->
        <div>
          <h2
            class="text-3xl md:text-4xl font-display font-black mb-8 leading-tight"
          >
            {{ t("about.title") }}
          </h2>
          <!-- Drop cap on the first paragraph -->
          <p
            class="dropcap text-base md:text-lg text-white/70 dark:text-black/70 mb-6 leading-relaxed"
          >
            {{ t("about.body1") }}
          </p>
          <p
            class="text-base md:text-lg text-white/70 dark:text-black/70 leading-relaxed"
          >
            {{ t("about.body2") }}
          </p>
        </div>

        <!-- Accompanying image -->
        <div class="relative aspect-[4/3] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
            alt="VIERNULVIER archive"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 border border-white/10 dark:border-black/10"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: "Georgia", "Times New Roman", serif;
}
</style>

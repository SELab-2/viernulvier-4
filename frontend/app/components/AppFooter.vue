<!--
  AppFooter.vue

  Implements the shared site footer, used on every page via layouts/default.vue.

  The footer is divided into three columns:
  1. Brand & contact — organisation name, address, phone and email
  2. Navigation      — links to the main sections of the archive
  3. Social media    — icon links to all VIERNULVIER social channels

  Social media icons are defined as individual Vue components in
  app/components/icons/ (e.g. FacebookSVG.vue) and are auto-imported by Nuxt
  under the prefix "Icons" (e.g. <IconsFacebookSVG>). They are referenced via
  resolveComponent() in the socials array so the template can stay clean with
  a single v-for loop. Adding a new platform only requires a new entry in
  that array — no template changes needed.

  All navigation labels are sourced from i18n translation keys (footer.*).
  Navigation routes use NuxtLink for internal pages and a plain <a> for the
  external main website.

  Color scheme is inverted: black background in light mode, white in dark mode.
-->
<script setup lang="ts">
import { ROUTES } from "~/utils/routes";

const { t } = useI18n();

/**
 * Social media channels for VIERNULVIER.
 * resolveComponent() looks up the auto-imported icon components by their
 * Nuxt-generated name (folder prefix + filename, e.g. "IconsFacebookSVG").
 * Add new channels here — no template changes needed.
 */
const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/viernulvier.gent/",
    icon: resolveComponent("IconsInstagramSVG"),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/VIERNULVIER.gent/",
    icon: resolveComponent("IconsFacebookSVG"),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@viernulvier.gent",
    icon: resolveComponent("IconsTiktokSVG"),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCdRYlqUQcIm6pbLgHHobQcQ",
    icon: resolveComponent("IconsYoutubeSVG"),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/viernulviergent",
    icon: resolveComponent("IconsLinkedinSVG"),
  },
];
</script>

<template>
  <footer
    class="bg-black dark:bg-white text-white dark:text-black border-t border-white/10 dark:border-black/10"
  >
    <div class="px-6 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
      <!-- Three-column grid: brand+contact | navigation | social -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10 dark:border-black/10"
      >
        <!-- Column 1: Brand and contact information -->
        <div>
          <address
            class="not-italic flex flex-col gap-0.5 text-sm text-white dark:text-black leading-relaxed"
          >
            <span>Kunstencentrum VIERNULVIER vzw.</span>
            <span>Sint-Pietersnieuwstraat 23, 9000 Gent</span>
            <a
              href="tel:+3292672820"
              class="mt-2 hover:text-white/60 dark:hover:text-black/60 transition-colors"
            >
              T. 09 267 28 20
            </a>
            <a
              href="mailto:info@viernulvier.gent"
              class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
            >
              info@viernulvier.gent
            </a>
          </address>
        </div>

        <!-- Column 2: Site navigation links -->
        <div>
          <h4 class="font-display font-bold text-base mb-4">
            {{ t("footer.links") }}
          </h4>
          <ul class="flex flex-col gap-2 text-sm text-white dark:text-black">
            <li>
              <a
                href="https://www.viernulvier.gent/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
              >
                {{ t("footer.mainSite") }}
              </a>
            </li>
            <li>
              <NuxtLink
                :to="ROUTES.archive.base"
                class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
              >
                {{ t("footer.archive") }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="ROUTES.stories.base"
                class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
              >
                {{ t("footer.stories") }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="ROUTES.prints.base"
                class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
              >
                {{ t("footer.prints") }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 3: Social media icon links (rendered from the socials array) -->
        <div>
          <h4 class="font-display font-bold text-base mb-4">Social</h4>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors"
            >
              <component :is="social.icon" />
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright bar -->
      <p
        class="text-center pt-6 text-[0.7rem] font-mono tracking-widest uppercase text-white dark:text-black"
      >
        © {{ new Date().getFullYear() }} VIERNULVIER — {{ t("footer.rights") }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.font-display {
  font-family: "Georgia", "Times New Roman", serif;
}

.font-mono {
  font-family: "Courier New", Courier, monospace;
}
</style>

<script setup lang="ts">
import IconInstagram from '~/assets/icons/IconInstagram.vue'
import IconFacebook from '~/assets/icons/IconFacebook.vue'
import IconTiktok from '~/assets/icons/IconTiktok.vue'
import IconYoutube from '~/assets/icons/IconYoutube.vue'
import IconLinkedin from '~/assets/icons/IconLinkedin.vue'

const { t } = useI18n()

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/viernulvier.gent/', icon: IconInstagram },
  { label: 'Facebook',  href: 'https://www.facebook.com/VIERNULVIER.gent/',  icon: IconFacebook },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@viernulvier.gent',     icon: IconTiktok },
  { label: 'YouTube',   href: 'https://www.youtube.com/channel/UCdRYlqUQcIm6pbLgHHobQcQ', icon: IconYoutube },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/viernulviergent', icon: IconLinkedin },
]
</script>

<template>
  <footer class="bg-black dark:bg-white text-white dark:text-black border-t border-white/10 dark:border-black/10">
    <div class="px-6 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">

      <!-- Three-column grid: brand+contact | navigation | social -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10 dark:border-black/10">

        <!-- Brand and contact information -->
        <div>
          <address class="not-italic flex flex-col gap-0.5 text-sm text-white dark:text-black leading-relaxed">
            <span>Kunstencentrum VIERNULVIER vzw.</span>
            <span>Sint-Pietersnieuwstraat 23, 9000 Gent</span>
            <a href="tel:+3292672820" class="mt-2 hover:text-white/60 dark:hover:text-black/60 transition-colors">
              T. 09 267 28 20
            </a>
            <a href="mailto:info@viernulvier.gent" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">
              info@viernulvier.gent
            </a>
          </address>
        </div>

        <!-- Site navigation links -->
        <div>
          <h4 class="font-display font-bold text-base mb-4">
            {{ t('footer.links') }}
          </h4>
          <ul class="flex flex-col gap-2 text-sm text-white dark:text-black">
            <li>
              <a
                href="https://www.viernulvier.gent/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-white/60 dark:hover:text-black/60 transition-colors"
              >
                {{ t('footer.mainSite') }}
              </a>
            </li>
            <li>
              <NuxtLink to="/archive" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">
                {{ t('footer.archive') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blogs" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">
                {{ t('footer.stories') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/uploads" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">
                {{ t('footer.prints') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Social media icon links -->
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
      <p class="text-center pt-6 text-[0.7rem] font-mono tracking-widest uppercase text-white dark:text-black">
        © {{ new Date().getFullYear() }} VIERNULVIER — {{ t('footer.rights') }}
      </p>

    </div>
  </footer>
</template>

<style scoped>
.font-display {
  font-family: 'Georgia', 'Times New Roman', serif;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
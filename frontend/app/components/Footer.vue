<script setup lang="ts">
const { t } = useI18n()
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
              <a href="https://www.viernulvier.gent/" target="_blank" rel="noopener noreferrer"
                 class="hover:text-white/60 dark:hover:text-black/60 transition-colors">
                {{ t('footer.mainSite') }}
              </a>
            </li>
            <li><NuxtLink to="/archive" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">{{ t('footer.archive') }}</NuxtLink></li>
            <li><NuxtLink to="/blogs" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">{{ t('footer.stories') }}</NuxtLink></li>
            <li><NuxtLink to="/uploads" class="hover:text-white/60 dark:hover:text-black/60 transition-colors">{{ t('footer.prints') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Social media icon links -->
        <div>
          <h4 class="font-display font-bold text-base mb-4">Social</h4>
          <div class="flex flex-wrap gap-2">
            <a href="https://www.instagram.com/viernulvier.gent/" target="_blank" rel="noopener noreferrer"
               aria-label="Instagram"
               class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/VIERNULVIER.gent/" target="_blank" rel="noopener noreferrer"
               aria-label="Facebook"
               class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@viernulvier.gent" target="_blank" rel="noopener noreferrer"
               aria-label="TikTok"
               class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/channel/UCdRYlqUQcIm6pbLgHHobQcQ" target="_blank" rel="noopener noreferrer"
               aria-label="YouTube"
               class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/viernulviergent" target="_blank" rel="noopener noreferrer"
               aria-label="LinkedIn"
               class="p-2 border border-white/30 dark:border-black/30 text-white dark:text-black hover:text-white/60 dark:hover:text-black/60 hover:border-white/60 dark:hover:border-black/60 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <!-- Copyright bar -->
      <p class="text-center pt-6 text-[0.7rem] font-mono tracking-widest uppercase white:text-white/50 dark:text-black">
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
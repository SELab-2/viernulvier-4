<script setup>
/**
 * Header Component
 * * Handles:
 * - Responsive Navigation (Desktop horizontal, Mobile hamburger)
 * - Localization (EN / NL)
 * - Theme switching (Dark / Light)
 * - Admin-specific actions (Logout functionality)
 * - Sticky visibility logic (Hide on scroll down, show on scroll up)
 */

import { ref, onMounted, onUnmounted, watch} from 'vue'
import { ROUTES } from '~/utils/routes'
import { Sun, Moon, LogOut, Menu, X } from 'lucide-vue-next'

import logoBlack from '~/assets/logo_black.svg'
import logoWhite from '~/assets/logo_white.svg'

const { isLoggedIn, logout } = useAuth()

// Determines if the header should render the admin view (logged-in state)
const isAdmin = isLoggedIn

const { t, locale, setLocale } = useI18n()
const isDark = ref(false)
const isMenuOpen = ref(false) // Controls the mobile/tablet hamburger menu
const isVisible = ref(true) // Tracks visibility for the smart-sticky behavior
const lastScrollPosition = ref(0) // Used to calculate scroll direction (delta)
let isInitialLoad = true // Prevents header "jump" on first page load
const route = useRoute()

const navItems = [
  { label: 'home', route: ROUTES.home.base },
  { label: 'archive', route: ROUTES.archive.base },
  { label: 'stories', route: ROUTES.stories.base },
  { label: 'prints', route: ROUTES.prints.base },
]

/**
 * Toggles between available locales
 */
const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

/**
 * Manages Dark Mode by toggling the '.dark' class on the root HTML element
 */
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  if (confirm(t('auth.confirmLogout'))) {
    logout()
  }
}

/**
 * Smart Sticky Logic
 * Hides header when scrolling down to maximize content space.
 * Reveals header when scrolling up for quick navigation access.
 * Uses a 10px threshold to prevent flickering.
 */

const handleScroll = () => {
  const currentScroll = window.scrollY
  const scrollDelta = currentScroll - lastScrollPosition.value

  if (isInitialLoad) {
    isVisible.value = true
    lastScrollPosition.value = currentScroll
    return
  }

  // Always show at the top of the page
  if (currentScroll < 50) {
    isVisible.value = true
  }

  // Scrolled down more than 10px
  else if (scrollDelta > 10) {
    isVisible.value = false
  }

  // Scrolled up more than 10px
  else if (scrollDelta < -10) {
    isVisible.value = true
  }
  lastScrollPosition.value = currentScroll
}

/**
 * Resets header to visible state (e.g., after navigation)
 */
const resetHeader = () => {
  isVisible.value = true
  isInitialLoad = true
  setTimeout(() => {
    isInitialLoad = false
  }, 100)
}

// Watch for route changes to ensure header is visible on new pages
watch(() => route.fullPath, () => {
  resetHeader()
})

/**
 * Force closes mobile menu on window resize to prevent
 * layout glitches when moving from mobile to desktop view.
 */
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  lastScrollPosition.value = window.scrollY
  resetHeader()

  window.addEventListener('scroll', handleScroll)

  if (document.documentElement.classList.contains('dark')) {
    isDark.value = true
  }

  window.addEventListener('resize', handleResize)
  handleResize()

})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <header :class="{ '-translate-y-full': !isVisible && !isMenuOpen }"
          class="sticky top-0 z-[100] border-b-4 border-[var(--foreground)] bg-[var(--background)] transition-transform duration-300 transform-gpu"
  >
    <div
      class="mx-auto grid max-w-[1400px] grid-cols-3 items-center py-4 lg:py-6 px-6 lg:px-12 2xl:px-[120px]"
    >
      <div class="flex items-center justify-start">

        <nav v-if="!isAdmin" class="hidden lg:flex gap-[20px] xl:gap-[30px]">
          <NuxtLink
            v-for="item in navItems"
            :key="item.route"
            :to="item.route"
            class="nav-item"
          >
            {{ t('nav.' + item.label)}}
          </NuxtLink>
        </nav>

        <button @click="toggleMenu"
                class="text-[var(--foreground)] outline-none"
                :class="[isAdmin ? 'md:hidden' : 'lg:hidden']"
        >
          <Menu v-if="!isMenuOpen" :size="28" />
          <X v-else :size="28" />
        </button>
      </div>

      <div class="flex justify-center">
        <div class="flex items-center gap-[10px]">
          <NuxtLink :to="ROUTES.home.base">
            <img
              :src="isDark ? logoWhite : logoBlack"
              alt="viernulvier Logo"
              class="h-10 lg:h-[60px] w-auto transition-all"
            />
          </NuxtLink>
          <span v-if="isAdmin" class="text-xl lg:text-2xl font-black text-gray-400 tracking-[-1px]">ADMIN</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 lg:gap-[15px]">

        <div :class="[isAdmin ? 'hidden md:flex' : 'hidden sm:flex']" class="items-center gap-2 lg:gap-[15px]">
          <button @click="toggleLocale" class="btn-outline">
            {{ locale === 'nl' ? 'EN' : 'NL' }}
          </button>

          <button @click="toggleDark" class="btn-outline flex items-center justify-center gap-2">
            <Sun v-if="isDark" :size="16" />
            <Moon v-else :size="16" />
            <span :class="isAdmin ? 'hidden xl:inline' : 'hidden lg:inline'">
              {{ isDark ? 'LIGHT' : 'DARK' }}
            </span>
          </button>
        </div>

        <!-- Admin-only logout button -->
        <button
          v-if="isAdmin"
          @click="handleLogout"
          class="hidden md:flex btn-danger">
          <LogOut :size="16" />
          <span class="hidden xl:inline">{{ t('nav.logout') }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile hamburger menu -->
    <div v-if="isMenuOpen"
         class="lg:hidden absolute top-full left-0 w-full bg-[var(--background)] border-b-4 border-[var(--foreground)] px-8 py-8 shadow-xl">
      <nav class="flex flex-col gap-6">

        <template v-if="!isAdmin">
          <NuxtLink
            v-for="item in navItems"
            :key="item.route"
            :to="item.route"
            @click="isMenuOpen = false"
            class="nav-item text-lg"
          >
            {{ t(`nav.${item.label}`) }}
          </NuxtLink>
        </template>

        <!-- buttons appear in hamburger menu when screen size is too small to show in header -->
        <div
          class="pt-6 border-t-2 border-[var(--muted-foreground)] flex flex-wrap gap-4"
          :class="[isAdmin ? 'md:hidden' : 'sm:hidden']"
        >
          <button @click="toggleLocale" class="btn-outline">
            {{ locale === 'nl' ? 'EN' : 'NL' }}
          </button>

          <button @click="toggleDark" class="btn-outline flex items-center gap-2">
            <Sun v-if="isDark" :size="16" />
            <Moon v-else :size="16" />
            {{ isDark ? 'LIGHT' : 'DARK' }}
          </button>

          <button
            v-if="isAdmin"
            @click="handleLogout"
            class="btn-danger"
          >
            <LogOut :size="16" />
            {{ t('nav.logout')}}
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-item {
  @apply no-underline text-[var(--muted-foreground)] font-[900] text-[12px] tracking-[2px] transition-colors hover:text-[var(--foreground)] uppercase;
}

.nav-item.router-link-active {
  @apply text-[var(--foreground)] underline underline-offset-8 decoration-[3px];
}

</style>

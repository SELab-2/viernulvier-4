<script setup>
/**
 * Header Component handles:
 * - Navigation
 * - Localization (EN / NL)
 * - Theme switching (Dark / Light)
 * - Admin-specific actions (Logout functionality)
 * Features a dynamic responsive design that adapts based on the user's role.
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
const isVisible = ref(true)
const lastScrollPosition = ref(0)
let isInitialLoad = true
const route = useRoute()

const navItems = [
  { label: 'home', route: ROUTES.home.base },
  { label: 'archive', route: ROUTES.productions.base },
  { label: 'stories', route: ROUTES.stories.base },
  { label: 'prints', route: ROUTES.prints.base },
]

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

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

// Smart sticky logic: hide on scroll down, show on scroll up

const handleScroll = () => {
  const currentScroll = window.scrollY
  const scrollDelta = currentScroll - lastScrollPosition.value

  if (isInitialLoad) {
    isVisible.value = true
    lastScrollPosition.value = currentScroll
    return
  }

  if (currentScroll < 50) {
    isVisible.value = true
  }
  else if (scrollDelta > 10) {
    isVisible.value = false
  }
  else if (scrollDelta < -10) {
    isVisible.value = true
  }
  lastScrollPosition.value = currentScroll
}

const resetHeader = () => {
  isVisible.value = true
  isInitialLoad = true
  setTimeout(() => {
    isInitialLoad = false
  }, 100)
}

watch(() => route.fullPath, () => {
  resetHeader()
})

onMounted(() => {
  lastScrollPosition.value = window.scrollY
  resetHeader()

  window.addEventListener('scroll', handleScroll)

  if (document.documentElement.classList.contains('dark')) {
    isDark.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
            {{ t('nav.' + item.label).toUpperCase() }}
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
          class="hidden md:flex items-center gap-2 rounded-md bg-rose-600 border-2 border-rose-600 px-4 py-2 text-[11px] font-black text-white hover:bg-[var(--foreground)] hover:border-[var(--foreground)] transition-colors">
          <LogOut :size="16" />
          <span class="hidden xl:inline">{{ t('nav.logout').toUpperCase() }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile hamburger menu -->
    <div v-if="isMenuOpen"
         class="absolute top-full left-0 w-full bg-[var(--background)] border-b-4 border-[var(--foreground)] px-8 py-8 shadow-xl">
      <nav class="flex flex-col gap-6">

        <template v-if="!isAdmin">
          <NuxtLink
            v-for="item in navItems"
            :key="item.route"
            :to="item.route"
            @click="isMenuOpen = false"
            class="nav-item text-lg"
          >
            {{ t(`nav.${item.label}`).toUpperCase() }}
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
            class="flex items-center gap-2 rounded-md bg-rose-600 px-[21px] py-[7px] text-[11px] font-black text-white hover:bg-[var(--foreground)] transition-colors"
          >
            <LogOut :size="16" />
            {{ t('nav.logout').toUpperCase() }}
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-item {
  @apply no-underline text-[var(--muted-foreground)] font-[900] text-[12px] tracking-[2px] transition-colors hover:text-[var(--foreground)];
}

.nav-item.router-link-active {
  @apply text-[var(--foreground)] underline underline-offset-8 decoration-[3px];
}

.btn-outline {
  background: none;
  border: 2px solid var(--foreground);
  color: var(--foreground);
  border-radius: 0.375rem;
  padding: 7px 21px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: var(--foreground);
  color: var(--background);
}
</style>
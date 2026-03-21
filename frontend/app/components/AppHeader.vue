<script setup>
import { ref } from 'vue'
import { ROUTES } from '~/utils/routes'
import { Sun, Moon, LogOut, Menu, X } from 'lucide-vue-next'

import logoBlack from '~/assets/logo_black.svg'
import logoWhite from '~/assets/logo_white.svg'

const { isLoggedIn, logout } = useAuth()
const isAdmin = isLoggedIn // to test admin: const isAdmin = ref(true)

const { t, locale, setLocale } = useI18n()
const isDark = ref(false)
const isMenuOpen = ref(false)

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
</script>

<template>
  <header class="sticky top-0 z-[100] border-b-4 border-[var(--foreground)] bg-[var(--background)] transition-colors duration-300">
    <div
      class="mx-auto grid max-w-[1400px] grid-cols-3 items-center py-4 lg:py-6 px-6 lg:px-12 2xl:px-[120px]"
    >
      <div class="flex items-center justify-start">
        <nav v-if="!isAdmin" class="hidden lg:flex gap-[20px] xl:gap-[30px]">
          <NuxtLink :to="ROUTES.home.base" class="nav-item">{{ t('nav.home').toUpperCase() }}</NuxtLink>
          <NuxtLink :to="ROUTES.productions.base" class="nav-item">{{ t('nav.archive').toUpperCase() }}</NuxtLink>
          <NuxtLink :to="ROUTES.stories.base" class="nav-item">{{ t('nav.stories').toUpperCase() }}</NuxtLink>
          <NuxtLink :to="ROUTES.prints.base" class="nav-item">{{ t('nav.prints').toUpperCase() }}</NuxtLink>
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

        <button
          v-if="isAdmin"
          @click="handleLogout"
          class="hidden md:flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-[11px] font-black text-white hover:bg-[var(--foreground)] transition-colors">
          <LogOut :size="16" />
          <span class="hidden xl:inline">{{ t('nav.logout').toUpperCase() }}</span>
        </button>
      </div>
    </div>

    <div v-if="isMenuOpen"
         class="absolute top-full left-0 w-full bg-[var(--background)] border-b-4 border-[var(--foreground)] px-8 py-8 shadow-xl">
      <nav class="flex flex-col gap-6">
        <template v-if="!isAdmin">
          <NuxtLink v-for="item in ['home', 'productions', 'stories', 'prints']" :key="item" :to="ROUTES[item].base" @click="isMenuOpen = false" class="nav-item text-lg">
            {{ t(`nav.${item === 'productions' ? 'archive' : item}`).toUpperCase() }}
          </NuxtLink>
        </template>

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

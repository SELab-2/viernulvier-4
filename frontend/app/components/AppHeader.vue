<script setup>
//TODO: aanpasbare grootte
//TODO: dropdown menu (nieuwe component)
//TODO: als je back doet na error, style klopt niet meer, check!

import { ref } from 'vue'
import { ROUTES } from '~/utils/routes'
import { Sun, Moon, LogOut} from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()

const { isLoggedIn, logout } = useAuth()
const isAdmin = isLoggedIn // use 'const isAdmin = ref(true)' to check admin header

const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

const handleLogout = async () => {
  if (confirm(t('auth.confirmLogout'))) {
    logout()
  }
}

</script>

<template>
  <header class="sticky top-0 z-[100] border-b-4 border-[var(--foreground)] bg-[var(--background)] px-12 py-6 transition-colors duration-300">
    <div class="mx-auto flex max-w-[1400px] items-center justify-between px-[50px]">
      <div class="flex flex-1 items-center">
        <nav v-if="!isAdmin" class="flex flex-1 gap-[30px]">
          <NuxtLink :to="ROUTES.home.base" class="nav-item">
            {{ t('nav.home').toUpperCase() }}
          </NuxtLink>

          <NuxtLink :to="ROUTES.productions.base" class="nav-item">
            {{ t('nav.archive').toUpperCase() }}
          </NuxtLink>

          <NuxtLink :to="ROUTES.stories.base" class="nav-item">
            {{ t('nav.stories').toUpperCase() }}
          </NuxtLink>

          <NuxtLink :to="ROUTES.prints.base" class="nav-item">
            {{ t('nav.prints').toUpperCase() }}
          </NuxtLink>
        </nav>
      </div>

      <div class="flex justify-center flex-none">
        <div class="flex items-center gap-[10px]">
          <NuxtLink :to="ROUTES.home.base">
            <img
              :src="isDark ? '/logo_white.svg' : '/logo_black.svg'"
              alt="viernulvier Logo"
              class="h-[60px] w-auto"
            />
          </NuxtLink>
          <span v-if="isAdmin" class="text-2xl font-black text-gray-400 tracking-[-1px]">ADMIN</span>
        </div>
      </div>

      <div class="flex flex-1 items-center justify-end">
        <div class="flex flex-1 justify-end gap-[15px]">
          <button @click="toggleLocale" class="btn-outline">
            {{ locale === 'nl' ? 'EN' : 'NL' }}
          </button>

          <button @click="toggleDark" class="btn-outline flex items-center justify-center gap-2">
            <Sun v-if="isDark" :size="16" />
            <Moon v-else :size="16" />
            <span>{{ isDark ? 'LIGHT' : 'DARK' }}</span>
          </button>

          <button
            v-if="isAdmin"
            @click="handleLogout"
            class="flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-[11px] font-black text-white transition hover:bg-[var(--foreground)]">
            <LogOut :size="16" />
            {{ t('nav.logout').toUpperCase() }}
          </button>
        </div>
      </div>

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
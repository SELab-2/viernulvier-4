<script setup>
import { ref } from 'vue'
import { ROUTES } from '~/utils/routes'
import { ArrowRight, Sun, Moon } from 'lucide-vue-next' //TODO: afbeeldingen bij buttons

const isAdmin = ref(true) //TODO: zeg in pr dat je isAdmin op true moet zetten om te testen

const { t, locale, setLocale } = useI18n()

const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

const logout = () => {
  console.log('Uitloggen...')
  // TODO: vul aan
}

</script>

<template>
  <header class="custom-header" :class="{ 'dark-mode': isDark, 'is-admin': isAdmin }">
    <div class="container">
      <nav v-if="!isAdmin" class="nav-links">
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

      <div class="logo">
        <NuxtLink :to="ROUTES.home.base">
          <img
            :src="isDark ? '/logo_white.svg' : '/logo_black.svg'"
            alt="viernulvier Logo"
            class="logo-img"
          />
        </NuxtLink>
        <span v-if="isAdmin" class="admin-label">ADMIN</span>
      </div>

      <div class="actions">
        <button @click="toggleLocale" class="btn-outline">
          {{ locale.toUpperCase() }}
        </button>
        <button @click="toggleDark" class="btn-outline">
          {{ isDark ? 'LIGHT' : 'DARK' }}
        </button>
        <button v-if="isAdmin" @click="logout" class="btn-logout">
          <LogOut :size="16" />
          {{ t('nav.logout').toUpperCase() }}
        </button>

      </div>

    </div>
  </header>
</template>

<style scoped>
.custom-header {
  border-bottom: 4px solid var(--foreground);
  background-color: var(--background);
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-label {
  font-weight: 900;
  font-size: 24px;
  color: #9ca3af;
  letter-spacing: -1px;
}

.logo-img {
  height: 60px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 30px;
  flex: 1;
}

.nav-item {
  text-decoration: none;
  color: var(--muted-foreground);
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 2px;
}

.nav-item:hover {
  color: var(--foreground);
  text-underline-offset: 8px;
  text-decoration-thickness: 3px;
}

.nav-item.router-link-active {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 8px;
  text-decoration-thickness: 3px;
}

.actions {
  display: flex;
  gap: 15px;
  flex: 1;
  justify-content: flex-end;
}

.btn-outline {
  background: none;
  border: 2px solid var(--foreground);
  color: var(--foreground);
  border-radius: 6px /*var(-radius)*/;
  padding: 7px 21px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.btn-logout {
  background-color: #e11d48; /*TODO: houden we dit rood?*/
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-logout:hover {
  background-color: var(--foreground);
}

</style>
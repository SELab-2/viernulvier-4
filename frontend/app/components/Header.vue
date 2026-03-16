<script setup>
import { ref } from 'vue'
import { ArrowRight, Sun, Moon } from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()

const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

</script>

<template>
  <header class="custom-header" :class="{ 'dark-mode': isDark }">
    <div class="container">
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-item">{{ t('nav.home').toUpperCase() }}</NuxtLink>
        <NuxtLink to="/archive" class="nav-item"> {{ t('nav.archive').toUpperCase() }}</NuxtLink>
        <NuxtLink to="/blogs" class="nav-item">{{ t('nav.stories').toUpperCase() }}</NuxtLink>
        <NuxtLink to="/prints" class="nav-item">{{ t('nav.prints').toUpperCase() }}</NuxtLink>
      </nav>

      <div class="logo">
        <NuxtLink to="/">
          <img
            :src="isDark ? '/logo_white.svg' : '/logo_black.svg'"
            alt="viernulvier Logo"
            style="height: 60px; width: auto;"
          />
        </NuxtLink>
      </div>

      <div class="actions">
        <button @click="toggleLocale" class="btn-outline">
          {{ locale.toUpperCase() }}
        </button>
        <button @click="toggleDark" class="btn-outline">
          {{ isDark ? 'LIGHT' : 'DARK' }}
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
  gap: 20px;
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

</style>
<script setup>
import { ref } from 'vue'

const isDarkMode = ref(false)

function toggleDark() {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<template>
  <header class="custom-header" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-item">HOME</NuxtLink>
        <NuxtLink to="/archive" class="nav-item">ARCHIEF</NuxtLink>
        <NuxtLink to="/blogs" class="nav-item">VERHALEN</NuxtLink>
        <NuxtLink to="/uploads" class="nav-item">DRUKWERK</NuxtLink>
      </nav>

      <div class="logo">
        <NuxtLink to="/">
          <img
            :src="isDarkMode ? '/logo_white.svg' : '/logo_black.svg'"
            alt="viernulvier Logo"
            style="height: 60px; width: auto;"
          />
        </NuxtLink>
      </div>

      <div class="actions">
        <button class="btn-outline">NL / EN</button>
        <button @click="toggleDark" class="btn-outline">
          {{ isDarkMode ? 'LIGHT' : 'DARK' }}
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
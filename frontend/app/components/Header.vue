<script setup lang="ts">

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Archief', path: '/archief' },
  { name: 'Verhalen', path: '/verhalen' },
  {name: 'Drukwerk', path: '/drukwerk' }
]
</script>

<template>
  <header class="header">
    <nav class="container">
      <div class="logo">
        <NuxtLink to="/">VIERNULVIER ARCHIVE</NuxtLink>
      </div>

      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.path">
          <NuxtLink :to="link.path" class="nav-item">
            {{ link.name }}
          </NuxtLink>
        </li>
      </ul>

    </nav>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #eaeaea;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  color: #2d3436;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-item {
  text-decoration: none;
  color: #636e72;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-item:hover, .router-link-active {
  color: #00dc82; /* Nuxt Green */
}

.btn-primary {
  background-color: #00dc82;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-links {
    display: none; /* Simple mobile hide - you can add a hamburger menu later */
  }
}
</style>
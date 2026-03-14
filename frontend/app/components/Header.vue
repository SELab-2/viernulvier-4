<template>
  <header class="custom-header">
    <div class="container">
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-item">HOME</NuxtLink>
        <NuxtLink to="/archive" class="nav-item">ARCHIEF</NuxtLink>
        <NuxtLink to="/blogs" class="nav-item">VERHALEN</NuxtLink>
        <NuxtLink to="/uploads" class="nav-item">DRUKWERK</NuxtLink>
      </nav>

      <div class="logo">
        <NuxtLink to="/">
          <img src="/logo_black.svg" alt="viernulvier Logo" class="logo-img" style="height: 60px; width: auto;"/>
        </NuxtLink>
      </div>

      <div class="actions">
        <button class="btn-outline">NL / EN</button>
        <button class="btn-outline">DARK</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.custom-header {
  border-bottom: 4px solid black;
  padding: 1.5rem 0;
  background: white;
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
  padding: 0 20px;
}

.nav-links {
  display: flex;
  gap: 20px;
  flex: 1;
}

.nav-item {
  text-decoration: none;
  color: #999;
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 2px;
}

.nav-item:hover, .router-link-active {
  color: black;
  text-decoration: underline;
  text-underline-offset: 8px;
}

.logo {
  text-align: center;
  flex: 1;
}

.logo a {
  text-decoration: none;
  color: black;
}

.actions {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.btn-outline {
  background: none;
  border: 2px solid black;
  padding: 5px 15px;
  font-weight: 900;
  font-size: 10px;
  cursor: pointer;
}
</style>
<!--
  layouts/default.vue

  The default layout applied to every page in the application.

  Wraps each page in a full-screen container that handles:
  - Light/dark mode background and text colors + languages
  - The shared AppFooter rendered below all page content

  The <slot> is where the current page component (from pages/) is injected
  by Nuxt's <NuxtLayout> + <NuxtPage> setup in app.vue.

-->

<template>
  <div
    class="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white antialiased"
  >
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

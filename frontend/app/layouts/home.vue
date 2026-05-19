<template>
  <div class="flex flex-col h-dvh overflow-hidden bg-background">
    <AppHeader :is-home="true" />

    <main>
      <slot />
    </main>
  </div>
</template>

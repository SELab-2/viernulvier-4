<script setup lang="ts"></script>

<template>
  <div class="page-container py-8" aria-busy="true" aria-label="Loading series">
    <!-- Grid Header skeleton -->
    <div class="flex items-center gap-3 mb-4">
      <div class="h-7 w-24 bg-muted animate-pulse rounded" />
      <div class="flex-1 h-px bg-muted" />
      <div class="h-4 w-16 bg-muted animate-pulse rounded" />
    </div>

    <!-- Grid skeleton -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      <div v-for="i in 20" :key="i" class="flex flex-col items-center gap-1.5">
        <!-- Folder icon -->
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 bg-muted animate-pulse rounded-lg"
        />
        <!-- Title -->
        <div class="h-3 bg-muted animate-pulse rounded w-3/4" />
        <!-- Production count -->
        <div class="h-3 bg-muted animate-pulse rounded w-1/2" />
      </div>
    </div>
  </div>
</template>

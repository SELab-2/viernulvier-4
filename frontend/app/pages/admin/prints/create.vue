<!--
  pages/admin/prints/create.vue

  Admin Print Create Page

  Key features include:
  - Dutch title input, English title input with fallback on Dutch
  - Dutch description input, English description input with fallback on Dutch
  - Print type selection
  - File upload required (pdf, png, jpg, webp)

  On submission:
  - A new print entry is created via the API
  - The user is redirected to the admin prints page

  The page coordinates:
  - Form state and submission handling
  - Navigation and error display

-->

<script setup lang="ts"></script>

<template>
  <AdminPrintsForm mode="create" />
</template>

<style scoped></style>

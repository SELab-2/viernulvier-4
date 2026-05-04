<!--
  pages/admin/prints/edit/[id].vue

  Admin Print Edit Page

  Key features include:
  - Dutch title input, English title input with fallback on Dutch
  - Dutch description input, English description input with fallback on Dutch
  - Print type selection
  - File upload required (pdf, png, jpg, webp)

  On submission:
  - An existing print entry will be modified via the API
  - The user is redirected to the admin prints page

  The page coordinates:
  - Form state and submission handling
  - Navigation and error display

-->

<script setup lang="ts"></script>

<template>
  <AdminPrintsForm mode="edit" />
</template>

<style scoped></style>

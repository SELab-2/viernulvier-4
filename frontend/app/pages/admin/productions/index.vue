<!--
  Admin page for productions management.
  It reuses the same components as the normal archive page, but with the is-admin prop set to true.
-->
<template>
  <div>
    <ArchiveHeader is-admin />
    <ArchiveSearchSection is-admin />
    <ArchiveBody is-admin />
  </div>
</template>
<script setup lang="ts"></script>

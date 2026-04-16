<!--
archive/index.vue

Main archive page container.
Responsible for:
- Composing the archive page layout
- Combining header, search/filter section, and results body
- Acting as a structural wrapper (no logic)
-->
<template>
  <div>
    <ArchiveHeader />
    <ArchiveSearchSection />
    <ArchiveBody />
  </div>
</template>

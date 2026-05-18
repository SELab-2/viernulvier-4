<!--
  components/admin/dashboard/StatsWidget.vue
  ==========================================
  Displays a single stat card with icon, i18n label and fetched count.
  The card is NOT clickable — navigation lives in the QuickLinks sidebar.
  Shows an animated skeleton while data is loading.
-->
<script setup lang="ts">
defineProps<{
  label: string;
  count: number | null;
  loading: boolean;
  icon: string;
}>();
</script>

<template>
  <div
    class="stat-card flex flex-col gap-4 rounded-2xl border border-card-border bg-card px-6 py-6 shadow-sm"
  >
    <!-- Icon + label row -->
    <div class="flex items-center justify-between gap-2">
      <span
        class="font-brand font-black text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
      >
        {{ label }}
      </span>
      <span class="text-2xl select-none leading-none" aria-hidden="true">{{
        icon
      }}</span>
    </div>

    <!-- Count or skeleton -->
    <div v-if="loading" class="h-12 w-28 bg-muted rounded-lg animate-pulse" />
    <span
      v-else
      class="font-brand font-black text-5xl leading-none tracking-tight text-foreground tabular-nums"
    >
      {{ count ?? "—" }}
    </span>

    <!-- Accent underline -->
    <div
      class="h-[2px] w-8 rounded-full bg-accent/50 mt-auto"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.stat-card {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.stat-card:hover {
  box-shadow: 0 8px 28px -8px color-mix(in srgb, var(--accent) 18%, transparent);
  transform: translateY(-1px);
}
</style>

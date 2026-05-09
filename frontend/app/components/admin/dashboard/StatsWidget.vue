<!--
  components/admin/dashboard/StatsWidget.vue
  ==========================================
  Displays a single stat card: icon, label, and fetched count.
  Used in the admin dashboard overview row.
-->
<script setup lang="ts">
defineProps<{
  label: string;
  count: number | null;
  loading: boolean;
  icon: string;
  to: string;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col gap-3 rounded-xl border border-card-border bg-card px-6 py-5 hover:bg-card-hover hover:border-accent/40 transition-all duration-150 shadow-sm"
  >
    <div class="flex items-center justify-between">
      <span
        class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ label }}
      </span>
      <span class="text-xl" aria-hidden="true">{{ icon }}</span>
    </div>

    <div v-if="loading" class="h-9 w-20 bg-muted rounded-md animate-pulse" />
    <span
      v-else
      class="text-4xl font-brand font-black text-foreground leading-none"
    >
      {{ count ?? "—" }}
    </span>

    <span
      class="text-[10px] font-brand font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity"
    >
      View all →
    </span>
  </NuxtLink>
</template>

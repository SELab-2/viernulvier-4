<!--
  pages/admin/index.vue
  =====================
  Admin dashboard home page.

  Composed of:
    - A welcome header showing the logged-in username
    - A stat row (productions, blogs, events, prints)
    - Quick-link cards to each admin section
    - A password-reset card

  Data is fetched via useAdminStats() which hits each API once
  with limit:1 to read totalItems cheaply.
-->
<script setup lang="ts">
import { ROUTES } from "~/utils/routes";
import { useAdminStats } from "~/composables/useAdminStats";

const { account, isLoggedIn, isSuperAdmin } = useAuth();
const { stats, loading, fetchStats } = useAdminStats();

// Guard: redirect to login if not authenticated
onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo(ROUTES.admin.login.base);
    return;
  }
  fetchStats();
});

// Stat card definitions — icon, label, route and which stats key to read
const statCards = [
  {
    key: "productions",
    label: "Productions",
    icon: "🎭",
    to: ROUTES.admin.productions.base,
  },
  { key: "blogs", label: "Stories", icon: "📖", to: ROUTES.admin.stories.base },
  { key: "events", label: "Events", icon: "🎟", to: ROUTES.admin.events.base },
  { key: "prints", label: "Prints", icon: "🖼", to: ROUTES.admin.prints.base },
] as const;
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <!-- Welcome header -->
      <header>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-1"
        >
          Admin dashboard
        </p>
        <h1
          class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
        >
          Welcome back{{ account?.username ? `, ${account.username}` : "" }}
        </h1>
      </header>

      <!-- Stat widgets row -->
      <section>
        <h2
          class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-4"
        >
          Overview
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminDashboardStatsWidget
            v-for="card in statCards"
            :key="card.key"
            :label="card.label"
            :icon="card.icon"
            :to="card.to"
            :count="stats[card.key]"
            :loading="loading"
          />
        </div>
      </section>

      <!-- Quick-link cards -->
      <AdminDashboardQuickLinks :is-super-admin="isSuperAdmin" />

      <!-- Password reset -->
      <div class="max-w-md">
        <AdminDashboardPasswordReset />
      </div>
    </div>
  </div>
</template>

<!--
  pages/admin/index.vue
  =====================
  Admin dashboard home page.

  Layout (desktop):
    - Full-width welcome header with username + greeting
    - 4-column stat widget row (non-clickable)
    - Two-column section:
        left  — password-reset card
        right — quick-links sidebar (mirrors admin header nav)

  All user-facing text uses i18n keys from admin.dashboard.*.
  Stats are fetched cheaply (limit:1) via useAdminStats().
-->
<script setup lang="ts">
import { ROUTES } from "~/utils/routes";
import { useAdminStats } from "~/composables/useAdminStats";

const { account, isLoggedIn, isSuperAdmin } = useAuth();
const { t } = useI18n();
const { stats, loading, fetchStats } = useAdminStats();

// Guard: redirect to login when not authenticated
onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo(ROUTES.admin.login.base);
    return;
  }
  fetchStats();
});

// Stat card definitions — i18n label, emoji icon, stats key to read
const statCards = [
  {
    key: "productions" as const,
    label: computed(() => t("admin.dashboard.productions")),
    icon: "🎭",
  },
  {
    key: "blogs" as const,
    label: computed(() => t("admin.dashboard.stories")),
    icon: "📖",
  },
  {
    key: "events" as const,
    label: computed(() => t("admin.dashboard.events")),
    icon: "🎟",
  },
  {
    key: "prints" as const,
    label: computed(() => t("admin.dashboard.prints")),
    icon: "🖼",
  },
];
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <!-- Welcome header -->
      <header class="flex flex-col gap-1">
        <p
          class="font-brand font-black text-[9px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Admin
        </p>
        <h1
          class="font-brand font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground leading-none"
        >
          {{ t("admin.dashboard.welcome") }}
          ,
          <span v-if="account?.username" class="text-accent">
            {{ account.username }}</span
          >
        </h1>
      </header>

      <!-- Stat widgets (non-clickable) -->
      <section>
        <p
          class="font-brand font-black text-[9px] uppercase tracking-[0.14em] text-muted-foreground mb-4"
        >
          {{ t("admin.dashboard.overview") }}
        </p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminDashboardStatsWidget
            v-for="card in statCards"
            :key="card.key"
            :label="card.label.value"
            :icon="card.icon"
            :count="stats[card.key]"
            :loading="loading"
          />
        </div>
      </section>

      <!-- Bottom section: password reset + quick links side by side -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Password reset card -->
        <AdminDashboardPasswordReset />

        <!-- Quick links sidebar -->
        <AdminDashboardQuikLinks :is-super-admin="isSuperAdmin" />
      </section>
    </div>
  </div>
</template>

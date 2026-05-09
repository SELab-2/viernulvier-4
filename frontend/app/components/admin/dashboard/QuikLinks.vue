<!--
  components/admin/dashboard/QuickLinks.vue
  =========================================
  Grid of icon-backed navigation cards linking to each admin section.
  Super-admin users also see a link to the accounts page.
-->
<script setup lang="ts">
import { BookOpen, Film, Ticket, Printer, Users } from "lucide-vue-next";
import { ROUTES } from "~/utils/routes";

defineProps<{ isSuperAdmin: boolean }>();

const { t } = useI18n();

const links = [
  {
    label: "Stories",
    description: "Create and manage blog posts",
    icon: BookOpen,
    to: ROUTES.admin.stories.base,
    color: "text-purple-500",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
  },
  {
    label: "Productions",
    description: "Browse and edit productions",
    icon: Film,
    to: ROUTES.admin.productions.base,
    color: "text-blue-500",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
  },
  {
    label: "Events",
    description: "View and configure events",
    icon: Ticket,
    to: ROUTES.admin.events.base,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
  },
  {
    label: "Prints",
    description: "Upload and manage printed materials",
    icon: Printer,
    to: ROUTES.admin.prints.base,
    color: "text-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
  },
];
</script>

<template>
  <section>
    <h2
      class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-4"
    >
      Quick access
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        class="flex items-start gap-4 rounded-xl border border-card-border bg-card px-5 py-4 hover:bg-card-hover hover:border-accent/40 transition-all duration-150 group"
      >
        <div
          :class="[
            link.bg,
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          ]"
        >
          <component :is="link.icon" :size="18" :class="link.color" />
        </div>
        <div class="min-w-0">
          <p
            class="font-brand font-black text-[13px] uppercase tracking-tight text-foreground"
          >
            {{ link.label }}
          </p>
          <p class="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {{ link.description }}
          </p>
        </div>
      </NuxtLink>

      <!-- Accounts — super admin only -->
      <NuxtLink
        v-if="isSuperAdmin"
        :to="ROUTES.admin.accounts.base"
        class="flex items-start gap-4 rounded-xl border border-card-border bg-card px-5 py-4 hover:bg-card-hover hover:border-accent/40 transition-all duration-150 group"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 dark:bg-rose-500/15"
        >
          <Users :size="18" class="text-rose-500" />
        </div>
        <div class="min-w-0">
          <p
            class="font-brand font-black text-[13px] uppercase tracking-tight text-foreground"
          >
            Accounts
          </p>
          <p class="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Manage admin accounts
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

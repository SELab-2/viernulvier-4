<!--
  components/admin/dashboard/QuickLinks.vue
  =========================================
  Vertical list of navigation links that mirrors the admin header nav.
  Includes accounts link when the user is a super-admin.
  All labels come from i18n so both NL and EN work automatically.
-->
<script setup lang="ts">
import { BookOpen, Film, Ticket, Printer, Users } from "lucide-vue-next";
import { ROUTES } from "~/utils/routes";

defineProps<{ isSuperAdmin: boolean }>();

const { t } = useI18n();

// Same sections as the admin header nav (minus dashboard itself)
const links = computed(() => [
  {
    label: t("admin.dashboard.stories"),
    desc: t("admin.dashboard.storiesDesc"),
    icon: BookOpen,
    to: ROUTES.admin.stories.base,
    accent: "text-purple-500",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
  },
  {
    label: t("admin.dashboard.productions"),
    desc: t("admin.dashboard.productionsDesc"),
    icon: Film,
    to: ROUTES.admin.productions.base,
    accent: "text-blue-500",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
  },
  {
    label: t("admin.dashboard.prints"),
    desc: t("admin.dashboard.printsDesc"),
    icon: Printer,
    to: ROUTES.admin.prints.base,
    accent: "text-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
  },
]);
</script>

<template>
  <nav aria-label="Quick links">
    <p
      class="font-brand font-black text-[9px] uppercase tracking-[0.14em] text-muted-foreground mb-3"
    >
      {{ t("admin.dashboard.quickLinks") }}
    </p>

    <ul class="flex flex-col gap-2">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          class="quick-link flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 hover:bg-card-hover hover:border-accent/40 transition-all duration-150 group"
        >
          <!-- Icon bubble -->
          <div
            :class="[
              link.bg,
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            ]"
          >
            <component :is="link.icon" :size="15" :class="link.accent" />
          </div>

          <!-- Label + description -->
          <div class="min-w-0 flex-1">
            <p
              class="font-brand font-black text-[11px] uppercase tracking-wider text-foreground truncate"
            >
              {{ link.label }}
            </p>
            <p
              class="text-[10px] text-muted-foreground truncate leading-snug mt-0.5"
            >
              {{ link.desc }}
            </p>
          </div>

          <!-- Arrow -->
          <svg
            class="w-3 h-3 shrink-0 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </NuxtLink>
      </li>

      <!-- Accounts — super-admin only -->
      <li v-if="isSuperAdmin">
        <NuxtLink
          :to="ROUTES.admin.accounts.base"
          class="quick-link flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 hover:bg-card-hover hover:border-rose-400/40 transition-all duration-150 group"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 dark:bg-rose-500/15"
          >
            <Users :size="15" class="text-rose-500" />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="font-brand font-black text-[11px] uppercase tracking-wider text-foreground truncate"
            >
              {{ t("admin.dashboard.accounts") }}
            </p>
            <p
              class="text-[10px] text-muted-foreground truncate leading-snug mt-0.5"
            >
              {{ t("admin.dashboard.accountsDesc") }}
            </p>
          </div>
          <svg
            class="w-3 h-3 shrink-0 text-muted-foreground/40 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

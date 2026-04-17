<script setup>
/**
 * Header Component
 *
 * Handles:
 * - Responsive Navigation (Desktop horizontal, Mobile hamburger)
 * - Localization (EN / NL)
 * - Theme switching (Dark / Light) — local ref, persisted in localStorage
 * - Admin-specific actions (Logout functionality)
 * - Sticky visibility logic (Hide on scroll down, show on scroll up)
 */

import { ref, onMounted, onUnmounted, watch } from "vue";
import { ROUTES } from "~/utils/routes";
import { LogOut, Menu, X } from "lucide-vue-next";

import logoBlack from "~/assets/logo_black.svg";
import logoWhite from "~/assets/logo_white.svg";

const { isLoggedIn, logout } = useAuth();
const isAdmin = ref(true);

const { t } = useI18n();

// ── Dark mode ────────────────────────────────────────────────────────────────
const isDark = ref(false);

const syncTheme = () => {
  if (typeof window === "undefined") return;
  isDark.value = document.documentElement.classList.contains("dark");
};

let themeObserver;

// ── Mobile menu ──────────────────────────────────────────────────────────────
const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// ── Admin logout ─────────────────────────────────────────────────────────────
const handleLogout = async () => {
  if (confirm(t("auth.confirmLogout"))) {
    logout();
  }
};

// ── Smart-sticky visibility ──────────────────────────────────────────────────
const isVisible = ref(true);
const lastScrollPosition = ref(0);
let isInitialLoad = true;
const route = useRoute();

const handleScroll = () => {
  const currentScroll = window.scrollY;
  const scrollDelta = currentScroll - lastScrollPosition.value;

  if (isInitialLoad) {
    isVisible.value = true;
    lastScrollPosition.value = currentScroll;
    return;
  }

  if (currentScroll < 50) {
    isVisible.value = true;
  } else if (scrollDelta > 10) {
    isVisible.value = false;
  } else if (scrollDelta < -10) {
    isVisible.value = true;
  }

  lastScrollPosition.value = currentScroll;
};

const resetHeader = () => {
  isVisible.value = true;
  isInitialLoad = true;
  setTimeout(() => {
    isInitialLoad = false;
  }, 100);
};

watch(
  () => route.fullPath,
  () => {
    resetHeader();
    isMenuOpen.value = false;
  },
);

// ── Resize — close mobile menu on desktop ────────────────────────────────────
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isMenuOpen.value = false;
    isVisible.value = true;
  }
};

onMounted(() => {
  lastScrollPosition.value = window.scrollY;
  resetHeader();

  syncTheme();
  themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);

  if (themeObserver) themeObserver.disconnect();
});

// ── Navigation items ─────────────────────────────────────────────────────────
const navItems = [
  { label: "home", route: ROUTES.home.base },
  { label: "archive", route: ROUTES.productions.base },
  { label: "stories", route: ROUTES.stories.base },
  { label: "prints", route: ROUTES.prints.base },
];

const adminNavItems = [
  { label: "producties", route: "/admin/producties" },
  { label: "events", route: "/admin/events" },
  { label: "verhalen", route: "/admin/verhalen" },
  { label: "drukwerk", route: "/admin/drukwerk" },
];
</script>

<template>
  <header
    :class="{ '-translate-y-full': !isVisible && !isMenuOpen }"
    class="sticky top-0 z-[100] border-b-4 border-[var(--foreground)] bg-[var(--background)] transition-transform duration-300 transform-gpu"
  >
    <div
      class="mx-auto grid max-w-[1400px] grid-cols-3 items-center py-4 lg:py-6 px-6 lg:px-12 2xl:px-[120px]"
    >
      <!-- ── Left: nav links (desktop) / hamburger (mobile) ──────────────── -->
      <div class="flex items-center justify-start">
        <nav v-if="!isAdmin" class="hidden lg:flex gap-[20px] xl:gap-[30px]">
          <NuxtLink
            v-for="item in navItems"
            :key="item.route"
            :to="item.route"
            class="nav-item"
          >
            {{ t("nav." + item.label) }}
          </NuxtLink>
        </nav>

        <button
          :class="[isAdmin ? 'md:hidden' : 'lg:hidden']"
          class="text-[var(--foreground)] outline-none"
          @click="toggleMenu"
        >
          <Menu v-if="!isMenuOpen" :size="28" />
          <X v-else :size="28" />
        </button>
      </div>

      <!-- ── Centre: logo ────────────────────────────────────────────────── -->
      <div class="flex justify-center">
        <div class="flex items-center gap-[10px]">
          <NuxtLink :to="ROUTES.home.base">
            <img
              :src="isDark ? logoWhite : logoBlack"
              alt="viernulvier Logo"
              class="h-10 lg:h-[60px] w-auto transition-all"
            />
          </NuxtLink>
          <span
            v-if="isAdmin"
            class="text-xl lg:text-2xl font-black text-gray-400 tracking-[-1px]"
            >ADMIN</span
          >
        </div>
      </div>

      <!-- ── Right: locale + dark-mode + logout ─────────────────────────── -->
      <div class="flex items-center justify-end gap-2 lg:gap-[15px]">
        <div
          :class="[isAdmin ? 'hidden md:flex' : 'hidden sm:flex']"
          class="items-center gap-2 lg:gap-[15px]"
        >
          <LocaleSelector />

          <ThemeToggle :is-compact="isAdmin" />
        </div>

        <button
          v-if="isAdmin"
          class="hidden md:flex btn-danger"
          @click="handleLogout"
        >
          <LogOut :size="16" />
          <span class="hidden xl:inline ml-2">{{ t("nav.logout") }}</span>
        </button>
      </div>
    </div>

    <nav
      v-if="isAdmin"
      class="hidden lg:flex border-t-2 border-[var(--foreground)]"
    >
      <div class="mx-auto w-full max-w-[1400px] flex">
        <NuxtLink
          v-for="item in adminNavItems"
          :key="item.route"
          :to="item.route"
          class="admin-nav-item"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <!-- ── Mobile hamburger menu ───────────────────────────────────────────── -->
    <div
      v-if="isMenuOpen"
      class="lg:hidden absolute top-full left-0 w-full bg-[var(--background)] border-b-4 border-[var(--foreground)] px-8 py-8 shadow-xl"
    >
      <nav class="flex flex-col gap-6">
        <template v-if="isAdmin">
          <NuxtLink
            v-for="item in adminNavItems"
            :key="item.route"
            :to="item.route"
            class="nav-item text-lg"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink
            v-for="item in navItems"
            :key="item.route"
            :to="item.route"
            class="nav-item text-lg"
            @click="isMenuOpen = false"
          >
            {{ t(`nav.${item.label}`) }}
          </NuxtLink>
        </template>

        <div
          :class="[isAdmin ? 'md:hidden' : 'sm:hidden']"
          class="pt-6 border-t-2 border-[var(--muted-foreground)] flex flex-wrap gap-4"
        >
          <LocaleSelector />

          <ThemeToggle />

          <button v-if="isAdmin" class="btn-danger" @click="handleLogout">
            <LogOut :size="16" />
            {{ t("nav.logout") }}
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-item {
  @apply no-underline text-[var(--muted-foreground)] font-[900] text-[12px] tracking-[2px]
         transition-colors hover:text-[var(--foreground)] uppercase;
}

.nav-item.router-link-active {
  @apply text-[var(--foreground)] underline underline-offset-8 decoration-[3px];
}

/* Admin balk specifieke styling */
.admin-nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  text-decoration: none;
  color: var(--muted-foreground);
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-right: 2px solid var(--foreground);
  transition: all 0.2s ease-in-out;
}

.admin-nav-item:last-child {
  border-right: none;
}

.admin-nav-item:hover,
.admin-nav-item.router-link-active {
  background-color: var(--foreground);
  color: var(--background);
}
</style>

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

const headerRef = ref(null);

const { t } = useI18n();
const route = useRoute();

// Accepts an isHome prop for when to go transparent.
const props = defineProps({
  isHome: {
    type: Boolean,
    default: false,
  },
});

const isTransparent = computed(() => {
  return props.isHome && !isMenuOpen.value;
});

// ── Admin ────────────────────────────────────────────────────────────────

const { isLoggedIn, isSuperAdmin, logout } = useAuth();

const isAtAdminPath = computed(() => route.path.startsWith("/admin"));
const showAdminInterface = computed(
  () => isLoggedIn.value && isAtAdminPath.value,
);

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

// ── Close dropdown menu if a click occurs outside the header.
const handleClickOutside = (e) => {
  if (
    isMenuOpen.value &&
    headerRef.value &&
    !headerRef.value.contains(e.target)
  ) {
    isMenuOpen.value = false;
  }
};

// ── Close dropdown menu when the 'Escape' key is pressed.
const handleEscape = (e) => {
  if (e.key === "Escape" && isMenuOpen.value) {
    isMenuOpen.value = false;
  }
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
  const breakpoint = showAdminInterface.value ? 1024 : 1280;
  if (window.innerWidth >= breakpoint) {
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

  window.addEventListener("click", handleClickOutside);
  window.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleEscape);

  if (themeObserver) themeObserver.disconnect();
});

// ── Navigation items ─────────────────────────────────────────────────────────
const navItems = [
  { label: "home", route: ROUTES.home.base },
  { label: "archive", route: ROUTES.productions.base },
  { label: "series", route: ROUTES.series.base },
  { label: "stories", route: ROUTES.stories.base },
  { label: "prints", route: ROUTES.prints.base },
];

const adminNavItems = [
  { label: "dashboard", route: ROUTES.admin.dashboard.base },
  { label: "productions", route: ROUTES.admin.productions.base },
  { label: "series", route: ROUTES.admin.series.base },
  { label: "stories", route: ROUTES.admin.stories.base },
  { label: "prints", route: ROUTES.admin.prints.base },
];
</script>

<template>
  <header
    ref="headerRef"
    :class="[
      !isVisible && !isMenuOpen ? '-translate-y-full' : '',
      isTransparent
        ? 'absolute w-full bg-transparent border-transparent header-transparent'
        : 'sticky bg-[var(--background)] border-b-4 border-[var(--foreground)]',
      'top-0 z-[100] transition-all duration-300 transform-gpu min-h-[80px] lg:min-h-[110px]',
    ]"
  >
    <div
      class="grid page-container grid-cols-[1fr_auto_1fr] items-center py-4 lg:py-6"
    >
      <!-- ── Left: nav links (desktop) / hamburger (mobile) ────────────────-->
      <div class="flex items-center justify-start">
        <nav
          v-if="!showAdminInterface"
          class="hidden xl:flex gap-[20px] xl:gap-[30px]"
        >
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
          class="lg:hidden outline-none transition-colors text-[var(--foreground)]"
          :class="showAdminInterface ? 'lg:hidden' : 'xl:hidden'"
          @click.stop="toggleMenu"
        >
          <Menu v-if="!isMenuOpen" :size="28" />
          <X v-else :size="28" />
        </button>
      </div>

      <!-- ── Centre: logo ────────────────────────────────────────────────── -->
      <div class="flex justify-center">
        <div class="flex items-center gap-[10px]">
          <NuxtLink
            :to="
              showAdminInterface
                ? ROUTES.admin.dashboard.base
                : ROUTES.home.base
            "
          >
            <img
              :src="isDark ? logoWhite : logoBlack"
              alt="viernulvier Logo"
              class="h-12 lg:h-[60px] w-auto transition-all"
            />
          </NuxtLink>
          <span
            v-if="showAdminInterface"
            class="text-xl lg:text-2xl font-black text-gray-400 tracking-[-1px]"
            >ADMIN</span
          >
        </div>
      </div>

      <!-- ── Right: locale + dark-mode + logout ─────────────────────────── -->
      <div class="flex items-center justify-end gap-2 lg:gap-[15px]">
        <div
          :class="[showAdminInterface ? 'hidden md:flex' : 'hidden sm:flex']"
          class="items-center gap-2 lg:gap-[15px]"
        >
          <LocaleSelector />
          <ThemeToggle :is-compact="showAdminInterface" />
        </div>

        <button
          v-if="showAdminInterface"
          class="hidden md:flex btn-danger"
          @click="handleLogout"
        >
          <LogOut :size="16" />
          <span class="hidden xl:inline ml-2">{{ t("nav.logout") }}</span>
        </button>
      </div>
    </div>

    <nav
      v-if="showAdminInterface"
      class="hidden lg:flex border-t-1 border-[var(--muted-foreground)] w-full bg-[var(--background)]"
    >
      <div class="page-container flex justify-between items-center">
        <NuxtLink
          v-for="item in adminNavItems"
          :key="item.route"
          :to="item.route"
          class="admin-nav-item"
        >
          {{ t("nav." + item.label) }}
        </NuxtLink>

        <NuxtLink
          v-if="isSuperAdmin"
          :to="ROUTES.admin.accounts.base"
          class="admin-nav-item"
        >
          {{ t("nav.accounts") }}
        </NuxtLink>
      </div>
    </nav>

    <!-- ── Mobile hamburger menu ───────────────────────────────────────────── -->
    <div
      v-if="isMenuOpen"
      :class="showAdminInterface ? 'lg:hidden' : 'xl:hidden'"
      class="absolute top-full left-0 w-full bg-[var(--background)] border-b-4 border-[var(--foreground)] page-container py-8 shadow-xl"
    >
      <nav class="flex flex-col gap-6">
        <template v-if="showAdminInterface">
          <NuxtLink
            v-for="item in adminNavItems"
            :key="item.route"
            :to="item.route"
            class="nav-item text-lg"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>

          <NuxtLink
            v-if="isSuperAdmin"
            :to="ROUTES.admin.accounts.base"
            class="nav-item text-lg"
            @click="isMenuOpen = false"
          >
            {{ t("nav.accounts") }}
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
          :class="[showAdminInterface ? 'md:hidden' : 'sm:hidden']"
          class="pt-6 border-t-2 border-[var(--muted-foreground)] flex flex-wrap gap-4"
        >
          <LocaleSelector />
          <ThemeToggle />

          <button
            v-if="showAdminInterface"
            class="btn-danger"
            @click="handleLogout"
          >
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

.admin-nav-item {
  display: flex;
  align-items: center;

  @apply no-underline text-[var(--muted-foreground)] font-[900] text-[11px] tracking-[2px] uppercase transition-all relative;

  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.admin-nav-item:hover {
  color: var(--foreground);
}

.admin-nav-item.router-link-active {
  color: var(--foreground);
  @apply underline underline-offset-[10px] decoration-[3px];
}
</style>

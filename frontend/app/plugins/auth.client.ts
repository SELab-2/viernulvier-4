/**
 * Client-side route guard that protects all /admin routes.
 * Runs before every navigation and redirects unauthenticated users to the login page.
 *
 * Uses sessionStorage directly (instead of useAuth) to avoid timing issues
 * with Nuxt state hydration. The auth state in sessionStorage is managed by useAuth.ts.
 *
 */
import { ROUTES } from "~/utils/routes";

export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach((to) => {
    const isAdminRoute = to.path.startsWith("/admin");
    const isLoginPage = to.path === ROUTES.admin.login.base;

    if (!isAdminRoute || isLoginPage) return true;

    const apiKey = sessionStorage.getItem("apiKey");

    if (!apiKey) {
      return ROUTES.admin.login.base;
    }

    return true;
  });
});

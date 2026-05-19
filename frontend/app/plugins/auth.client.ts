/**
 * Client-side route guard that protects all /admin routes.
 * Runs before every navigation and redirects unauthenticated users to the login page.
 *
 * Uses sessionStorage directly for initial synchronous checks to avoid timing issues
 * with Nuxt state hydration. The auth state in sessionStorage is managed by useAuth.ts.
 *
 */
import { ROUTES } from "~/utils/routes";

export default defineNuxtPlugin(() => {
  const { rehydrate, verifySession, verifySuperSession } = useAuth();
  rehydrate();

  const router = useRouter();

  router.beforeEach(async (to) => {
    const isAdminRoute = to.path.startsWith("/admin");
    const isLoginPage = to.path === ROUTES.admin.login.base;

    if (!isAdminRoute || isLoginPage) return true;

    // Send completely unauthenticated users to the login page immediately.
    const apiKey = sessionStorage.getItem("apiKey");

    if (!apiKey) {
      return ROUTES.admin.login.base;
    }

    const isSuperRoute = to.path.startsWith("/admin/accounts");

    if (isSuperRoute) {
      const isSuper = await verifySuperSession();

      if (!isSuper) {
        throw showError({
          statusCode: 404,
          statusMessage: "Page Not Found",
          fatal: true,
        });
      }

      return true;
    }

    // standard auth.
    const isValid = await verifySession();

    if (!isValid) {
      // Throw a fatal 500 error for ANY invalid key (malicious or expired)
      // keep the err message as vague as possible.
      throw showError({
        status: 500,
        statusText: "Internal Server Error",
        fatal: true,
      });
    }

    // this means a valid user.
    return true;
  });
});

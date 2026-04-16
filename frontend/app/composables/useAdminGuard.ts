/**
 * composables/useAdminGuard.ts
 *
 * Call this at the top of every admin page that requires authentication.
 * The guard waits until onMounted so that the session can be rehydrated
 * from sessionStorage before the check runs.
 */
export function useAdminGuard() {
  const { isLoggedIn } = useAuth();
  const route = useRoute();

  function redirectToLogin() {
    const redirect = route.fullPath;
    navigateTo(
      `${ROUTES.admin.login.base}?redirect=${encodeURIComponent(redirect)}`,
    );
  }

  // Check after mount so rehydrate() in app.vue has already run.
  onMounted(() => {
    if (!isLoggedIn.value) redirectToLogin();
  });

  // Also watch in case the session expires while the user is on the page.
  watch(isLoggedIn, (loggedIn) => {
    if (!loggedIn) redirectToLogin();
  });
}

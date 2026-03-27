/**
 * composables/useTheme.ts
 *
 * Single source of truth for the dark-mode preference.
 *
 * Using Nuxt's `useState` gives us a reactive value that is shared across
 * every component tree without a store.  Any component (Header, pages, …)
 * that calls `useThemee()` reads and mutates the same ref.
 *
 * Usage
 * -----
 *   const { isDark, toggle, init } = useTheme()
 *
 *   // In onMounted (client-only):
 *   init()          // reads localStorage / system preference, applies theme
 *
 *   // On button click:
 *   toggle()        // flips the value, persists it, re-applies the theme
 */

export const useTheme = () => {
  // useState key must be unique and stable; Nuxt keeps this alive for the
  // lifetime of the app so all callers share the exact same reactive ref.
  const isDark = useState<boolean>("vnv-dark-mode", () => false);

  /** Write CSS custom-property overrides directly on <html>. */
  function applyTheme(dark: boolean) {
    if (import.meta.server) return; // never touch the DOM during SSR
    const html = document.documentElement;

    if (dark) {
      html.classList.add("dark");
      html.style.setProperty("--background", "#151821");
      html.style.setProperty("--foreground", "#e8eaf0");
      html.style.setProperty("--muted", "#1e2130");
      html.style.setProperty("--muted-foreground", "#8b8fa8");
      html.style.setProperty("--border", "#2e3347");
      html.style.setProperty("--card", "#1e2130");
    } else {
      html.classList.remove("dark");
      const overrides = [
        "--background",
        "--foreground",
        "--muted",
        "--muted-foreground",
        "--border",
        "--card",
      ];
      overrides.forEach((v) => html.style.removeProperty(v));
    }
  }

  /**
   * Call once in `onMounted` on the root layout / Header.
   * Reads localStorage first, falls back to the OS preference.
   */
  function init() {
    const stored = localStorage.getItem("vnv-theme");
    if (stored) {
      isDark.value = stored === "dark";
    } else {
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    applyTheme(isDark.value);
  }

  /** Flip the preference, persist it and re-apply the theme. */
  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem("vnv-theme", isDark.value ? "dark" : "light");
    applyTheme(isDark.value);
  }

  return { isDark, toggle, init, applyTheme };
};
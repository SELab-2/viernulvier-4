<script setup lang="ts">
import { ROUTES } from "~/utils/routes";

const { login } = useAuth();

const username = ref("");
const password = ref("");
const error = ref<string | null>(null);
const loading = ref(false);
const { t } = useI18n();

// This makes sure that the login does not use the default layout with the header and footer.
definePageMeta({
  layout: false,
});

async function handleLogin() {
  error.value = null;
  loading.value = true;

  const result = await login(username.value, password.value);

  if (result.success) {
    await navigateTo(ROUTES.admin.dashboard.base);
  } else {
    error.value = result.error ?? t("login.error");
  }

  loading.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Brand -->
      <div class="mb-8 text-center">
        <h1
          class="font-brand font-black text-4xl uppercase tracking-tight text-foreground leading-none"
        >
          VIERNULVIER
        </h1>
        <div class="mt-3 flex items-center justify-center gap-2">
          <div class="h-[2px] w-6 bg-accent"></div>
          <p
            class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
          >
            Admin
          </p>
          <div class="h-[2px] w-6 bg-accent"></div>
        </div>
      </div>

      <!-- Card -->
      <div
        class="bg-card border border-card-border rounded-lg p-8 shadow-[0_5px_30px_-10px_var(--accent)]"
      >
        <!-- Error -->
        <div
          v-if="error"
          class="mb-6 px-4 py-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
        >
          <p
            class="text-[11px] font-black uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400"
          >
            {{ error }}
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <!-- Username -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
            >
              {{ t("login.username") }}
            </label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              required
              :disabled="loading"
              class="h-10 w-full rounded-md border border-border bg-muted/40 px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
            >
              {{ t("login.password") }}
            </label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="loading"
              class="h-10 w-full rounded-md border border-border bg-muted/40 px-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !username || !password"
            class="mt-2 w-full rounded-md bg-accent text-[var(--accent-foreground)] text-[11px] font-black uppercase tracking-[0.08em] h-10 transition-all hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="loading">{{ t("login.signingIn") }}</span>
            <span v-else>{{ t("login.signIn") }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

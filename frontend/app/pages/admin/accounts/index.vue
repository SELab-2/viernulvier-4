<script lang="ts" setup>
import type { CreateAccount, PublicAccount } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const { isLoggedIn, account } = useAuth();
const { getAll, create, remove } = useAccountApi();

const accounts = ref<PublicAccount[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const message = ref<string | null>(null);
const error = ref<string | null>(null);

async function loadAccounts() {
  isLoading.value = true;
  error.value = null;

  const response = await getAll({ page: 0, limit: 100, descending: true });

  if (response.error || !response.data) {
    error.value = response.error ?? "Could not load accounts.";
    accounts.value = [];
    isLoading.value = false;
    return;
  }

  accounts.value = response.data.objects;
  isLoading.value = false;
}

async function handleCreateAccount(payload: CreateAccount) {
  isSubmitting.value = true;
  error.value = null;
  message.value = null;

  const response = await create(payload);

  if (response.error || !response.data) {
    error.value = response.error ?? "Could not create account.";
    isSubmitting.value = false;
    return;
  }

  accounts.value = [response.data, ...accounts.value];
  message.value = `Created account \"${response.data.username}\".`;
  isSubmitting.value = false;
}

async function handleDeleteAccount(target: PublicAccount) {
  if (target.superAdmin) {
    return;
  }

  const confirmed = confirm(
    `Delete account \"${target.username}\"? This cannot be undone.`,
  );
  if (!confirmed) {
    return;
  }

  error.value = null;
  message.value = null;

  const response = await remove(target.id);
  if (response.error) {
    error.value = response.error ?? "Could not delete account.";
    return;
  }

  accounts.value = accounts.value.filter(
    (accountItem) => accountItem.id !== target.id,
  );
  message.value = `Deleted account \"${target.username}\".`;
}

onMounted(async () => {
  /*
  if (!isLoggedIn.value) {
    await navigateTo(ROUTES.admin.login.base);
    return;
  }
    */

  if (account.value && !account.value.superAdmin) {
    await navigateTo(ROUTES.admin.dashboard.base);
    return;
  }

  await loadAccounts();
});
</script>
<template>
  <section class="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
    <div
      v-if="error"
      class="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-if="message"
      class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
    >
      {{ message }}
    </div>

    <div class="space-y-4">
      <AdminAccountListView
        :accounts="accounts"
        @delete="handleDeleteAccount"
      />

      <h2 class="mb-3 text-lg font-semibold text-card-foreground">
        Create account
      </h2>
      <AdminAccountForm @submit="handleCreateAccount" />

      <p v-if="isSubmitting" class="mt-3 text-sm text-muted-foreground">
        Creating account...
      </p>
    </div>
  </section>
</template>

<!--
  Admin Accounts Page

  This page lets super admins view, create, and remove accounts.
  It handles account loading, creation feedback, and delete confirmations,
  while keeping all messages available through i18n.

  Features:
  - List of accounts with delete actions
  - Account creation form
  - Success and error feedback
  - Form reset after successful creation
  - i18n support

  Notes:
  - Restricted to super admin users
-->
<script lang="ts" setup>
import type { CreateAccount, PublicAccount } from "@repo/common";
import { ROUTES } from "~/utils/routes";

const { isLoggedIn, account } = useAuth();
const { getAll, create, remove } = useAccountApi();
const { t } = useI18n();

const accounts = ref<PublicAccount[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const message = ref<{ key: string; params?: any } | null>(null);
const error = ref<{ text?: string; key?: string; params?: any } | null>(null);
const accountFormRef = ref<{ reset: () => void } | null>(null);

// Loads accounts from the API and handles loading state and errors
async function loadAccounts() {
  isLoading.value = true;
  error.value = null;

  const response = await getAll({ page: 0, limit: 100, descending: true });

  if (response.error || !response.data) {
    error.value = response.error
      ? { text: response.error }
      : { key: "accounts.loadError" };
    accounts.value = [];
    isLoading.value = false;
    return;
  }

  accounts.value = response.data.objects;
  isLoading.value = false;
}

// Handles account creation, including API call, error handling, success feedback, and form reset
async function handleCreateAccount(payload: CreateAccount) {
  isSubmitting.value = true;
  error.value = null;
  message.value = null;

  const response = await create(payload);

  if (response.error || !response.data) {
    if (response.errorCode === "ACCOUNT_ALREADY_EXISTS") {
      error.value = {
        key: "accounts.alreadyExists",
        params: { username: payload.username },
      };
    } else {
      error.value = response.error
        ? { text: response.error }
        : { key: "accounts.createError" };
    }
    isSubmitting.value = false;
    return;
  }

  accounts.value = [response.data, ...accounts.value];
  message.value = {
    key: "accounts.createSuccess",
    params: { username: response.data.username },
  };
  accountFormRef.value?.reset();
  isSubmitting.value = false;
}

// Handles account deletion with confirmation, API call, error handling, and success feedback
async function handleDeleteAccount(target: PublicAccount) {
  if (target.superAdmin) {
    return;
  }

  const confirmed = confirm(
    t("accounts.confirmDelete", { username: target.username }),
  );
  if (!confirmed) {
    return;
  }

  error.value = null;
  message.value = null;

  const response = await remove(target.id);
  if (response.error) {
    error.value = response.error
      ? { text: response.error }
      : { key: "accounts.deleteError" };
    return;
  }

  accounts.value = accounts.value.filter(
    (accountItem) => accountItem.id !== target.id,
  );
  message.value = {
    key: "accounts.deleteSuccess",
    params: { username: target.username },
  };
}

onMounted(async () => {
  // Redirect to 404 if not super admin
  if (!account.value?.superAdmin) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  await loadAccounts();
});
</script>
<template>
  <section class="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
    <div
      v-if="error"
      class="rounded-md border border-feedback-error-border bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error-text"
    >
      {{ error.key ? t(error.key, error.params ?? {}) : error.text }}
    </div>

    <div
      v-if="message"
      class="rounded-md border border-feedback-success-border bg-feedback-success-bg px-4 py-3 text-sm text-feedback-success-text"
    >
      {{ t(message.key, message.params ?? {}) }}
    </div>

    <div class="space-y-4">
      <AdminAccountListView
        :accounts="accounts"
        @delete="handleDeleteAccount"
      />

      <h2 class="mb-3 text-lg font-semibold text-card-foreground">
        {{ t("accounts.create") }}
      </h2>
      <AdminAccountForm ref="accountFormRef" @submit="handleCreateAccount" />

      <p v-if="isSubmitting" class="mt-3 text-sm text-muted-foreground">
        {{ t("accounts.creating") }}
      </p>
    </div>
  </section>
</template>

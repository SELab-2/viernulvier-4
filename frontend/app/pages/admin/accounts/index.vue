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

const { account } = useAuth();
const { getAll, create, remove } = useAccountApi();
const { t } = useI18n();

type Notice = {
  type: "success" | "error";
  text?: string;
  key?: string;
  params?: Record<string, unknown>;
};

const accounts = ref<PublicAccount[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const notice = ref<Notice | null>(null);
const accountFormRef = ref<{ reset: () => void } | null>(null);
let noticeTimeout: ReturnType<typeof setTimeout> | null = null;

function clearNotice() {
  notice.value = null;
  if (noticeTimeout) {
    clearTimeout(noticeTimeout);
    noticeTimeout = null;
  }
}

function showNotice(value: Notice) {
  notice.value = value;
  if (noticeTimeout) clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => {
    clearNotice();
  }, 3000);
}

// Loads accounts from the API and handles loading state and errors
async function loadAccounts() {
  isLoading.value = true;
  clearNotice();

  const response = await getAll({ page: 0, limit: 100, descending: true });

  if (response.error || !response.data) {
    showNotice(
      response.error
        ? { type: "error", text: response.error }
        : { type: "error", key: "accounts.loadError" },
    );
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
  clearNotice();

  const response = await create(payload);

  if (response.error || !response.data) {
    if (response.errorCode === "ACCOUNT_ALREADY_EXISTS") {
      showNotice({
        type: "error",
        key: "accounts.alreadyExists",
        params: { username: payload.username },
      });
    } else {
      showNotice(
        response.error
          ? { type: "error", text: response.error }
          : { type: "error", key: "accounts.createError" },
      );
    }
    isSubmitting.value = false;
    return;
  }

  accounts.value = [response.data, ...accounts.value];
  showNotice({
    type: "success",
    key: "accounts.createSuccess",
    params: { username: response.data.username },
  });
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

  clearNotice();

  const response = await remove(target.id);
  if (response.error) {
    showNotice(
      response.error
        ? { type: "error", text: response.error }
        : { type: "error", key: "accounts.deleteError" },
    );
    return;
  }

  accounts.value = accounts.value.filter(
    (accountItem) => accountItem.id !== target.id,
  );
  showNotice({
    type: "success",
    key: "accounts.deleteSuccess",
    params: { username: target.username },
  });
}
// Clean up message timeout on component unmount to prevent memory leaks
onUnmounted(() => {
  clearNotice();
});

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
      v-if="notice"
      class="fixed left-1/2 top-4 z-[9999] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-md border px-4 py-3 text-sm shadow-lg"
      :class="
        notice.type === 'error'
          ? 'border-feedback-error-border bg-feedback-error-bg text-feedback-error-text'
          : 'border-feedback-success-border bg-feedback-success-bg text-feedback-success-text'
      "
    >
      {{ notice.key ? t(notice.key, notice.params ?? {}) : notice.text }}
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

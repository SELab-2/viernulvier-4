<script setup lang="ts">
import type { PublicAccount } from "@repo/common";

interface Props {
  account: PublicAccount;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "delete", account: PublicAccount): void;
}>();

// i18n helper for labels and status text.
const { t } = useI18n();
</script>

<template>
  <!-- Single account row in the desktop grid/list layout -->
  <article
    class="grid gap-3 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 sm:grid-cols-[minmax(0,1fr)_120px_120px_104px] sm:items-center sm:gap-4 sm:px-8 sm:py-5"
  >
    <!-- Primary account info -->
    <div class="min-w-0">
      <p
        class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
      >
        {{ account.username }}
      </p>

      <!-- Added for mobile view -->
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:hidden">
        {{ t("accounts.accountId") }}: {{ account.id }}
      </p>

      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:hidden">
        {{ t("accounts.role") }}:
        {{
          account.superAdmin ? t("accounts.superAdmin") : t("accounts.admin")
        }}
      </p>
    </div>

    <div class="hidden text-sm text-gray-600 dark:text-gray-400 sm:block">
      {{ account.id }}
    </div>

    <!-- Role badge column (different style for super admin) -->
    <div class="hidden sm:block">
      <span
        class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
        :class="
          account.superAdmin
            ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300'
            : 'border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
      >
        {{
          account.superAdmin ? t("accounts.superAdmin") : t("accounts.admin")
        }}
      </span>
    </div>

    <!-- Actions: non-super-admin can be deleted; super admin is protected -->
    <div class="flex justify-start sm:justify-end">
      <AdminDeleteButton
        v-if="!account.superAdmin"
        :label="t('accounts.delete')"
        @click="emit('delete', account)"
      />
      <span
        v-else
        class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
      >
        {{ t("accounts.protected") }}
      </span>
    </div>
  </article>
</template>

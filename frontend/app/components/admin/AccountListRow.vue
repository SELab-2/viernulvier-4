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
    class="grid grid-cols-[minmax(0,1fr)_120px_120px_104px] items-center gap-4 px-8 py-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
  >
    <!-- Primary account info -->
    <div class="min-w-0">
      <p
        class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
      >
        {{ account.username }}
      </p>
    </div>

    <div class="text-sm text-gray-600 dark:text-gray-400">
      {{ account.id }}
    </div>

    <!-- Role badge column (different style for super admin) -->
    <div>
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
    <div class="flex justify-end">
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

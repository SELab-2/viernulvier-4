<script setup lang="ts">
import type { PublicAccount } from "@repo/common";

interface Props {
  accounts: PublicAccount[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "delete", account: PublicAccount): void;
}>();

const { t } = useI18n();
</script>

<template>
  <section
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
  >
    <div class="border-b border-gray-200 bg-gray-100 px-8 py-4">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ t("accounts.title") }}
        </h2>
        <p class="max-w-2xl text-sm text-gray-600">
          {{ t("accounts.subtitle") }}
        </p>
      </div>
    </div>

    <div v-if="accounts.length === 0" class="px-6 py-14">
      <div class="mx-auto max-w-md text-center">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ t("accounts.emptyTitle") }}
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ t("accounts.emptyDescription") }}
        </p>
      </div>
    </div>

    <div v-else class="divide-y divide-gray-200">
      <div
        class="grid grid-cols-[minmax(0,1fr)_120px_120px_104px] gap-4 border-b border-gray-200 bg-gray-50 px-8 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-gray-600"
      >
        <div>{{ t("accounts.username") }}</div>
        <div>{{ t("accounts.accountId") }}</div>
        <div>{{ t("accounts.role") }}</div>
        <div class="text-right">{{ t("accounts.actions") }}</div>
      </div>

      <AdminAccountListRow
        v-for="account in accounts"
        :key="account.id"
        :account="account"
        @delete="emit('delete', $event)"
      />
    </div>
  </section>
</template>

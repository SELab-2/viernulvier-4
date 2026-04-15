<script setup lang="ts">
import type { PublicAccount } from "@repo/common";

const mockAccounts: PublicAccount[] = [
  { id: 1, username: "admin", superAdmin: true },
  { id: 2, username: "intern-alice", superAdmin: false },
  { id: 3, username: "intern-bob", superAdmin: false },
  { id: 4, username: "admin2", superAdmin: true },
];
const emptyAccounts: PublicAccount[] = [];

const handleDelete = (account: PublicAccount) => {
  console.log("delete", account);
};
</script>

<template>
  <main class="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 class="mt-2 text-3xl font-semibold text-foreground">
          Account list view preview
        </h1>
      </div>

      <section class="space-y-3">
        <h2
          class="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground"
        >
          With mock data
        </h2>
        <AdminAccountListView :accounts="mockAccounts" @delete="handleDelete" />
      </section>

      <section class="space-y-3">
        <h2
          class="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Empty state
        </h2>
        <AdminAccountListView
          :accounts="emptyAccounts"
          @delete="handleDelete"
        />
      </section>
    </div>
  </main>
</template>

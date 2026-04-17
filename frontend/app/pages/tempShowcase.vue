<script setup lang="ts">
import { ref } from "vue";
import type { CreateAccount } from "@repo/common";

const isLoading = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function handleSubmit(payload: CreateAccount) {
  isLoading.value = true;
  successMessage.value = null;
  errorMessage.value = null;

  try {
    // Mock: simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    successMessage.value = `Account "${payload.username}" created successfully.`;
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "Something went wrong.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background px-4 py-12">
    <div class="mx-auto max-w-2xl space-y-6">
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground"
        >
          Showcase
        </p>
        <h1 class="mt-2 text-3xl font-semibold">Create Account</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Reusable form for creating accounts, productions, events, blogs, and
          other entities by swapping the fields and handler.
        </p>
      </div>

      <AdminAccountForm @submit="handleSubmit" />

      <div
        v-if="isLoading"
        class="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm"
      >
        Creating account...
      </div>

      <div
        v-if="successMessage"
        class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

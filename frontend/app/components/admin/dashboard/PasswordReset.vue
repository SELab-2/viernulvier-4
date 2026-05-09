<!--
  components/admin/dashboard/PasswordReset.vue
  =============================================
  Card that lets the logged-in admin change their own password.
  Calls PATCH /auth with the current account id plus the new password.
  Shows inline success / error feedback without a full page reload.
-->
<script setup lang="ts">
import { Eye, EyeOff, KeyRound } from "lucide-vue-next";

const { account } = useAuth();
const { modify } = useAccountApi();
const { t } = useI18n();

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showNew = ref(false);
const showConfirm = ref(false);
const submitting = ref(false);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

function clear() {
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

async function handleSubmit() {
  feedback.value = null;

  if (newPassword.value.length < 8) {
    feedback.value = {
      type: "err",
      msg: "New password must be at least 8 characters.",
    };
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    feedback.value = { type: "err", msg: t("accounts.password_mismatch") };
    return;
  }
  if (!account.value?.id) {
    feedback.value = { type: "err", msg: "Not authenticated." };
    return;
  }

  submitting.value = true;
  try {
    const resp = await modify({
      id: account.value.id,
      password: newPassword.value,
    });

    if (resp.error) {
      feedback.value = { type: "err", msg: resp.error };
    } else {
      feedback.value = { type: "ok", msg: "Password updated successfully." };
      clear();
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section
    class="rounded-xl border border-card-border bg-card overflow-hidden shadow-sm"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-3 px-6 py-4 border-b border-card-border bg-card-hover"
    >
      <div
        class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"
      >
        <KeyRound :size="15" class="text-accent" />
      </div>
      <div>
        <h2
          class="font-brand font-black text-[13px] uppercase tracking-widest text-card-foreground"
        >
          Change Password
        </h2>
        <p class="text-[11px] text-muted-foreground mt-0.5">
          Update your admin account password
        </p>
      </div>
    </div>

    <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
      <!-- Feedback banner -->
      <Transition name="slide-down">
        <div
          v-if="feedback"
          :class="[
            'rounded-lg border px-4 py-2.5 text-sm',
            feedback.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400',
          ]"
        >
          {{ feedback.msg }}
        </div>
      </Transition>

      <!-- New password -->
      <div class="flex flex-col gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
        >
          New Password
        </label>
        <div class="relative">
          <input
            v-model="newPassword"
            :type="showNew ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="Minimum 8 characters"
            class="h-10 w-full rounded-md border border-border bg-muted/40 px-3 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            @click="showNew = !showNew"
          >
            <Eye v-if="!showNew" :size="16" class="text-accent" />
            <EyeOff v-else :size="16" class="text-accent" />
          </button>
        </div>
      </div>

      <!-- Confirm new password -->
      <div class="flex flex-col gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
        >
          Confirm New Password
        </label>
        <div class="relative">
          <input
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="Repeat new password"
            class="h-10 w-full rounded-md border border-border bg-muted/40 px-3 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            @click="showConfirm = !showConfirm"
          >
            <Eye v-if="!showConfirm" :size="16" class="text-accent" />
            <EyeOff v-else :size="16" class="text-accent" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting || !newPassword || !confirmPassword"
        class="w-full rounded-md bg-accent text-white text-[11px] font-black uppercase tracking-[0.08em] h-10 transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="submitting">Updating…</span>
        <span v-else>Update Password</span>
      </button>
    </form>
  </section>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

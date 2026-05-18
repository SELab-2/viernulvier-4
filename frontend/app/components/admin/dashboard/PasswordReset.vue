<!--
  components/admin/dashboard/PasswordReset.vue
  =============================================
  Card that lets the logged-in admin change their own password.
  Calls useAccountApi().changePassword() which uses the API key to identify the account.
  All user-facing strings come from i18n (admin.dashboard.*).
-->
<script setup lang="ts">
import { Eye, EyeOff, KeyRound } from "lucide-vue-next";

const { account } = useAuth();
const { changePassword } = useAccountApi();
const { t } = useI18n();

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const submitting = ref(false);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

function clearForm() {
  oldPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

async function handleSubmit() {
  feedback.value = null;

  if (newPassword.value.length < 8) {
    feedback.value = {
      type: "err",
      msg: t("admin.dashboard.passwordTooShort"),
    };
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    feedback.value = { type: "err", msg: t("accounts.password_mismatch") };
    return;
  }

  const accountId = account.value?.id;
  if (!accountId) {
    feedback.value = {
      type: "err",
      msg: t("admin.dashboard.notAuthenticated"),
    };
    return;
  }

  submitting.value = true;
  try {
    const resp = await changePassword({
      oldPassword: oldPassword.value,
      password: newPassword.value,
    });

    if (resp.error) {
      feedback.value = { type: "err", msg: resp.error };
    } else {
      feedback.value = {
        type: "ok",
        msg: t("admin.dashboard.passwordSuccess"),
      };
      clearForm();
    }
  } catch (e) {
    feedback.value = {
      type: "err",
      msg:
        e instanceof Error ? e.message : t("admin.dashboard.notAuthenticated"),
    };
  } finally {
    submitting.value = false;
  }
}

// Shared input class reused for both fields
const inputClass =
  "h-10 w-full rounded-lg border border-border bg-muted/40 px-3 pr-10 text-[13px] text-foreground " +
  "placeholder:text-muted-foreground outline-none transition-all " +
  "focus:border-accent focus:ring-2 focus:ring-ring";
</script>

<template>
  <section
    class="rounded-2xl border border-card-border bg-card overflow-hidden shadow-sm"
  >
    <!-- Card header -->
    <div
      class="flex items-center gap-3 px-5 py-4 border-b border-card-border bg-card-hover"
    >
      <div
        class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"
      >
        <KeyRound :size="14" class="text-accent" />
      </div>
      <div>
        <h2
          class="font-brand font-black text-[12px] uppercase tracking-widest text-card-foreground"
        >
          {{ t("admin.dashboard.changePassword") }}
        </h2>
        <p class="text-[10px] text-muted-foreground leading-snug mt-0.5">
          {{ t("admin.dashboard.changePasswordHint") }}
        </p>
      </div>
    </div>

    <form class="p-5 space-y-3" @submit.prevent="handleSubmit">
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

      <!-- Old password field -->
      <div class="flex flex-col gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
        >
          {{ t("admin.dashboard.oldPassword") }}
        </label>
        <div class="relative">
          <input
            v-model="oldPassword"
            :type="showOld ? 'text' : 'password'"
            autocomplete="old-password"
            required
            :placeholder="t('admin.dashboard.oldPasswordPlaceholder')"
            :class="inputClass"
          />
          <button
            type="button"
            tabindex="-1"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            @click="showOld = !showOld"
          >
            <Eye v-if="!showOld" :size="15" class="text-accent/70" />
            <EyeOff v-else :size="15" class="text-accent/70" />
          </button>
        </div>
      </div>

      <!-- New password field -->
      <div class="flex flex-col gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
        >
          {{ t("admin.dashboard.newPassword") }}
        </label>
        <div class="relative">
          <input
            v-model="newPassword"
            :type="showNew ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            :placeholder="t('admin.dashboard.newPasswordPlaceholder')"
            :class="inputClass"
          />
          <button
            type="button"
            tabindex="-1"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            @click="showNew = !showNew"
          >
            <Eye v-if="!showNew" :size="15" class="text-accent/70" />
            <EyeOff v-else :size="15" class="text-accent/70" />
          </button>
        </div>
      </div>

      <!-- Confirm password field -->
      <div class="flex flex-col gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground"
        >
          {{ t("admin.dashboard.confirmPassword") }}
        </label>
        <div class="relative">
          <input
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            :placeholder="t('admin.dashboard.confirmPasswordPlaceholder')"
            :class="inputClass"
          />
          <button
            type="button"
            tabindex="-1"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            @click="showConfirm = !showConfirm"
          >
            <Eye v-if="!showConfirm" :size="15" class="text-accent/70" />
            <EyeOff v-else :size="15" class="text-accent/70" />
          </button>
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting || !newPassword || !confirmPassword"
        class="mt-1 w-full rounded-lg bg-accent text-white text-[10px] font-black uppercase tracking-[0.1em] h-9 transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span v-if="submitting">{{ t("admin.dashboard.updating") }}</span>
        <span v-else>{{ t("admin.dashboard.updatePassword") }}</span>
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

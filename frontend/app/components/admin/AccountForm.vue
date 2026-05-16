<script setup lang="ts">
/**
 * Reusable admin account creation form.
 *
 * Includes:
 * - Localized username/password field definitions
 * - BaseForm integration with optional initial values
 * - CreateAccount payload mapping on submit
 * - Password confirmation with error handling
 *
 * Note: The role field is currently commented out because there currentky only can be one super admin
 *       but can be easily re-enabled if needed in the future.
 *
 * Usage:
 * <AdminAccountForm
 *   :initial-values="{ username: '', password: '' }"
 *   @submit="onSubmitAccount"
 * />
 */
import { computed } from "vue";
import type { CreateAccount } from "@repo/common";
import type { FormField } from "../../types/FormField";

type AccountRole = "Admin" | "Super Admin";

const { t } = useI18n();
interface AccountFormModel {
  username: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<AccountFormModel>;
  }>(),
  {
    initialValues: () => ({
      username: "",
      password: "",
      confirmPassword: "",
      role: "Admin" as AccountRole,
    }),
  },
);

const emit = defineEmits<{
  submit: [CreateAccount];
}>();

const baseFormRef = ref<{ reset: () => void } | null>(null);
const hasPasswordMismatch = ref(false);
const passwordMismatchError = computed(() =>
  hasPasswordMismatch.value ? t("accounts.password_mismatch") : null,
);

const fields = computed<FormField[]>(() => [
  {
    component: "BaseInput",
    name: "username",
    props: {
      label: t("accounts.username"),
      placeholder: t("accounts.username_placeholder"),
      required: true,
      minLength: 3, // enforce minimum length for better UX, can be adjusted as needed
    },
  },
  {
    component: "BaseInput",
    name: "password",
    props: {
      label: t("accounts.password"),
      type: "password",
      placeholder: t("accounts.password_placeholder"),
      required: true,
      minLength: 8, // enforce minimum length for better security, can be adjusted as needed
    },
  },
  {
    component: "BaseInput",
    name: "confirmPassword",
    props: {
      label: t("accounts.confirm_password"),
      type: "password",
      placeholder: t("accounts.confirm_password_placeholder"),
      required: true,
      minLength: 8, // enforce minimum length for better security, can be adjusted as needed
    },
  },
  {
    component: "BaseSelect",
    name: "role",
    props: {
      label: t("accounts.role"),
      options: [
        { label: t("accounts.admin"), value: "Admin" },
        { label: t("accounts.superAdmin"), value: "Super Admin" },
      ],
      required: true,
    },
  },
]);

function handleFormSubmit(formData: Record<string, any>) {
  if (
    String(formData.password ?? "") !== String(formData.confirmPassword ?? "")
  ) {
    hasPasswordMismatch.value = true;
    return;
  }

  hasPasswordMismatch.value = false;

  const payload: CreateAccount = {
    username: String(formData.username ?? ""),
    password: String(formData.password ?? ""),
    superAdmin: formData.role === "Super Admin",
  };

  emit("submit", payload);
}

function reset() {
  baseFormRef.value?.reset();
  hasPasswordMismatch.value = false;
}

defineExpose({
  reset,
});
</script>

<template>
  <div>
    <FormBaseForm
      ref="baseFormRef"
      :fields="fields"
      :initial-values="props.initialValues"
      @submit="handleFormSubmit"
    />

    <p
      v-if="passwordMismatchError"
      class="mx-4 mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
    >
      {{ passwordMismatchError }}
    </p>
  </div>
</template>

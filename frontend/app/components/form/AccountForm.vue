<script setup lang="ts">
import { computed } from "vue";
import type { CreateAccount } from "@repo/common";
import type { FormField } from "../../types/FormField";

// type AccountRole = "Admin" | "Super Admin";

const { t } = useI18n();
interface AccountFormModel {
  username: string;
  password: string;
  // role: AccountRole;
}

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<AccountFormModel>;
  }>(),
  {
    initialValues: () => ({
      username: "",
      password: "",
      // role: "Admin" as AccountRole,
    }),
  },
);

const emit = defineEmits<{
  submit: [CreateAccount];
}>();

const fields = computed<FormField[]>(() => [
  {
    component: "BaseInput",
    name: "username",
    props: {
      label: t("accounts.username"),
      placeholder: t("accounts.username_placeholder"),
      required: true,
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
    },
  },
  /*
  {
    component: "BaseSelect",
    name: "role",
    props: {
      label: t("accounts.role"),
      options: [t("accounts.admin"), t("accounts.superAdmin")],
      required: true,
    },
  },
  */
]);

function handleFormSubmit(formData: Record<string, any>) {
  const payload: CreateAccount = {
    username: String(formData.username ?? ""),
    password: String(formData.password ?? ""),
    // superAdmin: formData.role === "Super Admin",
  };

  emit("submit", payload);
}
</script>

<template>
  <FormBaseForm
    :fields="fields"
    :initial-values="props.initialValues"
    @submit="handleFormSubmit"
  />
</template>

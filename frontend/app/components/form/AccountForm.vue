<script setup lang="ts">
import type { CreateAccount } from "@repo/common";
import type { FormField } from "../../types/FormField";

// type AccountRole = "Admin" | "Super Admin";

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

const fields: FormField[] = [
  {
    component: "BaseInput",
    name: "username",
    props: {
      label: "Username",
      placeholder: "admin",
      required: true,
    },
  },
  {
    component: "BaseInput",
    name: "password",
    props: {
      label: "Password",
      type: "password",
      placeholder: "Enter a secure password",
      required: true,
    },
  },
  /*
  {
    component: "BaseSelect",
    name: "role",
    props: {
      label: "Role",
      options: ["Admin", "Super Admin"],
      required: true,
    },
  },
  */
];

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

<script setup lang="ts">
/**
 * A reusable input field, includes:
 *  - Optional label and placeholder
 *  - Supports text and number inputs (default: text)
 *  - Required indicator
 *  - Binds value via v-model
 *  - Password visibility toggle for password inputs
 *
 * Usage:
 * <BaseInput
 *   v-model="title"
 *   label="Title"
 *   placeholder="Enter title"
 *   required
 * />
 */

import { ref } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";

interface Props {
  label?: string; // label displayed above the field
  placeholder?: string; // placeholder text displayed inside the field
  type?: "text" | "number" | "password"; // input accepts common input variants
  id?: string;
  required?: boolean; // adds a "*" if required
  minLength?: number; // optional native minlength validation
}
const props = withDefaults(defineProps<Props>(), {
  type: "text",
});

const model = defineModel<string | number>();
const showPassword = ref(false);

const inputType = computed(() => {
  if (props.type !== "password") return props.type;
  return showPassword.value ? "text" : "password";
});
</script>

<template>
  <div class="m-4">
    <!-- Optional Label -->
    <label
      v-if="label"
      :for="id"
      class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block"
    >
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input field with optional password toggle -->
    <div class="relative">
      <input
        :id="id"
        :type="inputType"
        :placeholder="placeholder"
        v-model="model"
        :required="required"
        :minlength="minLength"
        class="px-4 bg-muted border border-border h-12 font-bold text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90"
        :class="props.type === 'password' ? 'pr-12' : ''"
      />

      <!-- Password visibility toggle -->
      <button
        v-if="props.type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <Eye v-if="showPassword" class="w-4 h-4" />
        <EyeOff v-else class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>

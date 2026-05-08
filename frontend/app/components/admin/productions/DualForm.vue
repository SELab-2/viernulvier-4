<script setup lang="ts">
/**
 * AdminProductionsDualForm.vue
 *
 * Dual-language (NL / EN) production form.
 *
 * This component is fully controlled by the parent.
 * It does not own any form state internally.
 *
 * The parent passes the entire draft object through v-model.
 */

import type { ProductionCoreForm } from "~/composables/productions/steps/productionCore";

const active = ref<"nl" | "en">("nl");

interface Props {
  modelValue: ProductionCoreForm;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [ProductionCoreForm];
}>();

function updateLocale(locale: "nl" | "en", value: ProductionCoreForm["nl"]) {
  emit("update:modelValue", {
    ...props.modelValue,
    [locale]: value,
  });
}
</script>

<template>
  <div class="w-full">
    <!-- LANGUAGE TABS -->
    <div class="flex flex-col items-center mb-4 gap-2">
      <div
        class="flex gap-2 border-2 border-foreground bg-background p-1 rounded-full"
      >
        <button
          @click="active = 'nl'"
          class="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all"
          :class="
            active === 'nl'
              ? 'bg-foreground text-background shadow'
              : 'text-foreground opacity-60 hover:opacity-100'
          "
        >
          NL
        </button>

        <button
          @click="active = 'en'"
          class="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all"
          :class="
            active === 'en'
              ? 'bg-foreground text-background shadow'
              : 'text-foreground opacity-60 hover:opacity-100'
          "
        >
          EN
        </button>
      </div>
    </div>

    <!-- SLIDER -->
    <div class="relative overflow-hidden">
      <div
        class="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="{
          width: '200%',
          transform: active === 'nl' ? 'translateX(0%)' : 'translateX(-50%)',
        }"
      >
        <!-- NL -->
        <div
          class="w-1/2 px-3 transition-all duration-500"
          :class="
            active === 'nl'
              ? 'opacity-100 scale-100'
              : 'opacity-40 scale-95 pointer-events-none'
          "
        >
          <AdminProductionsForm
            language="nl"
            :modelValue="props.modelValue.nl"
            @update:modelValue="updateLocale('nl', $event)"
          />
        </div>

        <!-- EN -->
        <div
          class="w-1/2 px-3 transition-all duration-500"
          :class="
            active === 'en'
              ? 'opacity-100 scale-100'
              : 'opacity-40 scale-95 pointer-events-none'
          "
        >
          <AdminProductionsForm
            language="en"
            :modelValue="props.modelValue.en"
            @update:modelValue="updateLocale('en', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

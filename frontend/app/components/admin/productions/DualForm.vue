<script setup lang="ts">
import { ref } from "vue";

const active = ref<"nl" | "en">("nl");

const nlData = ref<Record<string, any>>({});
const enData = ref<Record<string, any>>({});

const emit = defineEmits<{
  submit: [{ nl: Record<string, any>; en: Record<string, any> }];
}>();

function handleSubmit() {
  emit("submit", {
    nl: nlData.value,
    en: enData.value,
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
            :showActions="false"
            @submit="nlData = $event"
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
            :showActions="false"
            @submit="enData = $event"
          />
        </div>
      </div>
    </div>

    <!-- SUBMIT -->
    <div class="mt-6">
      <button
        type="button"
        @click="handleSubmit"
        class="w-full h-12 bg-primary text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-80 transition"
      >
        Submit
      </button>
    </div>
  </div>
</template>

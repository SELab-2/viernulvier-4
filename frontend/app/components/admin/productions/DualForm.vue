<script setup lang="ts">
/**
 * AdminProductionsDualForm.vue
 *
 * Dual-language (NL / EN) form shell for a production.
 * Slides between the two language panels with an animated transition.
 *
 * When liveUpdate is true (passed through to FormBaseForm) the @nl-update and
 * @en-update events fire on every keystroke — plug these into useProductionForm's
 * handleNlUpdate / handleEnUpdate so the preview stays in sync while typing.
 *
 * The final @submit still emits both language objects together for the save action.
 */

const active = ref<"nl" | "en">("nl");

const nlData = ref<Record<string, any>>({});
const enData = ref<Record<string, any>>({});

interface Props {
  /** Forward to inner forms so the preview updates live while typing */
  liveUpdate?: boolean;
  /** Pre-fill values for the NL form (edit mode) */
  initialNl?: Record<string, any>;
  /** Pre-fill values for the EN form (edit mode) */
  initialEn?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  liveUpdate: false,
});

const emit = defineEmits<{
  /** Final combined submit */
  submit: [{ nl: Record<string, any>; en: Record<string, any> }];
  /** Live NL field change — fired on every keystroke when liveUpdate is true */
  "nl-update": [Record<string, any>];
  /** Live EN field change — fired on every keystroke when liveUpdate is true */
  "en-update": [Record<string, any>];
}>();

function handleNlUpdate(data: Record<string, any>) {
  nlData.value = data;
  emit("nl-update", data);
}

function handleEnUpdate(data: Record<string, any>) {
  enData.value = data;
  emit("en-update", data);
}

function handleSubmit() {
  emit("submit", { nl: nlData.value, en: enData.value });
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
            :liveUpdate="props.liveUpdate"
            :initialValues="props.initialNl"
            @submit="nlData = $event"
            @update="handleNlUpdate"
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
            :liveUpdate="props.liveUpdate"
            :initialValues="props.initialEn"
            @submit="enData = $event"
            @update="handleEnUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

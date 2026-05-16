<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";

interface Props {
  htmlContent: string;
  variant?: "default" | "boxed";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

const { t } = useI18n();

const isExpanded = ref(false);
const showReadMoreButton = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  if (descriptionRef.value) {
    showReadMoreButton.value =
      descriptionRef.value.scrollHeight > descriptionRef.value.clientHeight;
  }
};

let observer: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  observer = new ResizeObserver(() => checkOverflow());

  if (descriptionRef.value) {
    observer.observe(descriptionRef.value);
  }
});

watch(
  () => props.htmlContent,
  async () => {
    await nextTick();
    checkOverflow();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="w-full">
    <div v-if="variant === 'default'">
      <div
        ref="descriptionRef"
        :class="[
          isExpanded ? 'line-clamp-none' : 'line-clamp-[6] md:line-clamp-[8]',
          showReadMoreButton && !isExpanded ? 'should-fade' : '',
        ]"
        class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200 transition-all duration-500"
        v-html="htmlContent"
      ></div>

      <button
        v-if="showReadMoreButton || isExpanded"
        class="mt-6 mb-4 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
      </button>
    </div>

    <div v-else-if="variant === 'boxed'">
      <div
        ref="descriptionRef"
        :class="[
          isExpanded ? 'line-clamp-none' : 'line-clamp-[6] md:line-clamp-[8]',
          showReadMoreButton && !isExpanded ? 'should-fade' : '',
        ]"
        class="description-content p-8 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 text-lg lg:text-xl rounded-2xl transition-all duration-500"
        v-html="htmlContent"
      ></div>

      <button
        v-if="showReadMoreButton || isExpanded"
        class="mt-4 ml-8 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.description-content :deep(p) {
  margin-bottom: 1.25rem;
}

.description-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Links in description */
.description-content :deep(a) {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.description-content :deep(a:hover) {
  opacity: 0.7;
}

.should-fade {
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.line-clamp-none {
  mask-image: none !important;
  -webkit-mask-image: none !important;
}
</style>

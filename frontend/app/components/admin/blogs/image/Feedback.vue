<!--
  components/admin/blogs/image/Feedback.vue
  ===========================================
  Transient feedback banner shown inside the image-upload card.

  Renders a green success strip or a red error strip depending on the
  type field. Auto-dismissed by the parent after four seconds — this
  component only handles the visual presentation and enter/leave transition.

  Props:
  - feedback  { type: 'ok' | 'err'; msg: string } | null
              Pass null to hide the banner.
-->

<script setup lang="ts">
defineProps<{
  feedback: { type: "ok" | "err"; msg: string } | null;
}>();
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="feedback"
      :class="[
        'mx-5 mt-4 rounded-lg border px-4 py-2.5 text-sm',
        feedback.type === 'ok'
          ? 'border-feedback-success-border bg-feedback-success-bg text-feedback-success-text'
          : 'border-feedback-error-border bg-feedback-error-bg text-feedback-error-text',
      ]"
    >
      {{ feedback.msg }}
    </div>
  </Transition>
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

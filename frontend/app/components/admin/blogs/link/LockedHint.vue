<!--
  components/admin/blogs/link/LockedHint.vue
  ============================================
  Shown inside the LinkToProduction card when no blogId is available —
  i.e. when the user is on the create page and the blog has not been saved yet.

  Displays a clearly styled notice explaining that the blog must be created
  before it can be linked to a production. The icon and amber tones make it
  visually distinct from a loading state or an error.

  No props or emits needed — this is a purely presentational component.
-->

<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border border-action-warning-border bg-action-warning-hover px-4 py-3.5"
  >
    <!-- Lock icon to reinforce "not available yet" -->
    <div
      class="w-8 h-8 rounded-lg bg-action-warning-hover border border-action-warning-border flex items-center justify-center shrink-0 mt-0.5"
    >
      <svg
        class="w-4 h-4 text-action-warning-icon"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" />
      </svg>
    </div>

    <div>
      <p
        class="text-[11px] font-brand font-black uppercase tracking-widest text-action-warning-icon leading-tight"
      >
        {{ t("admin.blogs.linkToProductionCreateHint") }}
      </p>
      <p class="mt-1 text-[10px] text-muted-foreground leading-relaxed">
        {{ t("admin.blogs.linkedProductionsHint") }}
      </p>
    </div>
  </div>
</template>

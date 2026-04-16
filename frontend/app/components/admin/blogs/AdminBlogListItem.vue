<!--
  components/admin/AdminBlogListItem.vue
  ========================================
  Displays a single blog/story row in the admin list.
  Shows title, excerpt and date. Emits edit and delete events.
-->
<script setup lang="ts">
import type { BlogView } from "@repo/common";

const props = defineProps<{ blog: BlogView }>();

const emit = defineEmits<{
  (e: "edit", blog: BlogView): void;
  (e: "delete", blog: BlogView): void;
}>();

const { locale } = useI18n();

const formattedDate = computed(() =>
  new Date(props.blog.created_at).toLocaleDateString(
    locale.value === "en" ? "en-GB" : "nl-BE",
    { day: "numeric", month: "short", year: "numeric" },
  ),
);
</script>

<template>
  <article
    class="group flex items-start gap-4 bg-card border border-card-border rounded-lg p-4 hover:bg-card-hover transition-colors duration-150"
  >
    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h3
        class="font-brand font-black text-sm uppercase tracking-tight text-card-foreground truncate"
      >
        {{ blog.titel || "—" }}
      </h3>

      <p
        v-if="blog.description"
        class="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed"
      >
        {{ blog.description }}
      </p>

      <time
        class="block mt-2 text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground/60"
      >
        {{ formattedDate }}
      </time>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0 mt-0.5">
      <AdminEditButton label="Edit" :size="40" @click="emit('edit', blog)" />
      <AdminDeleteButton
        label="Delete"
        :size="40"
        @click="emit('delete', blog)"
      />
    </div>
  </article>
</template>

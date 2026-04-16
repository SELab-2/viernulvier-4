<!--
  components/admin/blogs/AdminBlogCard.vue
  ==========================================
  Single row card for the admin blog list.

  Shows: thumbnail placeholder (or real image once available), title,
  truncated description, and formatted date.
  Uses AdminEditButton / AdminDeleteButton from components/admin/blogs/.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { formatDateShort } from "~/utils/formatters";

const props = defineProps<{ blog: BlogView }>();
const emit = defineEmits<{ (e: "delete"): void }>();

const { locale, t } = useI18n();
const router = useRouter();

const formattedDate = computed(() =>
  props.blog.created_at
    ? formatDateShort(props.blog.created_at, locale.value)
    : "",
);

function goToEdit() {
  router.push(`/admin/blogs/${props.blog.id}/edit`);
}
</script>

<template>
  <article
    class="group flex items-stretch gap-0 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors duration-150 overflow-hidden"
  >
    <!-- Left accent bar (appears on hover) -->
    <div
      class="w-[3px] shrink-0 bg-[var(--blog-purple-strong)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      aria-hidden="true"
    />

    <!-- Thumbnail -->
    <div
      class="w-20 sm:w-28 shrink-0 bg-muted border-r border-border flex items-center justify-center"
      style="min-height: 88px"
    >
      <!-- Replace with MediaGalleryImage once backend image field is ready -->
      <svg
        class="w-7 h-7 text-muted-foreground/30"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>

    <!-- Body -->
    <div
      class="flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-4 flex flex-col justify-center"
    >
      <h3
        class="font-brand font-black text-sm sm:text-base uppercase tracking-tight text-foreground leading-snug line-clamp-1 group-hover:text-[var(--blog-purple-strong)] transition-colors duration-150"
      >
        {{ blog.titel ?? "—" }}
      </h3>

      <p
        v-if="blog.description"
        class="mt-0.5 text-xs text-muted-foreground line-clamp-1"
      >
        {{ blog.description }}
      </p>

      <span
        v-if="formattedDate"
        class="mt-2 inline-flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground/60"
      >
        <svg
          class="w-3 h-3 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {{ formattedDate }}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 px-4 shrink-0">
      <AdminEditButton :label="t('admin.edit')" :size="36" @click="goToEdit" />
      <AdminDeleteButton
        :label="t('admin.delete')"
        :size="36"
        @click="emit('delete')"
      />
    </div>
  </article>
</template>

<!--
  HomeHighlights.vue

  Implements the "Highlights" section on the home page.

  Displays a responsive grid of recent production cards (2 columns on tablet,
  3 on desktop) using the shared ProductionGridViewItem component.

  Clicking a card navigates to the production detail page (ROUTES.productions.byId).
  The "View all" button at the bottom links to the full archive page (ROUTES.productions.base).

  Data:
    Fetches the 6 most recent productions via useProductionApi on mount.
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { ROUTES } from "~/utils/routes";
import type { PaginatedResponse, ProductionView } from "@repo/common";

const { t, locale } = useI18n();
const { getAll } = useProductionApi();

const highlights = ref<ProductionView[]>([]);

onMounted(async () => {
  try {
    const resp = await getAll({
      paginationFilters: { page: 0, limit: 6, descending: true },
      languageFilters: { lang: locale.value },
    });
    if (resp.data) {
      const data = resp.data as PaginatedResponse<ProductionView>;
      highlights.value = data.objects;
    } else {
      console.error("Failed to load highlights:", resp.error);
    }
  } catch (err) {
    console.error("Error loading highlights:", err);
  }
});
</script>

<template>
  <section class="bg-background w-full">
    <div class="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <!-- Section header with subtitle on the right -->
      <div
        class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-border pb-6"
      >
        <h2
          class="text-3xl md:text-4xl font-display font-black tracking-tight text-foreground"
        >
          {{ t("highlights.title") }}
        </h2>
        <p
          class="text-base text-muted-foreground whitespace-nowrap hidden sm:block"
        >
          {{ t("highlights.subtitle") }}
        </p>
      </div>

      <!-- Production cards grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14">
        <ProductionGridViewItem
          v-for="production in highlights"
          :key="production.id"
          :productionView="production"
        />
      </div>

      <!-- "View all" CTA linking to the full archive -->
      <div class="flex justify-center">
        <NuxtLink :to="ROUTES.productions.base">
          <button class="group inline-flex items-center gap-3 btn-outline">
            {{ t("highlights.viewAll") }}
            <ArrowRight
              class="w-4 h-4 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: "Georgia", "Times New Roman", serif;
}
</style>

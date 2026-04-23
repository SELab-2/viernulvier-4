<!--
  HomeDiscover.vue

  Implements the "Discover" section on the home page.

  Renders two large full-height cards side by side that link visitors to
  the two main content sections of the archive:
  - Stories & History  → ROUTES.stories.base (/stories)
  - Posters & Prints   → ROUTES.prints.base  (/prints)

  Each card is rendered via the reusable HomeDiscoverCard component which
  accepts image, title, body text and a CTA label as props. All text is
  sourced from i18n translation keys (discover.*).

  Routes are imported from ~/utils/routes to avoid hardcoded path strings.
-->
<script setup lang="ts">
import { ROUTES } from "~/utils/routes";

const { t } = useI18n();
</script>

<template>
  <section class="py-24">
    <div class="page-container">
      <h2 class="text-3xl md:text-4xl font-display font-black mb-12">
        {{ t("discover.title") }}
      </h2>

      <div class="grid md:grid-cols-2 gap-4 md:gap-6">
        <HomeDiscoverCard
          :to="ROUTES.stories.base"
          image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80"
          image-alt="Stories and History"
          :title="t('discover.stories.title')"
          :body="t('discover.stories.body')"
          :cta="t('discover.stories.cta')"
        />
        <HomeDiscoverCard
          :to="ROUTES.prints.base"
          image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80"
          image-alt="Posters and Printed Materials"
          :title="t('discover.posters.title')"
          :body="t('discover.posters.body')"
          :cta="t('discover.posters.cta')"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: "Georgia", "Times New Roman", serif;
}
</style>

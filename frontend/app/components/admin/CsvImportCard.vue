<script setup lang="ts">
/**
 * Combined CSV import section for admin create pages.
 *
 * Renders both:
 * - CSV template download card
 * - CSV upload action
 *
 * Props:
 * - `target` (productions|events|tags|blogs|prices) — selects parser target and localized labels.
 * - `disclaimer` (optional) — custom warning text shown in red above the tools.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ParserTarget } from "~/composables/useParserApi";

const props = defineProps<{
  target: ParserTarget;
  disclaimer?: string;
}>();

const { t } = useI18n();

const targetLabel = computed(() => t(`admin.parser.targets.${props.target}`));
const title = computed(() =>
  t("admin.csvImport.title", { target: targetLabel.value }),
);
const description = computed(() =>
  t("admin.csvImport.description", { target: targetLabel.value }),
);
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-1">
      <h2
        class="font-brand font-black text-xl uppercase tracking-tight text-foreground"
      >
        {{ title }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ description }}
      </p>
      <p v-if="props.disclaimer" class="text-sm font-semibold text-red-600">
        {{ props.disclaimer }}
      </p>
    </div>

    <AdminCsvTemplateDownload :target="props.target" />
    <AdminCsvUploadComponent :target="props.target" />
  </section>
</template>

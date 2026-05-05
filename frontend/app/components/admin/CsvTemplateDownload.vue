<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ParserTarget } from "~/composables/useParserApi";

interface Props {
  target: ParserTarget;
}

const props = defineProps<Props>();

type TemplateData = {
  mandatoryFields: string[];
  nullableFields: string[];
};

const templates: Record<ParserTarget, TemplateData> = {
  productions: {
    mandatoryFields: ["ID", "Titel_NL", "Description1_NL"],
    nullableFields: [
      "Titel_EN",
      "Description1_EN",
      "Description2_NL",
      "Description2_EN",
      "Artist_NL",
      "Artist_EN",
      "Tagline_NL",
      "Tagline_EN",
      "Credits_NL",
      "Credits_EN",
      "Performer_Type",
      "Attendance_Mode",
    ],
  },
  events: {
    mandatoryFields: ["ID", "Starttime", "ProductionID"],
    nullableFields: [
      "Endtime",
      "Doors_At",
      "Intermission_At",
      "Location_NL",
      "Location_EN",
    ],
  },
  tags: {
    mandatoryFields: ["TagName_NL", "ProductionIDs"],
    nullableFields: ["TagName_EN"],
  },
  blogs: {
    mandatoryFields: ["Titel_NL", "Description_NL", "ProductionID"],
    nullableFields: ["Titel_EN", "Description_EN"],
  },
  prices: {
    mandatoryFields: ["Name_NL", "Price", "EventID"],
    nullableFields: ["Name_EN"],
  },
};

const template = computed(() => templates[props.target]);
const src = computed(() => `/csv_templates/${props.target}_template.csv`);
const fileName = computed(() => `${props.target}_template.csv`);

const { t } = useI18n();
const templateTitle = computed(() => t(`admin.parser.targets.${props.target}`));
const downloadTitle = computed(
  () => `Download ${templateTitle.value} template`,
);
const templateDescription = computed(() =>
  t(`csv.templates.${props.target}.description`),
);
</script>

<template>
  <section class="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h3 class="text-lg font-bold text-card-foreground capitalize">
            {{ downloadTitle }}
          </h3>
          <p class="text-sm text-muted-foreground">
            {{ templateDescription }}
          </p>
          <p class="mt-2 text-sm font-semibold text-foreground">
            {{ t("csv.templates.general.header") }}
          </p>
          <ul
            class="mt-1 list-disc list-inside text-xs text-muted-foreground space-y-1"
          >
            <li>{{ t("csv.templates.general.autoFill") }}</li>
            <li>{{ t("csv.templates.general.disclaimer") }}</li>
            <li>{{ t("csv.templates.general.uniqueIds") }}</li>
          </ul>
        </div>

        <div class="flex-shrink-0">
          <AdminDownloadButton
            :label="downloadTitle"
            :name="fileName"
            :src="src"
          />
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-3">
        <div>
          <p
            class="mb-2 text-xs font-bold uppercase tracking-widest text-foreground"
          >
            {{ t("csv.templates.labels.mandatory") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="field in template.mandatoryFields"
              :key="field"
              class="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {{ field }}
            </span>
          </div>
        </div>

        <div>
          <p
            class="mb-2 text-xs font-bold uppercase tracking-widest text-foreground"
          >
            {{ t("csv.templates.labels.nullable") }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="field in template.nullableFields"
              :key="field"
              class="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {{ field }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

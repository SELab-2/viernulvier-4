<script setup lang="ts">
import { computed } from "vue";
import type { ParserTarget } from "~/composables/useParserApi";

interface Props {
  target: ParserTarget;
}

const props = defineProps<Props>();

type TemplateData = {
  title: string;
  description: string;
  fields: string[];
};

const templates: Record<ParserTarget, TemplateData> = {
  productions: {
    title: "Productions",
    description:
      "Use this file for new productions. It contains the production ID, bilingual title and description fields, optional artist and tagline fields, credits, and performer metadata.",
    fields: [
      "ID",
      "Titel_NL / Titel_EN",
      "Description1_NL / Description1_EN",
      "Description2_NL / Description2_EN",
      "Artist_NL / Artist_EN",
      "Tagline_NL / Tagline_EN",
      "Credits_NL / Credits_EN",
      "Performer_Type",
      "Attendance_Mode",
    ],
  },
  events: {
    title: "Events",
    description:
      "Use this file for events. It includes the event ID, start and end times, optional doors and intermission times, location names, and the linked production ID.",
    fields: [
      "ID",
      "Starttime",
      "Endtime",
      "Doors_At",
      "Intermission_At",
      "Location_NL / Location_EN",
      "ProductionID",
    ],
  },
  tags: {
    title: "Tags",
    description:
      "Use this file for tags. It contains the bilingual tag name fields and a comma-separated list of production IDs to attach the tag to.",
    fields: ["TagName_NL / TagName_EN", "ProductionIDs"],
  },
  blogs: {
    title: "Blogs",
    description:
      "Use this file for blogs. It contains the bilingual title and description fields plus the production ID the blog belongs to.",
    fields: [
      "Titel_NL / Titel_EN",
      "Description_NL / Description_EN",
      "ProductionID",
    ],
  },
  prices: {
    title: "Prices",
    description:
      "Use this file for prices. It contains the bilingual price name, the numeric price, and the event ID it should be linked to.",
    fields: ["Name_NL / Name_EN", "Price", "EventID"],
  },
};

const template = computed(() => templates[props.target]);
const src = computed(() => `/csv_templates/${props.target}_template.csv`);
const fileName = computed(() => `${props.target}_template.csv`);
</script>

<template>
  <section class="rounded-2xl border border-card-border bg-card p-6 shadow-sm">
    <div class="mb-6 space-y-2">
      <AdminDownloadButton
        :label="`Download ${template.title.toLowerCase()}`"
        :name="fileName"
        :src="src"
      />
    </div>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="field in template.fields"
          :key="field"
          class="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
        >
          {{ field }}
        </span>
      </div>
    </div>
  </section>
</template>

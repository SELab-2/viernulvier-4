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
  mandatoryFields: string[];
  nullableFields: string[];
};

const templates: Record<ParserTarget, TemplateData> = {
  productions: {
    title: "Productions",
    description:
      "Use this file for new productions. It contains the production ID, bilingual title and description fields, optional artist and tagline fields, credits, and performer metadata.",
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
    title: "Events",
    description:
      "Use this file for events. It includes the event ID, start and end times, optional doors and intermission times, location names, and the linked production ID.",
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
    title: "Tags",
    description:
      "Use this file for tags. It contains the bilingual tag name fields and a comma-separated list of production IDs to attach the tag to.",
    mandatoryFields: ["TagName_NL", "ProductionIDs"],
    nullableFields: ["TagName_EN"],
  },
  blogs: {
    title: "Blogs",
    description:
      "Use this file for blogs. It contains the bilingual title and description fields plus the production ID the blog belongs to.",
    mandatoryFields: ["Titel_NL", "Description_NL", "ProductionID"],
    nullableFields: ["Titel_EN", "Description_EN"],
  },
  prices: {
    title: "Prices",
    description:
      "Use this file for prices. It contains the bilingual price name, the numeric price, and the event ID it should be linked to.",
    mandatoryFields: ["Name_NL", "Price", "EventID"],
    nullableFields: ["Name_EN"],
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
      <div class="space-y-3">
        <div>
          <p
            class="mb-2 text-xs font-bold uppercase tracking-widest text-foreground"
          >
            Mandatory
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
            Can be null
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

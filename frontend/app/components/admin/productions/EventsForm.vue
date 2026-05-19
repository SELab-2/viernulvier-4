<!--
  EventsForm.vue
  - Manages the list of event drafts for a production.
  - Hides the initial empty placeholder for "create" flows (composable starts empty).
  - Allows user to add new event drafts and toggle collapse/expand of each event editor.
-->
<script setup lang="ts">
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-vue-next";
import type {
  ProductionEventsForm,
  EventDraft,
  ExistingEventDraft,
  NewEventDraft,
} from "~/composables/productions/steps/productionEvents";
import { newEventDraft } from "~/composables/productions/steps/productionEvents";

type ActiveEventDraft =
  | NewEventDraft
  | Extract<ExistingEventDraft, { deleted: false }>;

const props = defineProps<{
  modelValue: ProductionEventsForm;
}>();

const emit = defineEmits<{
  "update:modelValue": [ProductionEventsForm];
}>();

const { t } = useI18n();

// Flag indicating the user explicitly added blank placeholders via "Add event".
// This allows showing new empty drafts only after the user requested them.
// We initialize it to true if there are already new drafts in the model,
// ensuring they stay visible when the user navigates back to this step.
const showNewPlaceholders = ref(props.modelValue.some((e) => e.kind === "new"));

// Update helpers (emit back to parent)
function update(val: ProductionEventsForm) {
  emit("update:modelValue", val);
}

function updateEvent(index: number, updated: EventDraft) {
  const items = [...props.modelValue];
  items[index] = updated;
  update(items);
}

// visibleEvents: filter out deleted existing events and completely empty new drafts,
// unless user explicitly added placeholders or there are existing events.
const visibleEvents = computed<{ event: ActiveEventDraft; index: number }[]>(
  () =>
    props.modelValue
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => {
        if (event.kind === "existing") return !event.deleted;

        if (event.kind === "new") {
          const hasAnyField =
            Boolean(event.starttime) ||
            Boolean(event.endtime) ||
            Boolean(event.doors_at) ||
            Boolean(event.intermission_at) ||
            Boolean(event.location);

          const hasExisting = props.modelValue.some(
            (e) => e.kind === "existing" && !(e as ExistingEventDraft).deleted,
          );

          // Show if it has content, user explicitly added placeholders, or there are existing events
          return hasAnyField || showNewPlaceholders.value || hasExisting;
        }
        return false;
      }) as { event: ActiveEventDraft; index: number }[],
);

// Add/delete events — keep showNewPlaceholders in sync so UI shows newly added placeholders
function addEvent() {
  const items = [...props.modelValue, newEventDraft()];
  update(items);
  showNewPlaceholders.value = true;
  const newIndex = items.length - 1;
  const next = new Set(collapsedItems.value);
  next.delete(newIndex); // auto-expand the new item
  collapsedItems.value = next;
}

function deleteEvent(index: number) {
  const event = props.modelValue[index];
  if (!event) return;

  const items = [...props.modelValue];

  if (event.kind === "existing") {
    items[index] = {
      kind: "existing",
      id: event.id,
      deleted: true,
    };
  } else {
    items.splice(index, 1);
  }

  update(items);

  if (!items.some((e) => e.kind === "new")) {
    showNewPlaceholders.value = false;
  }
}

// collapsedItems tracks collapsed/expanded state by index
const collapsedItems = ref<Set<number>>(new Set());

function toggleCollapse(index: number) {
  const next = new Set(collapsedItems.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedItems.value = next;
}

// Helpers for rendering labels
function eventLabel(event: ActiveEventDraft, position: number): string {
  const start = event.starttime;
  if (!start) {
    return t("admin-productions.events.newEvent") + ` ${position}`;
  }
  try {
    const d = new Date(start);
    if (isNaN(d.getTime())) return start;

    return d.toLocaleString("nl-BE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return start;
  }
}

function locationLabel(event: ActiveEventDraft): string | null {
  const loc = event.location;
  if (!loc) return null;

  if (loc.type === "new") {
    return loc.label.nl + (loc.label.en ? ` / ${loc.label.en}` : "");
  }

  return loc.label;
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <div
      class="flex items-center justify-between border-b border-border px-6 py-4"
    >
      <div>
        <p
          class="text-[11px] font-black uppercase tracking-widest text-foreground"
        >
          {{ t("admin-productions.events.title") }}
        </p>
        <p class="mt-0.5 text-[10px] text-muted-foreground">
          {{ t("admin-productions.events.hint") }}
        </p>
      </div>

      <button
        class="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
        @click="addEvent"
      >
        <Plus :size="11" stroke-width="3" />
        {{ t("admin-productions.events.add") }}
      </button>
    </div>

    <div v-if="visibleEvents.length > 0" class="divide-y divide-border">
      <div v-for="({ event, index }, position) in visibleEvents" :key="index">
        <div
          class="flex cursor-pointer items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
          @click="toggleCollapse(index)"
        >
          <div class="flex min-w-0 flex-col gap-0.5">
            <p
              class="truncate text-[11px] font-black uppercase tracking-widest text-foreground"
            >
              {{ eventLabel(event, position + 1) }}
            </p>
            <p
              v-if="locationLabel(event)"
              class="flex items-center gap-1 text-[9px] text-muted-foreground"
            >
              <span>📍</span>
              <span class="truncate">{{ locationLabel(event) }}</span>
              <span
                v-if="event.location?.type === 'new'"
                class="rounded bg-accent/15 px-1 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
              >
                {{ t("admin-productions.events.new") }}
              </span>
            </p>
            <p
              v-else-if="!event.starttime"
              class="text-[9px] text-muted-foreground/60 italic"
            >
              {{ t("admin-productions.events.noDateYet") }}
            </p>
          </div>

          <div class="ml-4 flex shrink-0 items-center gap-2">
            <span
              v-if="event.kind === 'new'"
              class="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
            >
              {{ t("admin-productions.events.new") }}
            </span>

            <button
              class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
              @click.stop="deleteEvent(index)"
            >
              <Trash2 :size="11" stroke-width="2.5" />
            </button>

            <ChevronDown
              v-if="collapsedItems.has(index)"
              :size="13"
              class="text-muted-foreground"
            />
            <ChevronUp v-else :size="13" class="text-muted-foreground" />
          </div>
        </div>

        <div v-if="!collapsedItems.has(index)" class="px-6 pb-6 pt-2">
          <AdminProductionsEventItemEditor
            :event="event"
            :index="index"
            @update="(updated) => updateEvent(index, updated)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border bg-muted"
      >
        <CalendarDays :size="16" class="text-muted-foreground" />
      </div>
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.events.empty") }}
        </p>
        <p class="mt-1 text-[10px] text-muted-foreground/60">
          {{ t("admin-productions.events.emptyHint") }}
        </p>
      </div>
    </div>
  </div>
</template>

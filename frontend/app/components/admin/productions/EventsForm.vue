<!--
  components/admin/productions/EventsForm.vue

  Step 4 of the production form — event management.

  Displays a list of events (existing + new) belonging to a production.
  Each event has:
    - starttime (required), endtime, doors_at, intermission_at
    - an optional linked location (pick existing or create new)

  All state lives in the useProductionEvents composable draft.
  This component only mutates draft.value directly — no API calls.

  Props:
    modelValue — ProductionEventsForm draft ref
  Emits:
    update:modelValue — mutated form
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function update(val: ProductionEventsForm) {
  emit("update:modelValue", val);
}

function updateEvent(index: number, updated: EventDraft) {
  const items = [...props.modelValue];
  items[index] = updated;
  update(items);
}

// ─── Visible events (non-deleted) ────────────────────────────────────────────

const visibleEvents = computed<{ event: ActiveEventDraft; index: number }[]>(
  () =>
    props.modelValue
      .map((event, index) => ({ event, index }))
      .filter(
        ({ event }) =>
          event.kind === "new" || (event.kind === "existing" && !event.deleted),
      ) as { event: ActiveEventDraft; index: number }[],
);

// ─── Add / delete ─────────────────────────────────────────────────────────────

function addEvent() {
  update([...props.modelValue, newEventDraft()]);
  // Auto-expand the new event
  const newIndex = props.modelValue.length; // index before push = length before
  collapsedItems.value.delete(newIndex);
}

function deleteEvent(index: number) {
  const event = props.modelValue[index];
  if (!event) return;

  const items = [...props.modelValue];

  if (event.kind === "existing") {
    // Mark as deleted; finish will clean up
    items[index] = {
      kind: "existing",
      id: event.id,
      deleted: true,
    };
  } else {
    // New event — just remove
    items.splice(index, 1);
  }

  update(items);
}

// ─── Collapsed state (local UI only) ─────────────────────────────────────────

const collapsedItems = ref<Set<number>>(new Set());

function toggleCollapse(index: number) {
  const next = new Set(collapsedItems.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedItems.value = next;
}

// ─── Display label for an event's header row ─────────────────────────────────

function eventLabel(event: ActiveEventDraft, position: number): string {
  const start = event.starttime;
  if (!start) {
    return t("admin.productions.events.newEvent", "New event") + ` ${position}`;
  }
  // Format: "Mon 12 Jan 2026, 20:00"
  try {
    return new Date(start).toLocaleString("nl-BE", {
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
  return event.location?.label ?? null;
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <!-- ── HEADER ─────────────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between border-b border-border px-6 py-4"
    >
      <div>
        <p
          class="text-[11px] font-black uppercase tracking-widest text-foreground"
        >
          {{ t("admin.productions.events.title", "Events") }}
        </p>
        <p class="mt-0.5 text-[10px] text-muted-foreground">
          {{
            t(
              "admin.productions.events.hint",
              "Each event is a single occurrence of this production",
            )
          }}
        </p>
      </div>

      <button
        class="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
        @click="addEvent"
      >
        <Plus :size="11" stroke-width="3" />
        {{ t("admin.productions.events.add", "Add event") }}
      </button>
    </div>

    <!-- ── EVENT LIST ─────────────────────────────────────────────────────── -->
    <div v-if="visibleEvents.length > 0" class="divide-y divide-border">
      <div v-for="({ event, index }, position) in visibleEvents" :key="index">
        <!-- Row header (always visible, click to collapse) -->
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
                {{ t("admin.productions.events.new", "New") }}
              </span>
            </p>
            <p
              v-else-if="!event.starttime"
              class="text-[9px] text-muted-foreground/60 italic"
            >
              {{ t("admin.productions.events.noDateYet", "No date set yet") }}
            </p>
          </div>

          <div class="ml-4 flex shrink-0 items-center gap-2">
            <!-- Kind badge -->
            <span
              v-if="event.kind === 'new'"
              class="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
            >
              {{ t("admin.productions.events.new", "New") }}
            </span>

            <!-- Delete -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
              @click.stop="deleteEvent(index)"
            >
              <Trash2 :size="11" stroke-width="2.5" />
            </button>

            <!-- Collapse toggle -->
            <ChevronDown
              v-if="collapsedItems.has(index)"
              :size="13"
              class="text-muted-foreground"
            />
            <ChevronUp v-else :size="13" class="text-muted-foreground" />
          </div>
        </div>

        <!-- Editor (collapsible) -->
        <div v-if="!collapsedItems.has(index)" class="px-6 pb-6 pt-2">
          <AdminProductionsEventItemEditor
            :event="event"
            :index="index"
            @update="(updated) => updateEvent(index, updated)"
          />
        </div>
      </div>
    </div>

    <!-- ── EMPTY STATE ────────────────────────────────────────────────────── -->
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
          {{ t("admin.productions.events.empty", "No events yet") }}
        </p>
        <p class="mt-1 text-[10px] text-muted-foreground/60">
          {{
            t(
              "admin.productions.events.emptyHint",
              "A production must have at least one event",
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>

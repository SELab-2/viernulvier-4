// productionEvents.ts
// - Composable that manages event drafts for the production form step.
// - Exposes the draft state, original snapshot, initialization/reset logic,
//   a change-detection helper, and payload extraction for persistence.
import type { ProductionFormStep } from "~/types/ProductionFormStep";
import type { Event } from "@repo/common";

export type ExistingLocation = {
  type: "existing";
  id: number;
  label: string;
};

export type NewLocation = {
  type: "new";
  label: string;
};

export type EventLocationDraft = ExistingLocation | NewLocation | null;

// Event draft shapes used in the form model
export type ExistingEventDraft =
  | {
      kind: "existing";
      id: number;
      starttime: string;
      endtime: string | null;
      doors_at: string | null;
      intermission_at: string | null;
      location: EventLocationDraft;
      deleted: false;
    }
  | {
      kind: "existing";
      id: number;
      deleted: true;
    };

export type NewEventDraft = {
  kind: "new";
  starttime: string;
  endtime: string | null;
  doors_at: string | null;
  intermission_at: string | null;
  location: EventLocationDraft;
};

export type EventDraft = ExistingEventDraft | NewEventDraft;
export type ProductionEventsForm = EventDraft[];

// Payload types used when persisting changes
export type EventCreatePayload = {
  kind: "create";
  starttime: string;
  endtime: string | null;
  doors_at: string | null;
  intermission_at: string | null;
  /** Existing location id to link after creation. */
  linkLocationId: number | null;
  /** Label for a brand-new location to create + link after creation. */
  createLocation: string | null;
};

export type EventUpdatePayload = {
  kind: "update";
  id: number;
  starttime: string;
  endtime: string | null;
  doors_at: string | null;
  intermission_at: string | null;
  /** Id of the original linked location (to unlink), or null if there was none. */
  unlinkLocationId: number | null;
  /** Existing location id to link, or null if unchanged / removed. */
  linkLocationId: number | null;
  /** Label for a brand-new location to create + link, or null. */
  createLocation: string | null;
};

export type EventDeletePayload = {
  kind: "delete";
  id: number;
  /** Id of the linked location to unlink before deleting the event. */
  unlinkLocationId: number | null;
};

export type ProductionEventsPayload = {
  eventsToCreate: EventCreatePayload[];
  eventsToUpdate: EventUpdatePayload[];
  eventsToDelete: EventDeletePayload[];
};

type OriginalEventSnapshot = {
  id: number;
  starttime: string;
  endtime: string | null;
  doors_at: string | null;
  intermission_at: string | null;
  location: ExistingLocation | null;
};

// Returns a new empty event draft (used when user adds an event)
export function newEventDraft(): NewEventDraft {
  return {
    kind: "new",
    starttime: "",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    location: null,
  };
}

// cloneLocation: small helper to copy a location draft safely
function cloneLocation(loc: EventLocationDraft): EventLocationDraft {
  if (loc === null) return null;
  return { ...loc };
}

export function useProductionEvents(): ProductionFormStep<
  ProductionEventsForm,
  OriginalEventSnapshot[],
  ProductionEventsPayload
> {
  const eventApi = useEventApi();

  // Draft state and original snapshot are stored here
  const draft = ref<ProductionEventsForm>([]);
  const original = ref<OriginalEventSnapshot[] | null>(null);

  async function initialize(context: {
    mode: "create" | "edit";
    id?: string;
  }): Promise<void> {
    // initialize behaves differently for create vs edit
    if (context.mode === "create") {
      original.value = null;
      draft.value = [];
      return;
    }

    if (!context.id) return;

    const productionId = Number(context.id);

    const res = await eventApi.getAll({
      eventFilters: { production_id: productionId },
    });

    const paginated = res.data as { objects?: Event[] };

    const events = Array.isArray(paginated.objects) ? paginated.objects : [];

    const snapshots: OriginalEventSnapshot[] = await Promise.all(
      events.map(async (event) => {
        const locRes = await eventApi.getLocation(event.id, "nl");
        const loc = locRes.data
          ? {
              type: "existing" as const,
              id: locRes.data.id,
              label: locRes.data.location,
            }
          : null;

        return {
          id: event.id,
          starttime: event.starttime,
          endtime: event.endtime,
          doors_at: event.doors_at,
          intermission_at: event.intermission_at,
          location: loc,
        };
      }),
    );

    original.value = snapshots;

    draft.value = snapshots.map(
      (s): ExistingEventDraft => ({
        kind: "existing",
        id: s.id,
        starttime: s.starttime,
        endtime: s.endtime,
        doors_at: s.doors_at,
        intermission_at: s.intermission_at,
        location: cloneLocation(s.location),
        deleted: false,
      }),
    );
  }

  function reset(): void {
    // restore draft from original snapshot or clear for create
    if (!original.value) {
      draft.value = [];
      return;
    }

    draft.value = original.value.map(
      (s): ExistingEventDraft => ({
        kind: "existing",
        id: s.id,
        starttime: s.starttime,
        endtime: s.endtime,
        doors_at: s.doors_at,
        intermission_at: s.intermission_at,
        location: cloneLocation(s.location),
        deleted: false,
      }),
    );
  }

  function getChangedFields(): string[] {
    // Returns a list of identifiers for fields that changed — used by UI to show dirty state
    const changes: string[] = [];

    for (const event of draft.value) {
      if (event.kind === "new") {
        const hasAnyField =
          Boolean(event.starttime && event.starttime.trim() !== "") ||
          Boolean(event.endtime) ||
          Boolean(event.doors_at) ||
          Boolean(event.intermission_at) ||
          Boolean(event.location);
        if (!hasAnyField) continue;

        changes.push(`new:${event.starttime || "unsaved"}`);
        continue;
      }

      if (event.deleted) {
        changes.push(`deleted:${event.id}`);
        continue;
      }

      const orig = original.value?.find((o) => o.id === event.id);
      if (!orig) continue;

      for (const field of [
        "starttime",
        "endtime",
        "doors_at",
        "intermission_at",
      ] as const) {
        if (event[field] !== orig[field]) {
          changes.push(`${event.id}:${field}`);
        }
      }

      const origLocId = orig.location?.id ?? null;
      const draftLocId =
        event.location?.type === "existing" ? event.location.id : null;
      const draftLocIsNew = event.location?.type === "new";

      if (draftLocIsNew) {
        changes.push(`${event.id}:location:new`);
      } else if (origLocId !== draftLocId) {
        changes.push(`${event.id}:location:changed`);
      }
    }

    return changes;
  }

  function extractPayload(): ProductionEventsPayload {
    // Build lists of create/update/delete payloads based on draft vs original
    const eventsToCreate: EventCreatePayload[] = [];
    const eventsToUpdate: EventUpdatePayload[] = [];
    const eventsToDelete: EventDeletePayload[] = [];

    for (const event of draft.value) {
      if (event.kind === "existing" && event.deleted) {
        const orig = original.value?.find((o) => o.id === event.id);
        eventsToDelete.push({
          kind: "delete",
          id: event.id,
          unlinkLocationId: orig?.location?.id ?? null,
        });
        continue;
      }

      if (event.kind === "new") {
        if (!event.starttime || event.starttime.trim() === "") {
          continue;
        }

        eventsToCreate.push({
          kind: "create",
          starttime: event.starttime,
          endtime: event.endtime,
          doors_at: event.doors_at,
          intermission_at: event.intermission_at,
          linkLocationId:
            event.location?.type === "existing" ? event.location.id : null,
          createLocation:
            event.location?.type === "new" ? event.location.label : null,
        });
        continue;
      }

      const orig = original.value?.find((o) => o.id === event.id);
      const origLocId = orig?.location?.id ?? null;
      const draftLocId =
        event.location?.type === "existing" ? event.location.id : null;
      const locationChanged =
        origLocId !== draftLocId || event.location?.type === "new";

      eventsToUpdate.push({
        kind: "update",
        id: event.id,
        starttime: event.starttime,
        endtime: event.endtime,
        doors_at: event.doors_at,
        intermission_at: event.intermission_at,
        unlinkLocationId: locationChanged ? origLocId : null,
        linkLocationId:
          locationChanged && event.location?.type === "existing"
            ? event.location.id
            : null,
        createLocation:
          locationChanged && event.location?.type === "new"
            ? event.location.label
            : null,
      });
    }

    const remainingEvents = draft.value.filter((event) => {
      if (event.kind === "new") {
        return event.starttime.trim() !== "";
      }

      return !event.deleted;
    });

    if (remainingEvents.length === 0) {
      throw new Error("A production must contain at least one event");
    }

    return { eventsToCreate, eventsToUpdate, eventsToDelete };
  }

  return {
    id: "events",
    draft,
    original,
    initialize,
    reset,
    getChangedFields,
    extractPayload,
  };
}

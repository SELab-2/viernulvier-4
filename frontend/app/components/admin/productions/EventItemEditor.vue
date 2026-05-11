<!--
  components/admin/productions/EventItemEditor.vue

  Renders all editable fields for a single EventDraft that is not deleted.
  Purely display — all mutations bubble up via emits to EventsForm.

  Props:
    event     — the active (non-deleted) event draft
    index     — its index in the parent items array
  Emits:
    update    — full updated draft (parent replaces it in the array)
-->
<script setup lang="ts">
import { MapPin, X, Plus } from "lucide-vue-next";
import type { LocationView } from "@repo/common";
import type {
  NewEventDraft,
  ExistingEventDraft,
  EventLocationDraft,
  ExistingLocation,
} from "~/composables/productions/steps/productionEvents";

type ActiveEventDraft =
  | NewEventDraft
  | Extract<ExistingEventDraft, { deleted: false }>;

const props = defineProps<{
  event: ActiveEventDraft;
  index: number;
}>();

const emit = defineEmits<{
  update: [draft: ActiveEventDraft];
}>();

const { t } = useI18n();
const locationApi = useLocationApi();

// ─── Location search ──────────────────────────────────────────────────────────

const locationQuery = ref("");
const locationResults = ref<ExistingLocation[]>([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const dropdownEl = ref<HTMLElement | null>(null);

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(locationQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (val.trim().length === 0) {
    locationResults.value = [];
    showDropdown.value = false;
    return;
  }
  searchTimeout = setTimeout(() => fetchLocations(val.trim()), 300);
});

async function fetchLocations(query: string) {
  isSearching.value = true;
  try {
    const res = await locationApi.getAll({
      locationFilters: { location: query },
      languageFilters: { lang: "nl" },
    });
    const paginated = res.data as { data?: LocationView[] } | null;
    const items: LocationView[] = paginated?.data ?? [];
    locationResults.value = items.map((loc: LocationView) => ({
      type: "existing" as const,
      id: loc.id,
      label: loc.location,
    }));
    showDropdown.value = true;
  } catch {
    locationResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

// Close dropdown on outside click
onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
});
function onClickOutside(e: MouseEvent) {
  if (dropdownEl.value && !dropdownEl.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
}

// ─── Location mutations ───────────────────────────────────────────────────────

function selectExistingLocation(loc: ExistingLocation) {
  emit("update", { ...props.event, location: loc });
  locationQuery.value = "";
  showDropdown.value = false;
}

function confirmNewLocation() {
  const label = locationQuery.value.trim();
  if (!label) return;
  const loc: EventLocationDraft = { type: "new", label };
  emit("update", { ...props.event, location: loc });
  locationQuery.value = "";
  showDropdown.value = false;
}

function clearLocation() {
  emit("update", { ...props.event, location: null });
}

// ─── Field mutations ──────────────────────────────────────────────────────────

function updateRequiredField(field: "starttime", value: string) {
  emit("update", { ...props.event, [field]: value });
}

function updateOptionalField(
  field: "endtime" | "doors_at" | "intermission_at",
  value: string | null,
) {
  emit("update", { ...props.event, [field]: value });
}

// ─── Derived ─────────────────────────────────────────────────────────────────

const locationDisplay = computed(() => {
  const loc = props.event.location;
  if (!loc) return null;
  return loc.label;
});

const isNewLocation = computed(() => props.event.location?.type === "new");

// ─── Datetime helpers ─────────────────────────────────────────────────────────

/**
 * Converts a stored ISO datetime string to the "YYYY-MM-DDTHH:mm" format
 * that <input type="datetime-local"> expects. Returns "" for null/empty.
 */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/**
 * Converts a datetime-local input value back to a full ISO string.
 * The browser gives us "YYYY-MM-DDTHH:mm" — we store it with seconds
 * and a Z suffix so the backend receives a valid ISO 8601 datetime.
 * Returns null when the input is cleared.
 */
function fromDatetimeLocal(val: string): string | null {
  if (!val) return null;
  return `${val}:00.000Z`;
}
</script>

<template>
  <div class="space-y-5">
    <!-- ── DATETIME GRID ────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- Start time (required) -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.productions.events.starttime", "Start time") }}
          <span class="ml-1 text-accent">*</span>
        </label>
        <input
          type="datetime-local"
          :value="toDatetimeLocal(event.starttime)"
          class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
          @change="
            updateRequiredField(
              'starttime',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </div>

      <!-- End time -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.productions.events.endtime", "End time") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin.productions.events.optional", "optional") }}
          </span>
        </label>
        <input
          type="datetime-local"
          :value="toDatetimeLocal(event.endtime)"
          class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
          @change="
            updateOptionalField(
              'endtime',
              fromDatetimeLocal(($event.target as HTMLInputElement).value),
            )
          "
        />
      </div>

      <!-- Doors at -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.productions.events.doors_at", "Doors open") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin.productions.events.optional", "optional") }}
          </span>
        </label>
        <input
          type="datetime-local"
          :value="toDatetimeLocal(event.doors_at)"
          class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
          @change="
            updateOptionalField(
              'doors_at',
              fromDatetimeLocal(($event.target as HTMLInputElement).value),
            )
          "
        />
      </div>

      <!-- Intermission at -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.productions.events.intermission_at", "Intermission") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin.productions.events.optional", "optional") }}
          </span>
        </label>
        <input
          type="datetime-local"
          :value="toDatetimeLocal(event.intermission_at)"
          class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
          @change="
            updateOptionalField(
              'intermission_at',
              fromDatetimeLocal(($event.target as HTMLInputElement).value),
            )
          "
        />
      </div>
    </div>

    <!-- ── LOCATION ────────────────────────────────────────────────────────── -->
    <div class="border-t border-border pt-5">
      <label
        class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ t("admin.productions.events.location", "Location") }}
        <span
          class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
        >
          — {{ t("admin.productions.events.optional", "optional") }}
        </span>
      </label>

      <!-- Selected location pill -->
      <div v-if="locationDisplay !== null" class="mt-2 flex items-center gap-2">
        <div
          class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
          :class="
            isNewLocation
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border bg-muted text-foreground'
          "
        >
          <MapPin :size="10" stroke-width="2.5" />
          {{ locationDisplay }}
          <span
            v-if="isNewLocation"
            class="ml-0.5 rounded bg-accent/20 px-1 py-0.5 text-[8px]"
          >
            {{ t("admin.productions.events.new", "New") }}
          </span>
        </div>

        <button
          class="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
          @click="clearLocation"
        >
          <X :size="9" stroke-width="3" />
        </button>
      </div>

      <!-- Search input + dropdown -->
      <div v-else ref="dropdownEl" class="relative mt-2">
        <div class="relative">
          <MapPin
            :size="13"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            v-model="locationQuery"
            type="text"
            class="h-9 w-full rounded-md border border-border bg-background py-0 pr-3 pl-8 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
            :placeholder="
              t(
                'admin.productions.events.locationPlaceholder',
                'Search or create a location…',
              )
            "
            @focus="
              locationQuery.length > 0 ? (showDropdown = true) : undefined
            "
          />
        </div>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition-all duration-100"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-75"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="showDropdown || isSearching"
            class="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <!-- Searching indicator -->
            <div
              v-if="isSearching"
              class="px-4 py-3 text-[10px] font-medium text-muted-foreground"
            >
              {{ t("admin.productions.events.searching", "Searching…") }}
            </div>

            <template v-else>
              <!-- Existing results -->
              <button
                v-for="loc in locationResults"
                :key="loc.id"
                class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                @mousedown.prevent="selectExistingLocation(loc)"
              >
                <MapPin :size="11" class="shrink-0 text-muted-foreground" />
                {{ loc.label }}
              </button>

              <!-- Divider + create option (shown when there's a query) -->
              <div
                v-if="locationQuery.trim().length > 0"
                :class="{
                  'border-t border-border': locationResults.length > 0,
                }"
              >
                <button
                  class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  @mousedown.prevent="confirmNewLocation"
                >
                  <Plus
                    :size="11"
                    class="shrink-0 text-muted-foreground"
                    stroke-width="2.5"
                  />
                  <span>
                    {{ t("admin.productions.events.createLocation", "Create") }}
                    <span class="font-semibold">
                      "{{ locationQuery.trim() }}"
                    </span>
                  </span>
                </button>
              </div>

              <!-- No results, no query -->
              <div
                v-if="
                  locationResults.length === 0 &&
                  locationQuery.trim().length === 0
                "
                class="px-4 py-3 text-[10px] font-medium text-muted-foreground"
              >
                {{
                  t(
                    "admin.productions.events.typeToSearch",
                    "Type to search locations",
                  )
                }}
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

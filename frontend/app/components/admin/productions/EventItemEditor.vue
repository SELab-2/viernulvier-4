<!--
  EventItemEditor.vue
  - Small editor for a single event entry (start/end times, optional times, location).
  - Hosts the location search UI which teleports the dropdown to document.body to avoid ancestor clipping.
  - Emits update events with draft changes.
-->
<script setup lang="ts">
import { MapPin, X, Plus } from "lucide-vue-next";
import type {
  NewEventDraft,
  ExistingEventDraft,
  EventLocationDraft,
  ExistingLocation,
  NewPriceDraft,
  ExistingPriceDraft,
  PriceDraft,
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

const locationQuery = ref("");
const locationResults = ref<ExistingLocation[]>([]);
const isSearching = ref(false);
const showDropdown = ref(false);

const pendingLocationNL = ref("");
const isInputtingENLocation = ref(false);

const inputWrapper = ref<HTMLElement | null>(null);
const dropdownEl = ref<HTMLElement | null>(null);
const dropdownStyles = ref<Record<string, string>>({});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(locationQuery, (val) => {
  if (isInputtingENLocation.value) return; // Don't search when inputting translation

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

    const raw = (res && (res.data as any)) || null;
    const maybeData = raw?.data ?? raw?.objects ?? raw;
    const itemsArr = Array.isArray(maybeData) ? maybeData : [];

    locationResults.value = itemsArr.map((loc: any) => ({
      type: "existing" as const,
      id: Number(loc.id),
      label: loc.location ?? loc.name ?? String(loc.id ?? ""),
    }));

    showDropdown.value = true;
    updateDropdownPosition();
  } catch {
    locationResults.value = [];
    showDropdown.value = false;
  } finally {
    isSearching.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});
function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (
    (inputWrapper.value && inputWrapper.value.contains(target)) ||
    (dropdownEl.value && dropdownEl.value.contains(target))
  ) {
    return;
  }
  showDropdown.value = false;
  isInputtingENLocation.value = false;
}

function updateDropdownPosition() {
  if (!inputWrapper.value || !showDropdown.value) {
    dropdownStyles.value = {};
    return;
  }
  const rect = inputWrapper.value.getBoundingClientRect();
  dropdownStyles.value = {
    position: "fixed",
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: "9999",
  };
}

watch([showDropdown, locationResults, isSearching, locationQuery], () =>
  updateDropdownPosition(),
);

function selectExistingLocation(loc: ExistingLocation) {
  emit("update", { ...props.event, location: loc });
  locationQuery.value = "";
  showDropdown.value = false;
  isInputtingENLocation.value = false;
}

function confirmNewLocation() {
  const label = locationQuery.value.trim();
  if (!label) return;
  pendingLocationNL.value = label;
  isInputtingENLocation.value = true;
  locationQuery.value = "";
}

function finalizeNewLocation() {
  const nl = pendingLocationNL.value;
  const en = locationQuery.value.trim(); // Optional, fallback handled in orchestrator

  const loc: EventLocationDraft = { type: "new", label: { nl, en } };
  emit("update", { ...props.event, location: loc });
  locationQuery.value = "";
  pendingLocationNL.value = "";
  isInputtingENLocation.value = false;
  showDropdown.value = false;
}

function clearLocation() {
  emit("update", { ...props.event, location: null });
}

function updateRequiredField(field: "starttime", value: string) {
  emit("update", { ...props.event, [field]: value });
}

function updateOptionalField(
  field: "endtime" | "doors_at" | "intermission_at",
  value: string | null,
) {
  emit("update", { ...props.event, [field]: value });
}

const activePrices = computed(() => {
  return (props.event.prices || []).filter(
    (p) => p.kind === "new" || !p.deleted,
  );
});

function addPrice() {
  const newPrice: NewPriceDraft = {
    kind: "new",
    tempId: Math.random().toString(36).slice(2),
    name: { nl: "", en: "" },
    price: 0,
  };
  emit("update", {
    ...props.event,
    prices: [...(props.event.prices || []), newPrice],
  });
}

function updatePrice(index: number, field: "name" | "price", value: any) {
  const updatedPrices = [...(props.event.prices || [])];
  const activePrice = activePrices.value[index];
  const realIndex = updatedPrices.findIndex((p) => p === activePrice);

  if (realIndex > -1) {
    updatedPrices[realIndex] = {
      ...updatedPrices[realIndex],
      [field]: value,
    } as PriceDraft;
    emit("update", { ...props.event, prices: updatedPrices });
  }
}

function removePrice(index: number) {
  const updatedPrices = [...(props.event.prices || [])];
  const activePrice = activePrices.value[index];
  const realIndex = updatedPrices.findIndex((p) => p === activePrice);

  if (realIndex > -1) {
    if (updatedPrices[realIndex]?.kind === "existing") {
      updatedPrices[realIndex] = {
        ...updatedPrices[realIndex],
        deleted: true,
      } as ExistingPriceDraft;
    } else {
      updatedPrices.splice(realIndex, 1);
    }
    emit("update", { ...props.event, prices: updatedPrices });
  }
}

const locationDisplay = computed(() => {
  const loc = props.event.location;
  if (!loc) return null;
  if (loc.type === "new") {
    return loc.label.nl + (loc.label.en ? ` / ${loc.label.en}` : "");
  }
  return loc.label;
});

const isNewLocation = computed(() => props.event.location?.type === "new");

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromDatetimeLocal(val: string): string | null {
  if (!val) return null;
  // Send as the literal local time string without 'Z' or offset.
  // The backend schema now uses { local: true } to accept this.
  return `${val}:00.000`;
}

function fromDatetimeLocalRequired(val: string): string {
  if (!val) return "";
  return `${val}:00.000`;
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- Start time (required) -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.events.starttime") }}
          <span class="ml-1 text-accent">*</span>
        </label>
        <input
          type="datetime-local"
          :value="toDatetimeLocal(event.starttime)"
          class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
          @change="
            updateRequiredField(
              'starttime',
              fromDatetimeLocalRequired(
                ($event.target as HTMLInputElement).value,
              ),
            )
          "
        />
      </div>

      <!-- End time -->
      <div>
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.events.endtime") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin-productions.events.optional") }}
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
          {{ t("admin-productions.events.doors_at") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin-productions.events.optional") }}
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
          {{ t("admin-productions.events.intermission_at") }}
          <span
            class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
          >
            — {{ t("admin-productions.events.optional") }}
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

    <div class="border-t border-border pt-5">
      <label
        class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ t("admin-productions.events.location") }}
        <span
          class="ml-1 text-[9px] font-medium normal-case tracking-normal text-muted-foreground"
        >
          — {{ t("admin-productions.events.optional") }}
        </span>
      </label>

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
            {{ t("admin-productions.events.new") }}
          </span>
        </div>

        <button
          class="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
          @click="clearLocation"
        >
          <X :size="9" stroke-width="3" />
        </button>
      </div>

      <div v-else class="mt-2">
        <div class="relative" ref="inputWrapper">
          <MapPin
            :size="13"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            v-model="locationQuery"
            type="text"
            class="h-9 w-full rounded-md border border-border bg-background py-0 pr-3 pl-8 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
            :placeholder="
              isInputtingENLocation
                ? t(
                    'admin-productions.events.locationPlaceholderEN',
                    'EN (OPTIONAL)',
                  )
                : t('admin-productions.events.locationPlaceholder')
            "
            @focus="
              locationQuery.length > 0 || isInputtingENLocation
                ? (showDropdown = true)
                : undefined
            "
            @keydown.enter="
              isInputtingENLocation ? finalizeNewLocation() : undefined
            "
          />
        </div>

        <Teleport to="body">
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
              ref="dropdownEl"
              :style="dropdownStyles"
              class="overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            >
              <div
                v-if="isSearching"
                class="px-4 py-3 text-[10px] font-medium text-muted-foreground"
              >
                {{ t("admin-productions.events.searching") }}
              </div>

              <template v-else>
                <div
                  v-if="!isInputtingENLocation"
                  class="max-h-64 overflow-auto"
                >
                  <button
                    v-for="loc in locationResults"
                    :key="loc.id"
                    class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    @mousedown.prevent="selectExistingLocation(loc)"
                  >
                    <MapPin :size="11" class="shrink-0 text-muted-foreground" />
                    {{ loc.label }}
                  </button>
                </div>

                <div
                  v-if="
                    locationQuery.trim().length > 0 || isInputtingENLocation
                  "
                  :class="{
                    'border-t border-border':
                      locationResults.length > 0 && !isInputtingENLocation,
                  }"
                >
                  <button
                    class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    @mousedown.prevent="
                      isInputtingENLocation
                        ? finalizeNewLocation()
                        : confirmNewLocation()
                    "
                  >
                    <Plus
                      :size="11"
                      class="shrink-0 text-muted-foreground"
                      stroke-width="2.5"
                    />
                    <span v-if="!isInputtingENLocation">
                      {{ t("admin-productions.events.create") }}
                      <span class="font-semibold">
                        "{{ locationQuery.trim() }}"
                      </span>
                    </span>
                    <span v-else>
                      {{
                        t(
                          "admin-productions.events.confirmEN",
                          "Confirm English: ",
                        )
                      }}
                      <span class="font-semibold">
                        "{{ locationQuery.trim() || pendingLocationNL }}"
                      </span>
                    </span>
                  </button>
                </div>

                <div
                  v-if="
                    locationResults.length === 0 &&
                    locationQuery.trim().length === 0 &&
                    !isInputtingENLocation
                  "
                  class="px-4 py-3 text-[10px] font-medium text-muted-foreground"
                >
                  {{ t("admin-productions.events.typeToSearch") }}
                </div>
              </template>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>

    <div class="border-t border-border pt-5 mt-5">
      <div class="flex items-center justify-between mb-3">
        <label
          class="block text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.events.prices.title") }}
        </label>
        <button
          type="button"
          class="text-[10px] font-bold uppercase text-accent hover:underline"
          @click="addPrice"
        >
          + {{ t("admin-productions.events.prices.add") }}
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(price, i) in activePrices"
          :key="price.kind === 'existing' ? price.id : price.tempId"
          class="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div class="relative flex-1">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground pointer-events-none"
              >{{ t("dutch") }}</span
            >
            <input
              type="text"
              :value="price.name.nl"
              :placeholder="
                t(
                  'admin-productions.events.priceNamePlaceholderNl',
                  'Standaard',
                )
              "
              class="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-foreground focus:outline-none"
              @input="
                updatePrice(i, 'name', {
                  ...price.name,
                  nl: ($event.target as HTMLInputElement).value,
                })
              "
            />
          </div>

          <div class="relative flex-1">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground pointer-events-none"
              >{{ t("english") }}</span
            >
            <input
              type="text"
              :value="price.name.en || ''"
              :placeholder="
                t(
                  'admin-productions.events.priceNamePlaceholderEn',
                  'Standard (Optional)',
                )
              "
              class="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-foreground focus:outline-none"
              @input="
                updatePrice(i, 'name', {
                  ...price.name,
                  en: ($event.target as HTMLInputElement).value || null,
                })
              "
            />
          </div>

          <div class="flex items-center gap-2">
            <div class="relative w-24">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"
                >€</span
              >
              <input
                type="number"
                step="0.01"
                :value="price.price"
                class="h-9 w-full rounded-md border border-border bg-background pl-7 pr-3 text-sm focus:border-foreground focus:outline-none"
                @input="
                  updatePrice(
                    i,
                    'price',
                    parseFloat(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </div>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
              @click="removePrice(i)"
            >
              <X :size="14" stroke-width="2.5" />
            </button>
          </div>
        </div>
        <p
          v-if="activePrices.length === 0"
          class="text-[10px] text-muted-foreground italic"
        >
          {{ t("admin-productions.events.prices.empty") }}
        </p>
      </div>
    </div>
  </div>
</template>

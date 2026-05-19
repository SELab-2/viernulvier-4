import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import ArchiveSearchSection from "../../../app/components/archive/ArchiveSearchSection.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import * as useProductionApiModule from "../../../app/composables/useProductionApi";
import * as useEventApiModule from "../../../app/composables/useEventApi";

vi.mock("../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

vi.mock("../../../app/composables/useEventApi", () => ({
  useEventApi: vi.fn(),
}));

const mockArchiveView = {
  viewMode: ref("grid"),
  searchQuery: ref(""),
  sortOrder: ref("newest"),
  dateFilter: ref({ after: null, before: "2023-12-31" }),
  oldestDate: ref(null),
  tagIds: ref([]),
  fetchSuggestions: vi.fn(),
};

mockNuxtImport("useArchiveView", () => () => mockArchiveView);

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
  locale: ref("en"),
}));

vi.mock("~/utils/constants", () => ({
  getToday: () => "2023-12-31",
}));

describe("ArchiveSearchSection", () => {
  const mockProductionApi = {
    getAll: vi.fn(),
  };
  const mockEventApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(
      mockProductionApi,
    );
    (useEventApiModule.useEventApi as Mock).mockReturnValue(mockEventApi);

    mockArchiveView.viewMode.value = "grid";
    mockArchiveView.searchQuery.value = "";
    mockArchiveView.tagIds.value = [];
    mockArchiveView.dateFilter.value = { after: null, before: "2023-12-31" };
  });

  const globalStubs = {
    SearchBar: true,
    DefaultCalendar: true,
    TagFilter: true,
    LayoutGrid: true,
    List: true,
    X: true,
    BlogsStoryToolbar: {
      props: [
        "sortOrder",
        "extraFiltersActive",
        "sortLabel",
        "oldestDate",
        "newestDate",
        "dateFilter",
        "fetchSuggestions",
        "storyTitles",
      ],
      emits: [
        "update:sort-order",
        "update:search",
        "update:date-filter",
        "clear-filters",
      ],
      data() {
        return { panelOpen: false };
      },
      template: `
      <div>
        <button :aria-expanded="String(panelOpen)" @click="panelOpen = !panelOpen">Filters</button>
        <div v-if="panelOpen">
          <span>{{ sortLabel }}</span>
          <select :value="sortOrder" @change="$emit('update:sort-order', $event.target.value)">
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
          </select>
          <slot name="extra-filters" />
        </div>
        <slot name="action" />
        <button
          v-if="extraFiltersActive"
          class="absolute -top-2"
          @click="$emit('clear-filters')"
        >×</button>
      </div>
    `,
    },
  };

  it("renders correctly and fetches oldest date on mount", async () => {
    mockProductionApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1 }] },
    });
    mockEventApi.getAll.mockResolvedValue({
      data: { objects: [{ starttime: "2020-01-01T12:00:00Z" }] },
    });

    mount(ArchiveSearchSection, {
      global: { stubs: globalStubs },
    });

    await flushPromises();

    expect(mockProductionApi.getAll).toHaveBeenCalled();
    expect(mockEventApi.getAll).toHaveBeenCalledWith({
      eventFilters: { production_id: 1 },
    });
    expect(mockArchiveView.oldestDate.value).toBe("2020-01-01");
  });

  it("toggles filter panel", async () => {
    const wrapper = mount(ArchiveSearchSection, {
      global: { stubs: globalStubs },
    });

    expect(wrapper.find(".filter-slide-enter-active").exists()).toBe(false);

    const filterBtn = wrapper.find('button[aria-expanded="false"]');
    await filterBtn.trigger("click");

    expect(wrapper.find('button[aria-expanded="true"]').exists()).toBe(true);
    // Note: Transition might make it hard to check presence in DOM if using v-if,
    // but in our case v-if is inside Transition.
    expect(wrapper.text()).toContain("archive.sortLabel");
  });

  it("handles isAdmin mode", () => {
    mockArchiveView.viewMode.value = "grid";

    mount(ArchiveSearchSection, {
      props: { isAdmin: true },
      global: { stubs: globalStubs },
    });

    expect(mockArchiveView.viewMode.value).toBe("list");
  });

  it("toggles view mode in public mode", async () => {
    const wrapper = mount(ArchiveSearchSection, {
      props: { isAdmin: false },
      global: { stubs: globalStubs },
    });

    mockArchiveView.viewMode.value = "grid";
    await wrapper.find("button.w-12.h-12").trigger("click");
    expect(mockArchiveView.viewMode.value).toBe("list");

    await wrapper.find("button.w-12.h-12").trigger("click");
    expect(mockArchiveView.viewMode.value).toBe("grid");
  });

  it("shows clear filters button when filters are active", async () => {
    const wrapper = mount(ArchiveSearchSection, {
      global: { stubs: globalStubs },
    });

    expect(wrapper.find(".absolute.-top-2").exists()).toBe(false);

    mockArchiveView.tagIds.value = [1];
    await nextTick();
    expect(wrapper.find(".absolute.-top-2").exists()).toBe(true);

    await wrapper.find(".absolute.-top-2").trigger("click");
    expect(mockArchiveView.tagIds.value).toEqual([]);
  });

  it("updates sort order", async () => {
    const wrapper = mount(ArchiveSearchSection, {
      global: { stubs: globalStubs },
    });

    // Open filter panel to see select
    await wrapper.find('button[aria-expanded="false"]').trigger("click");

    const select = wrapper.find("select");
    await select.setValue("oldest");
    expect(mockArchiveView.sortOrder.value).toBe("oldest");
  });
});

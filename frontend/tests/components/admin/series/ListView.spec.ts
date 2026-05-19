import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import ListView from "../../../../app/components/admin/series/ListView.vue";
import * as useSeriesApiModule from "../../../../app/composables/useSeriesApi";
import * as useProductionBatchEditModule from "../../../../app/composables/productions/useProductionBatchEdit";
import * as useSeriesViewModule from "../../../../app/composables/useSeriesView";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

vi.mock("../../../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

vi.mock(
  "../../../../app/composables/productions/useProductionBatchEdit",
  () => ({
    useProductionBatchEdit: vi.fn(),
  }),
);

vi.mock("../../../../app/composables/useSeriesView", () => ({
  useSeriesView: vi.fn(),
}));

const mockProductionBatchEdit = {
  selectWholeSeries: vi.fn(),
};

const mockSeriesView = {
  searchQuery: ref(""),
  currentPage: ref(1),
  totalPages: ref(1),
  totalItems: ref(0),
  loading: ref(false),
  fetchSuggestions: vi.fn(),
};

const mockSnackbar = { add: vi.fn() };
mockNuxtImport("useSnackbar", () => () => mockSnackbar);

const mockRouter = {
  push: vi.fn(),
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  onError: vi.fn(),
};
mockNuxtImport("useRouter", () => () => mockRouter);

const mockLocale = ref("en");
mockNuxtImport("useI18n", () => () => ({
  t: (key: string, _params?: Record<string, unknown>) => key,
  locale: mockLocale,
}));

describe("AdminSeriesListView", () => {
  const mockApi = {
    getAll: vi.fn(),
    create: vi.fn(),
    modify: vi.fn(),
    remove: vi.fn(),
    getAllSeriesProductions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(mockApi);
    (
      useProductionBatchEditModule.useProductionBatchEdit as Mock
    ).mockReturnValue(mockProductionBatchEdit);
    (useSeriesViewModule.useSeriesView as Mock).mockReturnValue(mockSeriesView);
    mockSeriesView.searchQuery.value = "";
    mockSeriesView.currentPage.value = 1;
    mockSeriesView.loading.value = false;
  });

  it("loads series on mount", async () => {
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: { en: "Series 1", nl: "Reeks 1" } }],
        totalItems: 1,
      },
    });

    const wrapper = mount(ListView, {
      global: {
        stubs: {
          SearchBar: true,
          AdminSeriesCreateModal: true,
          AdminSeriesListItem: true,
          AdminSeriesPagination: true,
          Plus: true,
        },
      },
    });

    await flushPromises();

    expect(mockApi.getAll).toHaveBeenCalled();
    expect(
      wrapper.findAllComponents({ name: "AdminSeriesListItem" }),
    ).toHaveLength(1);
  });

  it("shows no results when list is empty", async () => {
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [],
        totalItems: 0,
      },
    });

    const wrapper = mount(ListView, {
      global: {
        stubs: {
          SearchBar: true,
          AdminSeriesCreateModal: true,
          AdminSeriesListItem: true,
          AdminSeriesPagination: true,
          Plus: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("series.no_results");
  });

  it("handles create series", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [], totalItems: 0 },
    });
    mockApi.create.mockResolvedValue({ data: { id: 2 } });

    const wrapper = mount(ListView, {
      global: {
        stubs: {
          SearchBar: true,
          AdminSeriesCreateModal: {
            template:
              "<button @click=\"$emit('create', { titel: { nl: 'New' }, description: { nl: 'Desc' } })\">Create</button>",
          },
          AdminSeriesListItem: true,
          AdminSeriesPagination: true,
          Plus: true,
        },
      },
    });

    await flushPromises();
    await wrapper.find("button").trigger("click");

    expect(mockApi.create).toHaveBeenCalled();
    expect(mockSnackbar.add).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("handles delete series", async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: { en: "Series 1", nl: "Reeks 1" } }],
        totalItems: 1,
      },
    });
    mockApi.remove.mockResolvedValue({ data: {} });

    const wrapper = mount(ListView, {
      global: {
        stubs: {
          SearchBar: true,
          AdminSeriesCreateModal: true,
          AdminSeriesListItem: {
            template: "<button @click=\"$emit('delete')\">Delete</button>",
          },
          AdminSeriesPagination: true,
          Plus: true,
        },
      },
    });

    await flushPromises();
    await wrapper.findAll("button").at(1)!.trigger("click");
    await flushPromises();

    expect(mockApi.remove).toHaveBeenCalledWith(1);
    expect(mockSnackbar.add).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("handles batch edit", async () => {
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: { en: "Series 1", nl: "Reeks 1" } }],
        totalItems: 1,
      },
    });

    const wrapper = mount(ListView, {
      global: {
        stubs: {
          SearchBar: true,
          AdminSeriesCreateModal: true,
          AdminSeriesListItem: {
            template:
              "<button @click=\"$emit('batch-edit')\">Batch Edit</button>",
          },
          AdminSeriesPagination: true,
          Plus: true,
        },
      },
    });

    await flushPromises();
    await wrapper.findAll("button").at(1)!.trigger("click");
    await flushPromises();

    expect(mockProductionBatchEdit.selectWholeSeries).toHaveBeenCalledWith(
      1,
      expect.any(Function),
    );
    // Verify the callback passed to selectWholeSeries
    const callback = (mockProductionBatchEdit.selectWholeSeries as Mock).mock
      .calls[0][1] as (id: number) => Promise<any[]>;
    mockApi.getAllSeriesProductions.mockResolvedValue([{ id: 101 }]);
    const result = await callback(1);
    expect(result).toEqual([{ id: 101 }]);
    expect(mockRouter.push).toHaveBeenCalled();
  });
});

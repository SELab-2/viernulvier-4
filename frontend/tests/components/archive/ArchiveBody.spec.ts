import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import ArchiveBody from "../../../app/components/archive/ArchiveBody.vue";
import * as useProductionApiModule from "../../../app/composables/useProductionApi";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

vi.mock("../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

// Mock all the other APIs
vi.mock("../../../app/composables/media/useStorageApi", () => ({
  useStorageApi: () => ({ deleteMedia: vi.fn() }),
}));
vi.mock("../../../app/composables/media/useCropApi", () => ({
  useCropApi: () => ({ remove: vi.fn() }),
}));
vi.mock("../../../app/composables/media/useItemApi", () => ({
  useItemApi: () => ({ remove: vi.fn() }),
}));
vi.mock("../../../app/composables/media/useGalleryApi", () => ({
  useGalleryApi: () => ({ remove: vi.fn() }),
}));

// Mock the child components with their correct paths relative to the component
vi.mock("../ProductionGridViewItem.vue", () => ({
  default: {
    name: "ProductionGridViewItem",
    template: '<div class="production-grid-view-item"></div>',
    props: ["productionView", "isAdmin"],
  },
}));
vi.mock("../ProductionListViewItem.vue", () => ({
  default: {
    name: "ProductionListViewItem",
    template: '<div class="production-list-view-item"></div>',
    props: ["productionView", "isAdmin"],
  },
}));

const mockRoute = {
  query: { page: "1" },
  path: "/productions",
};
const mockRouter = {
  push: vi.fn(),
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  onError: vi.fn(),
};

vi.mock("vue-router", async (importOriginal) => {
  const actual = await (
    importOriginal as () => Promise<Record<string, unknown>>
  )();
  return {
    ...actual,
    useRoute: () => mockRoute,
    useRouter: () => mockRouter,
  };
});

const mockArchiveView = {
  viewMode: ref("grid"),
  searchQuery: ref(""),
  sortOrder: ref("newest"),
  dateFilter: ref({ after: null, before: "2023-12-31" }),
  tagIds: ref([]),
  currentPage: ref(1),
  totalPages: ref(1),
  loading: ref(false),
};

mockNuxtImport("useArchiveView", () => () => mockArchiveView);

const mockSnackbar = { add: vi.fn() };
mockNuxtImport("useSnackbar", () => () => mockSnackbar);

const mockLocale = ref("en");
mockNuxtImport("useI18n", () => () => ({
  t: (key: string, _params?: Record<string, unknown>) => key,
  locale: mockLocale,
}));

describe("ArchiveBody", () => {
  const mockApi = {
    getAll: vi.fn(),
    remove: vi.fn(),
    getTags: vi.fn(),
    getMediaGallery: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(mockApi);

    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [],
        totalItems: 0,
      },
    });

    mockArchiveView.viewMode.value = "grid";
    mockArchiveView.searchQuery.value = "";
    mockArchiveView.currentPage.value = 1;
    mockArchiveView.loading.value = false;
    mockLocale.value = "en";
    mockRoute.query.page = "1";
    mockRoute.path = "/productions";
  });

  const globalStubs = {
    ArchivePagination: true,
    ArchiveSkeleton: true,
    ArchivePageJumper: true,
    NuxtLink: true,
    Edit2: true,
    FileText: true,
    Plus: true,
    ProductionGridViewItem: true,
    ProductionListViewItem: true,
  };

  it("renders correctly and fetches data on mount", async () => {
    const wrapper = mount(ArchiveBody, {
      global: {
        stubs: globalStubs,
      },
    });

    await flushPromises();
    expect(mockApi.getAll).toHaveBeenCalled();
    expect(wrapper.text()).toContain("archive.no_results");
  });

  it("renders a list of productions", async () => {
    const productions = [
      { id: 1, titel: "Prod 1" },
      { id: 2, titel: "Prod 2" },
    ];
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: productions,
        totalItems: 2,
      },
    });

    const wrapper = mount(ArchiveBody, {
      global: {
        stubs: {
          ...globalStubs,
          ProductionGridViewItem: {
            template: '<div class="production-grid-view-item"></div>',
          },
        },
      },
    });

    await flushPromises();
    expect(wrapper.findAll(".production-grid-view-item")).toHaveLength(2);
    expect(wrapper.text()).toContain("archive.total_results");
  });

  it("shows error state when API fails", async () => {
    mockApi.getAll.mockResolvedValue({
      error: "Error message",
    });

    const wrapper = mount(ArchiveBody, {
      global: {
        stubs: globalStubs,
      },
    });

    await flushPromises();
    expect(wrapper.text()).toContain("Error message");
  });

  it("shows skeleton while loading", () => {
    mockArchiveView.loading.value = true;

    const wrapper = mount(ArchiveBody, {
      global: {
        stubs: {
          ...globalStubs,
          ArchiveSkeleton: {
            template: '<div class="skeleton">Loading...</div>',
          },
        },
      },
    });

    expect(wrapper.find(".skeleton").exists()).toBe(true);
  });

  it("handles isAdmin mode correctly", async () => {
    mockArchiveView.viewMode.value = "grid"; // Start with grid

    const wrapper = mount(ArchiveBody, {
      props: {
        isAdmin: true,
      },
      global: {
        stubs: {
          ...globalStubs,
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await flushPromises();

    // In isAdmin mode, onMounted should set viewMode to list
    expect(mockArchiveView.viewMode.value).toBe("list");

    // Check for admin buttons
    expect(wrapper.text()).toContain("admin.csvImport.label");
    expect(wrapper.text()).toContain("admin-productions.new");
  });

  it("handles production deletion", async () => {
    const productions = [{ id: 1, titel: "Prod 1" }];
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: productions,
        totalItems: 1,
      },
    });
    mockApi.remove.mockResolvedValue({}); // Success response

    // 1. Maak een mock functie aan
    const confirmMock = vi.fn(() => true);
    // 2. Forceer deze globaal in de window (omdat jsdom deze mist)
    vi.stubGlobal("confirm", confirmMock);

    const wrapper = mount(ArchiveBody, {
      props: { isAdmin: true },
      global: {
        stubs: globalStubs,
      },
    });

    await flushPromises();

    // 3. Zoek het list-item component
    const listItem = wrapper.findComponent({ name: "ProductionListViewItem" });

    // 4. Trigger de delete actie veilig
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await listItem.vm.$emit("delete", productions[0], null);
    await flushPromises();

    // 5. Asserties!
    expect(confirmMock).toHaveBeenCalled();
    expect(mockApi.remove).toHaveBeenCalledWith(1);
    expect(mockSnackbar.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
      }),
    );
    expect(mockApi.getAll).toHaveBeenCalledTimes(2);

    // 6. Ruim de globale stub netjes op zodat andere tests niet breken
    vi.unstubAllGlobals();
  });

  it("reacts to searchQuery change with debounce", async () => {
    vi.useFakeTimers();
    mount(ArchiveBody, {
      global: { stubs: globalStubs },
    });

    await flushPromises();
    mockApi.getAll.mockClear();

    mockArchiveView.searchQuery.value = "test";
    await nextTick();

    // Should not call yet because of debounce
    expect(mockApi.getAll).not.toHaveBeenCalled();

    vi.runAllTimers();
    await flushPromises();
    expect(mockApi.getAll).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("reacts to filter changes", async () => {
    mount(ArchiveBody, {
      global: { stubs: globalStubs },
    });

    await flushPromises();
    mockApi.getAll.mockClear();

    // Change sort order
    mockArchiveView.sortOrder.value = "oldest";
    await nextTick();
    expect(mockApi.getAll).toHaveBeenCalled();
    mockApi.getAll.mockClear();

    // Change tag IDs
    mockArchiveView.tagIds.value = [1];
    await nextTick();
    expect(mockApi.getAll).toHaveBeenCalled();
    mockApi.getAll.mockClear();

    // Change date filter
    mockArchiveView.dateFilter.value = {
      after: "2023-01-01",
      before: "2023-12-31",
    };
    await nextTick();
    expect(mockApi.getAll).toHaveBeenCalled();
    mockApi.getAll.mockClear();

    // Change locale
    mockLocale.value = "nl";
    await nextTick();
    expect(mockApi.getAll).toHaveBeenCalled();
  });

  it("handles pagination changes", async () => {
    mount(ArchiveBody, {
      global: { stubs: globalStubs },
    });

    await flushPromises();
    mockApi.getAll.mockClear();

    mockArchiveView.currentPage.value = 2;
    await nextTick();

    expect(mockRouter.push).toHaveBeenCalledWith({
      query: { page: "2" },
    });
  });

  it("reloads when page is more than total pages", async () => {
    mockRoute.query.page = "5";

    // Initial load returns 0 items, total pages = 1
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [],
        totalItems: 0,
      },
    });

    mount(ArchiveBody, {
      global: { stubs: globalStubs },
    });

    await flushPromises();

    // It should load page 5, see totalPages is 1, then load page 1
    const getAllCalls = mockApi.getAll.mock.calls as Array<
      [{ paginationFilters: { page: number } }]
    >;

    expect(
      getAllCalls.some(([filters]) => filters.paginationFilters.page === 4),
    ).toBe(true);
    expect(
      getAllCalls.some(([filters]) => filters.paginationFilters.page === 0),
    ).toBe(true);
    expect(mockArchiveView.currentPage.value).toBe(1);
  });
});

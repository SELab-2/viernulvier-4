import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import HomeRandomYears from "../../../app/components/home/HomeRandomYears.vue";
import { ROUTES } from "../../../app/utils/routes";

const routerPush = vi.fn();
const getAllEvents = vi.fn();
const dateFilter = ref<Record<string, string>>({});

vi.mock("vue-router", async () => {
  const actual =
    await vi.importActual<typeof import("vue-router")>("vue-router");
  return {
    ...actual,
    useRouter: () => ({
      push: routerPush,
      replace: vi.fn(),
      back: vi.fn(),
      resolve: vi.fn(() => ({ href: "/" })),
      beforeEach: vi.fn(),
      beforeResolve: vi.fn(),
      afterEach: vi.fn(),
      onError: vi.fn(),
      isReady: vi.fn(() => Promise.resolve()),
      currentRoute: { value: { query: {}, path: "/" } },
    }),
  };
});

mockNuxtImport("useEventApi", () => () => ({
  getAll: getAllEvents,
}));

mockNuxtImport("useArchiveView", () => () => ({
  dateFilter,
}));

describe("HomeRandomYears", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dateFilter.value = {};
    getAllEvents.mockResolvedValue({
      data: { objects: [{ endtime: "2014-05-01T12:00:00.000Z" }] },
    });
  });

  it("builds year ranges from the oldest event", async () => {
    const wrapper = mount(HomeRandomYears, { props: { gap: 5 } });
    await flushPromises();

    expect(getAllEvents).toHaveBeenCalledWith({
      paginationFilters: { page: 0, limit: 1, descending: false },
    });
    expect(wrapper.findAll("button").length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain("2010 - 2014");
  });

  it("applies the selected date range before routing", async () => {
    const wrapper = mount(HomeRandomYears, { props: { gap: 5 } });
    await flushPromises();

    await wrapper.find("button").trigger("click");

    expect(dateFilter.value.after).toBe(
      new Date(2010, 0, 1).toISOString().split("T")[0],
    );
    expect(dateFilter.value.before).toMatch(/^2014-\d{2}-\d{2}$/);
    expect(routerPush).toHaveBeenCalledWith({ path: ROUTES.productions.base });
  });

  it("renders no ranges when the oldest year is not older than the current year", async () => {
    getAllEvents.mockResolvedValue({
      data: { objects: [{ endtime: new Date().toISOString() }] },
    });

    const wrapper = mount(HomeRandomYears, { props: { gap: 5 } });
    await flushPromises();

    expect(wrapper.findAll("button")).toHaveLength(0);
  });
});

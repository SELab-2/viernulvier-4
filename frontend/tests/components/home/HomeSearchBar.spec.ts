import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeSearchBar from "../../../app/components/home/HomeSearchBar.vue";
import {
  SearchAssociation,
  type SearchSuggestion,
} from "../../../app/types/Search";
import { ROUTES } from "../../../app/utils/routes";

const routerPush = vi.fn();
const fetchSuggestions = vi.fn();
const applyProductionSearch = vi.fn();
const applyPrintQuery = vi.fn();
const applyBlogQuery = vi.fn();

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

vi.mock("../../../app/composables/home/useHomeView", () => ({
  useHomeView: () => ({
    fetchSuggestions,
    applyProductionSearch,
    applyPrintQuery,
    applyBlogQuery,
  }),
}));

const searchBarStub = {
  name: "SearchBar",
  props: ["modelValue", "fetchSuggestions", "limit", "scrollLimit"],
  emits: ["search", "select", "update:modelValue"],
  template: `
    <div>
      <button data-test="search" @click="$emit('search', '  archive term  ')">Search</button>
      <button data-test="production" @click="$emit('select', productionSuggestion)">Production</button>
      <button data-test="blog" @click="$emit('select', blogSuggestion)">Blog</button>
      <button data-test="print" @click="$emit('select', printSuggestion)">Print</button>
      <button data-test="empty" @click="$emit('select', emptySuggestion)">Empty</button>
    </div>
  `,
  setup() {
    const productionSuggestion: SearchSuggestion = {
      display: "Production",
      searchValue: "Hamlet",
      association: SearchAssociation.Production,
    };
    const blogSuggestion: SearchSuggestion = {
      display: "Story",
      searchValue: "Interview",
      association: SearchAssociation.Blog,
    };
    const printSuggestion: SearchSuggestion = {
      display: "Print",
      searchValue: "Poster",
      association: SearchAssociation.Print,
    };
    const emptySuggestion: SearchSuggestion = {
      display: "Empty",
      searchValue: "   ",
    };
    return {
      productionSuggestion,
      blogSuggestion,
      printSuggestion,
      emptySuggestion,
    };
  },
};

describe("HomeSearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountSearch() {
    return mount(HomeSearchBar, {
      global: { stubs: { SearchBar: searchBarStub } },
    });
  }

  it("routes raw searches to the productions archive", async () => {
    const wrapper = mountSearch();

    await wrapper.find('[data-test="search"]').trigger("click");

    expect(applyProductionSearch).toHaveBeenCalledWith("  archive term  ");
    expect(routerPush).toHaveBeenCalledWith({ path: ROUTES.productions.base });
  });

  it("routes selected suggestions by association", async () => {
    const wrapper = mountSearch();

    await wrapper.find('[data-test="production"]').trigger("click");
    await wrapper.find('[data-test="blog"]').trigger("click");
    await wrapper.find('[data-test="print"]').trigger("click");

    expect(applyProductionSearch).toHaveBeenCalledWith("Hamlet");
    expect(applyBlogQuery).toHaveBeenCalledWith("Interview");
    expect(applyPrintQuery).toHaveBeenCalledWith("Poster");
    expect(routerPush).toHaveBeenNthCalledWith(1, {
      path: ROUTES.productions.base,
    });
    expect(routerPush).toHaveBeenNthCalledWith(2, {
      path: ROUTES.stories.base,
    });
    expect(routerPush).toHaveBeenNthCalledWith(3, { path: ROUTES.prints.base });
  });

  it("ignores blank selected values", async () => {
    const wrapper = mountSearch();

    await wrapper.find('[data-test="empty"]').trigger("click");

    expect(routerPush).not.toHaveBeenCalled();
  });
});

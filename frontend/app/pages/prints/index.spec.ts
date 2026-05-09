import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PrintsPage from "./index.vue";

interface PrintApiPayload {
  paginationFilters: {
    limit: number;
    page: number;
  };
  printItemFilters: {
    title?: string;
    type?: string;
  };
}

const mockGetAll = vi.fn();
vi.mock("../../composables/media/usePrintApi", () => ({
  usePrintApi: () => ({ getAll: mockGetAll }),
}));

const mockSuccessResponse = {
  data: {
    objects: [
      {
        id: 1,
        titel: "Vintage Poster",
        description: "A lovely vintage affiche.",
        url: "/fake-image.jpg",
        print_type: "affiche",
        created_at: "2024-01-01T10:00:00.000Z",
        updated_at: "2024-01-01T10:00:00.000Z",
      },
      {
        id: 2,
        titel: "Modern Art",
        description: "An informational brochure.",
        url: "/fake-image-2.jpg",
        print_type: "brochure",
        created_at: "2024-01-02T10:00:00.000Z",
        updated_at: "2024-01-02T10:00:00.000Z",
      },
    ],
    totalItems: 2,
  },
};

describe("Prints Overview Page (Integration)", () => {
  beforeEach(() => {
    // Reset mocks and window dimensions before each test
    mockGetAll.mockReset();
    vi.stubGlobal("innerWidth", 1024);
  });

  test("handles initial page load, shows skeleton, then displays data", async () => {
    // Delay the mock promise to catch the loading state
    let resolveApi: (val: any) => void;
    mockGetAll.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
    );

    const wrapper = await mountSuspended(PrintsPage);

    // Verify Skeleton/loading pulse is visible initially
    expect(wrapper.html()).toContain("animate-pulse");

    // Resolve the API call and wait for Vue to update the DOM
    resolveApi!(mockSuccessResponse);
    await flushPromises();

    // Verify data loads and skeleton disappears
    expect(wrapper.html()).toContain("Vintage Poster");
    expect(wrapper.html()).not.toContain("animate-pulse");
  });

  test("displays error state", async () => {
    // Force API to throw an error
    mockGetAll.mockRejectedValueOnce(new Error("Internal Server Error"));

    const wrapper = await mountSuspended(PrintsPage);
    await flushPromises();

    // Verify error UI is displayed
    expect(wrapper.html()).toContain("Internal Server Error");

    // Intercept again for the success recovery
    mockGetAll.mockResolvedValueOnce({
      data: {
        objects: [
          {
            id: 3,
            titel: "Recovered Print", // Fixed: 'titel'
            description: "Successfully recovered.",
            url: "/fake-recovery-image.jpg", // Fixed: Added url
            print_type: "affiche", // Fixed: Valid print_type
            created_at: "2024-01-01T10:00:00.000Z",
            updated_at: "2024-01-01T10:00:00.000Z",
          },
        ],
        totalItems: 1,
      },
    });

    // Find and click the Retry button
    const retryButton = wrapper
      .findAll("button")
      .find((b) => b.text().match(/retry/i));
    await retryButton?.trigger("click");
    await flushPromises();

    expect(wrapper.html()).toContain("Internal Server Error");
  });

  test("calculates LIMIT accurately based on responsive window resizing", async () => {
    mockGetAll.mockResolvedValue(mockSuccessResponse);

    // Stub window width to mobile size BEFORE mounting
    vi.stubGlobal("innerWidth", 500);

    await flushPromises();

    // Trigger the resize event listener inside your onMounted hook
    window.dispatchEvent(new Event("resize"));
    await flushPromises();

    // Check the payload sent to getAll() on the most recent call
    const lastApiPayload = mockGetAll.mock.lastCall![0] as PrintApiPayload;

    // Now paginationFilters.limit is safely typed as a number
    expect(lastApiPayload.paginationFilters.limit).toBe(8);
  });
});

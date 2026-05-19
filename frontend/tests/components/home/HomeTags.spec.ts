import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import HomeTags from "../../../app/components/home/HomeTags.vue";

const routerPush = vi.fn();
const tagIds = ref<number[]>([]);

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

mockNuxtImport("useArchiveView", () => () => ({ tagIds }));

describe("HomeTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tagIds.value = [];
  });

  it("renders clickable tags and routes with the selected tag", async () => {
    const wrapper = mount(HomeTags, {
      props: {
        tags: [
          { id: 7, tag: "Dance" },
          { id: 11, tag: "Music" },
        ],
      },
      global: {
        stubs: {
          TagPill: {
            props: ["label", "clickable"],
            template: `<button type="button" @click="$emit('click')">{{ label }}</button>`,
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Dance");
    expect(wrapper.text()).toContain("Music");

    await wrapper.findAll("button")[1].trigger("click");

    expect(tagIds.value).toEqual([11]);
    expect(routerPush).toHaveBeenCalledWith({ path: "/productions" });
  });
});

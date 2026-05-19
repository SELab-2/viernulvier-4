import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ArchiveSkeleton from "../../app/components/archive/ArchiveSkeleton.vue";
import StoriesSkeleton from "../../app/components/blogs/StoriesSkeleton.vue";
import PrintsSkeleton from "../../app/components/prints/PrintsSkeleton.vue";
import FormActions from "../../app/components/form/FormActions.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("loading skeletons and form actions", () => {
  it("renders archive skeletons in grid and list modes", () => {
    const grid = mount(ArchiveSkeleton, {
      props: { viewMode: "grid", pageSize: 3 },
    });
    const list = mount(ArchiveSkeleton, {
      props: { viewMode: "list", pageSize: 2 },
    });

    expect(grid.findAll(".animate-pulse")).toHaveLength(3);
    expect(grid.find(".grid").exists()).toBe(true);
    expect(list.findAll(".animate-pulse")).toHaveLength(2);
    expect(list.find(".flex.flex-col.gap-3").exists()).toBe(true);
  });

  it("marks story and print skeletons as busy loading regions", () => {
    const stories = mount(StoriesSkeleton);
    const prints = mount(PrintsSkeleton);

    expect(stories.attributes("aria-busy")).toBe("true");
    expect(stories.attributes("aria-label")).toBe("Loading stories");
    expect(stories.findAll(".animate-pulse").length).toBeGreaterThan(10);
    expect(prints.attributes("aria-busy")).toBe("true");
    expect(prints.attributes("aria-label")).toBe("Loading prints");
    expect(prints.findAll(".animate-pulse").length).toBeGreaterThan(10);
  });

  it("emits create-mode form actions and shows validation state", async () => {
    const wrapper = mount(FormActions, {
      props: {
        isValid: false,
        loading: false,
        mode: "create",
        backUrl: "/admin",
      },
      global: {
        stubs: {
          NuxtLink: { props: ["to"], template: '<a :href="to"><slot /></a>' },
        },
      },
    });

    expect(wrapper.text()).toContain("admin.blogs.validation.titleNlRequired");
    expect(wrapper.find('a[href="/admin"]').exists()).toBe(true);
    expect(wrapper.findAll("button")[1].element.disabled).toBe(true);

    await wrapper.findAll("button")[0].trigger("click");
    expect(wrapper.emitted("reset")).toHaveLength(1);
  });

  it("emits edit-mode restore and submit actions", async () => {
    const wrapper = mount(FormActions, {
      props: {
        isValid: true,
        loading: false,
        mode: "edit",
        showRestore: true,
        submitLabel: "Publish",
      },
    });
    const buttons = wrapper.findAll("button");

    expect(wrapper.text()).toContain("Publish");
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(wrapper.emitted("restore")).toHaveLength(1);
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });
});

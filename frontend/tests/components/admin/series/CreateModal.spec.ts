import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CreateModal from "../../../../app/components/admin/series/CreateModal.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

describe("AdminSeriesCreateModal", () => {
  it("renders correctly when show is true", () => {
    const wrapper = mount(CreateModal, {
      props: { show: true, loading: false },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          X: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    expect(wrapper.find("h2").text()).toBe("series.create");
  });

  it("emits close when backdrop or close button is clicked", async () => {
    const wrapper = mount(CreateModal, {
      props: { show: true, loading: false },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          X: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    await wrapper.find(".absolute.inset-0").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find("button.rounded-lg").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("emits create when title is provided and create button is clicked", async () => {
    const wrapper = mount(CreateModal, {
      props: { show: true, loading: false },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: {
            template:
              "<button id=\"mock-update\" @click=\"$emit('update', { titel: { nl: 'New Series' }, description: { nl: '' } })\">Update</button>",
          },
          X: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    await wrapper.find("#mock-update").trigger("click");

    const createBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("general.create"));
    await createBtn?.trigger("click");

    expect(wrapper.emitted("create")).toBeTruthy();
    expect(wrapper.emitted("create")?.[0][0]).toMatchObject({
      titel: { nl: "New Series" },
    });
  });

  it("disables create button when title is missing", () => {
    const wrapper = mount(CreateModal, {
      props: { show: true, loading: false },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          X: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    const createBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("general.create"));
    expect((createBtn?.element as HTMLButtonElement).disabled).toBe(true);
  });
});

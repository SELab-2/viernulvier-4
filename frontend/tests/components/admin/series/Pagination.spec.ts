import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import Pagination from "../../../../app/components/admin/series/Pagination.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockSeriesView = {
  currentPage: ref(1),
  totalPages: ref(5),
  loading: ref(false),
};
mockNuxtImport("useSeriesView", () => () => mockSeriesView);

describe("AdminSeriesPagination", () => {
  it("renders child components and binds props", () => {
    const wrapper = mount(Pagination, {
      global: {
        stubs: {
          SharedBasePageJumper: {
            template:
              '<div class="jumper">{{ currentPage }} / {{ totalPages }}</div>',
            props: ["currentPage", "totalPages", "loading"],
          },
          SharedBasePagination: {
            template:
              '<div class="pagination">{{ currentPage }} / {{ totalPages }}</div>',
            props: ["currentPage", "totalPages", "loading"],
          },
        },
      },
    });

    expect(wrapper.find(".jumper").text()).toBe("1 / 5");
    expect(wrapper.find(".pagination").text()).toBe("1 / 5");
  });

  it("updates currentPage in useSeriesView when child emits", async () => {
    const wrapper = mount(Pagination, {
      global: {
        stubs: {
          SharedBasePageJumper: {
            template:
              "<button @click=\"$emit('update:currentPage', 2)\">Next</button>",
            props: ["currentPage", "totalPages", "loading"],
          },
          SharedBasePagination: true,
        },
      },
    });

    await wrapper.find("button").trigger("click");
    expect(mockSeriesView.currentPage.value).toBe(2);
  });
});

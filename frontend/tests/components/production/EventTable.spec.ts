import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import ProductionStories from "../../../app/components/production/storyListView.vue";
import type { BlogView } from "@repo/common";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      general: {
        showMore: "Toon meer",
        showLess: "Toon minder",
      },
    },
  },
});

const stories: BlogView[] = [
  {
    id: 1,
    titel: "Titel 1",
    description: "description 1",
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    titel: "Titel 2",
    description: "description 2",
    created_at: "",
    updated_at: "",
  },
  {
    id: 3,
    titel: "Titel 3",
    description: "description 3",
    created_at: "",
    updated_at: "",
  },
  {
    id: 4,
    titel: "Titel 4",
    description: "description 4",
    created_at: "",
    updated_at: "",
  },
];

describe("ProductionStories", () => {
  let wrapper: VueWrapper<InstanceType<typeof ProductionStories>>;

  beforeEach(() => {
    wrapper = mount(ProductionStories, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
          BlogsStoryListItem: {
            props: ["story"],
            template: `
              <div>
                <h4>{{ story.titel }}</h4>
                <p>{{ story.description }}</p>
              </div>
            `,
          },
          ChevronDown: true,
          ChevronUp: true,
        },
        mocks: {
          ROUTES: {
            stories: {
              byId: (id: number) => `/stories/${id}`,
            },
          },
        },
      },
      props: {
        stories,
      },
    });
  });

  it("renders only 3 stories by default", () => {
    expect(wrapper.findAll("[data-testid=data-story]").length).toBe(3);
  });

  it("renders visible titles and descriptions", () => {
    const text = wrapper.text();

    expect(text).toContain("Titel 1");
    expect(text).toContain("description 1");
    expect(text).toContain("Titel 2");
    expect(text).toContain("description 2");
    expect(text).toContain("Titel 3");
    expect(text).toContain("description 3");

    expect(text).not.toContain("Titel 4");
  });

  it("shows the expand button", () => {
    expect(wrapper.text()).toContain("Toon meer");
  });
});

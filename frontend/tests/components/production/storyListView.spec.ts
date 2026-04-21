import { describe, it, expect, beforeEach } from "vitest";
import { createI18n } from "vue-i18n";
import ProductionStories from "../../../app/components/production/storyListView.vue";
import type { BlogView } from "@repo/common";
import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      production: {
        stories: "Verhalen",
      },
      general: {
        showMore: "Toon meer",
        showLess: "Toon minder",
      },
    },
    en: {
      production: {
        stories: "Stories",
      },
      general: {
        showMore: "Show more",
        showLess: "Show less",
      },
    },
  },
});

const stories: BlogView[] = [
  {
    id: 1,
    titel: "Titel 1",
    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-02-10T00:00:00Z",
    description: "description 1",
  },
  {
    id: 2,
    titel: "Titel 2",
    created_at: "2026-02-28T00:00:00Z",
    updated_at: "2026-02-28T00:00:00Z",
    description: "description 2",
  },
  {
    id: 3,
    titel: "Titel 3",
    created_at: "2026-03-05T00:00:00Z",
    updated_at: "2026-03-05T00:00:00Z",
    description: "description 3",
  },
  {
    id: 4,
    titel: "Titel 4",
    created_at: "2026-03-12T00:00:00Z",
    updated_at: "2026-03-12T00:00:00Z",
    description: "description 4",
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

  it("renders only limited stories by default", () => {
    expect(wrapper.findAll("[data-testid=data-story]").length).toBe(3);
  });

  it("renders title and description for visible stories", () => {
    const text = wrapper.text();

    expect(text).toContain("Titel 1");
    expect(text).toContain("description 1");

    expect(text).toContain("Titel 2");
    expect(text).toContain("description 2");

    expect(text).toContain("Titel 3");
    expect(text).toContain("description 3");

    expect(text).not.toContain("Titel 4");
  });

  it("shows expand button when stories exceed limit", () => {
    expect(wrapper.text()).toContain("Toon meer");
  });

  it("shows no button when stories do not exceed limit", () => {
    const w = mount(ProductionStories, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
          BlogsStoryListItem: {
            props: ["story"],
            template: "<div>{{ story.titel }}</div>",
          },
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
        stories: stories.slice(0, 3),
      },
    });

    expect(w.find("button").exists()).toBe(false);
  });

  it("shows empty state when no stories are provided", () => {
    const w = mount(ProductionStories, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: true,
          BlogsStoryListItem: true,
        },
      },
      props: {
        stories: [],
      },
    });

    expect(w.text()).not.toContain("Titel");
    expect(w.find("[data-testid=data-story]").exists()).toBe(false);
  });
});

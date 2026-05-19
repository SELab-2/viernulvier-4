import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ThemeToggle from "../../app/components/ThemeToggle.vue";

const matchMediaMock = vi.fn<(query: string) => MediaQueryList>();

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    matchMediaMock.mockReset();
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  it("initializes to light mode by default", () => {
    mount(ThemeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles to dark mode when clicked", async () => {
    const wrapper = mount(ThemeToggle, {
      global: { stubs: { Sun: true, Moon: true } },
    });

    await wrapper.find("button").trigger("click");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(wrapper.text()).toContain("LIGHT");
  });

  it("initializes from localStorage", () => {
    localStorage.setItem("theme", "dark");
    mount(ThemeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("initializes from system preference if no localStorage", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    mount(ThemeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

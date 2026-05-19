import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import Login from "../../../../app/pages/admin/login/index.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockLogin = vi.fn();
mockNuxtImport("useAuth", () => () => ({
  login: mockLogin,
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

const { mockNavigateTo } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
}));
mockNuxtImport("navigateTo", () => mockNavigateTo);

describe("Admin Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const globalStubs = {
    LocaleSelector: true,
    ThemeToggle: true,
    Eye: true,
    EyeOff: true,
  };

  it("renders correctly", () => {
    const wrapper = mount(Login, {
      global: { stubs: globalStubs },
    });

    expect(wrapper.text()).toContain("VIERNULVIER");
    expect(wrapper.text()).toContain("Admin");
    expect(wrapper.find('button[type="submit"]').text()).toContain(
      "login.signIn",
    );
  });

  it("handles successful login", async () => {
    mockLogin.mockResolvedValue({ success: true });

    const wrapper = mount(Login, {
      global: { stubs: globalStubs },
    });

    await wrapper.find('input[type="text"]').setValue("admin");
    await wrapper.find('input[type="password"]').setValue("password123");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(mockLogin).toHaveBeenCalledWith("admin", "password123");
    expect(mockNavigateTo).toHaveBeenCalled();
  });

  it("handles failed login", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const wrapper = mount(Login, {
      global: { stubs: globalStubs },
    });

    await wrapper.find('input[type="text"]').setValue("admin");
    await wrapper.find('input[type="password"]').setValue("wrong-password");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Invalid credentials");
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const wrapper = mount(Login, {
      global: { stubs: globalStubs },
    });

    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput.attributes("type")).toBe("password");

    await wrapper.find('button[type="button"]').trigger("click");
    // After toggle, it should be type="text"
    expect(
      wrapper.find('input[autocomplete="current-password"]').attributes("type"),
    ).toBe("text");
  });
});

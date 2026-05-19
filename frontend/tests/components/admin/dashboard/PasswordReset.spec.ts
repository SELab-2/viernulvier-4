import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import PasswordReset from "../../../../app/components/admin/dashboard/PasswordReset.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockAccount = ref({ id: 1 });
mockNuxtImport("useAuth", () => () => ({
  account: mockAccount,
}));

const mockChangePassword = vi.fn();
mockNuxtImport("useAccountApi", () => () => ({
  changePassword: mockChangePassword,
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

describe("PasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccount.value = { id: 1 };
  });

  it("renders correctly", () => {
    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    expect(wrapper.text()).toContain("admin.dashboard.changePassword");
    expect(wrapper.find('button[type="submit"]').text()).toContain(
      "admin.dashboard.updatePassword",
    );
  });

  it("shows error for short password", async () => {
    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("short");
    await inputs[1].setValue("short");

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("admin.dashboard.passwordTooShort");
  });

  it("shows error for mismatching passwords", async () => {
    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("password123");
    await inputs[1].setValue("password456");

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("accounts.password_mismatch");
  });

  it("handles successful password change", async () => {
    mockChangePassword.mockResolvedValue({});

    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("new-password-789");
    await inputs[1].setValue("new-password-789");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(mockChangePassword).toHaveBeenCalledWith({
      password: "new-password-789",
    });
    expect(wrapper.text()).toContain("admin.dashboard.passwordSuccess");
    // Form should be cleared
    expect(inputs[0].element.value).toBe("");
    expect(inputs[1].element.value).toBe("");
  });

  it("handles API error", async () => {
    mockChangePassword.mockResolvedValue({ error: "API error message" });

    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("new-password-789");
    await inputs[1].setValue("new-password-789");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("API error message");
  });

  it("shows error when not authenticated", async () => {
    mockAccount.value = null;

    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("new-password-789");
    await inputs[1].setValue("new-password-789");

    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("admin.dashboard.notAuthenticated");
  });

  it("toggles password visibility", async () => {
    const wrapper = mount(PasswordReset, {
      global: {
        stubs: { KeyRound: true, Eye: true, EyeOff: true },
      },
    });

    const inputs = wrapper.findAll("input");
    expect(inputs[0].attributes("type")).toBe("password");

    await wrapper.findAll('button[type="button"]')[0].trigger("click");
    expect(inputs[0].attributes("type")).toBe("text");

    await wrapper.findAll('button[type="button"]')[0].trigger("click");
    expect(inputs[0].attributes("type")).toBe("password");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
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

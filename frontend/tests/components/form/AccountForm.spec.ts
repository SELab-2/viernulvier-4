import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import AccountForm from "../../../app/components/admin/AccountForm.vue";

const FormBaseFormStub = {
  name: "FormBaseForm",
  props: ["fields", "initialValues"],
  emits: ["submit"],
  template:
    "<div data-testid='form-base-form-stub'><button data-testid='emit-submit' type='button' @click=\"$emit('submit', { username: 'admin-user', password: 'secret123', confirmPassword: 'secret123' })\">emit</button><button data-testid='emit-submit-mismatch' type='button' @click=\"$emit('submit', { username: 'admin-user', password: 'secret123', confirmPassword: 'other' })\">emit-mismatch</button></div>",
};

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      accounts: {
        username: "Username",
        username_placeholder: "Enter a username",
        password: "Password",
        password_placeholder: "Enter a secure password",
        confirm_password: "Confirm password",
        confirm_password_placeholder: "Repeat your password",
        password_mismatch: "Passwords do not match.",
      },
    },
    nl: {
      accounts: {
        username: "Gebruikersnaam",
        username_placeholder: "Voer een gebruikersnaam in",
        password: "Wachtwoord",
        password_placeholder: "Voer een veilig wachtwoord in",
        confirm_password: "Bevestig wachtwoord",
        confirm_password_placeholder: "Herhaal je wachtwoord",
        password_mismatch: "Wachtwoorden komen niet overeen.",
      },
    },
  },
});

describe("AccountForm", () => {
  beforeEach(() => {
    i18n.global.locale.value = "en";
  });

  it("passes translated fields to BaseForm", () => {
    const wrapper = mount(AccountForm, {
      global: {
        plugins: [i18n],
        stubs: {
          FormBaseForm: FormBaseFormStub,
        },
      },
    });

    const baseForm = wrapper.findComponent(FormBaseFormStub);
    const fields = baseForm.props("fields") as Array<{
      name: string;
      props?: Record<string, unknown>;
    }>;

    expect(fields).toHaveLength(4);
    expect(fields[0]?.name).toBe("username");
    expect(fields[0]?.props?.label).toBe("Username");
    expect(fields[0]?.props?.placeholder).toBe("Enter a username");
    expect(fields[1]?.name).toBe("password");
    expect(fields[1]?.props?.label).toBe("Password");
    expect(fields[1]?.props?.placeholder).toBe("Enter a secure password");
    expect(fields[2]?.name).toBe("confirmPassword");
    expect(fields[2]?.props?.label).toBe("Confirm password");
    expect(fields[2]?.props?.placeholder).toBe("Repeat your password");
    expect(fields[3]?.name).toBe("role");
  });

  it("updates translated labels when locale changes", async () => {
    const wrapper = mount(AccountForm, {
      global: {
        plugins: [i18n],
        stubs: {
          FormBaseForm: FormBaseFormStub,
        },
      },
    });

    i18n.global.locale.value = "nl";
    await nextTick();

    const baseForm = wrapper.findComponent(FormBaseFormStub);
    const fields = baseForm.props("fields") as Array<{
      props?: Record<string, unknown>;
    }>;

    expect(fields[0]?.props?.label).toBe("Gebruikersnaam");
    expect(fields[0]?.props?.placeholder).toBe("Voer een gebruikersnaam in");
    expect(fields[1]?.props?.label).toBe("Wachtwoord");
    expect(fields[1]?.props?.placeholder).toBe("Voer een veilig wachtwoord in");
    expect(fields[2]?.props?.label).toBe("Bevestig wachtwoord");
    expect(fields[2]?.props?.placeholder).toBe("Herhaal je wachtwoord");
  });

  it("maps form submit payload and re-emits CreateAccount shape", async () => {
    const wrapper = mount(AccountForm, {
      global: {
        plugins: [i18n],
        stubs: {
          FormBaseForm: FormBaseFormStub,
        },
      },
    });

    await wrapper.get("[data-testid='emit-submit']").trigger("click");

    expect(wrapper.emitted("submit")?.[0]?.[0]).toEqual({
      username: "admin-user",
      password: "secret123",
      superAdmin: false,
    });
  });

  it("shows mismatch error and does not emit when passwords differ", async () => {
    const wrapper = mount(AccountForm, {
      global: {
        plugins: [i18n],
        stubs: {
          FormBaseForm: FormBaseFormStub,
        },
      },
    });

    await wrapper.get("[data-testid='emit-submit-mismatch']").trigger("click");

    expect(wrapper.emitted("submit")).toBeUndefined();
    expect(wrapper.text()).toContain("Passwords do not match.");
  });
});

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { PublicAccount } from "@repo/common";
import AccountListRow from "../../../app/components/admin/AccountListRow.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      accounts: {
        accountId: "Account ID",
        role: "Role",
        delete: "Delete",
        superAdmin: "Super admin",
        admin: "Admin",
        protected: "Protected",
      },
    },
  },
});

const superAdminAccount: PublicAccount = {
  id: 1,
  username: "root-admin",
  superAdmin: true,
};

const adminAccount: PublicAccount = {
  id: 2,
  username: "intern-alice",
  superAdmin: false,
};

describe("AccountListRow", () => {
  it("renders username, id and role text", () => {
    const wrapper = mount(AccountListRow, {
      global: {
        plugins: [i18n],
      },
      props: {
        account: superAdminAccount,
      },
    });

    const text = wrapper.text();
    expect(text).toContain("root-admin");
    expect(text).toContain("1");
    expect(text).toContain("Super admin");
    expect(text).toContain("Account ID");
    expect(text).toContain("Role");
  });

  it("shows delete button and emits delete for non-super-admin account", async () => {
    const wrapper = mount(AccountListRow, {
      global: {
        plugins: [i18n],
      },
      props: {
        account: adminAccount,
      },
    });

    const deleteButton = wrapper.find('[aria-label="Delete"]');
    expect(deleteButton.exists()).toBe(true);

    await deleteButton.trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual([adminAccount]);
  });

  it("hides delete button and shows protected label for super-admin account", () => {
    const wrapper = mount(AccountListRow, {
      global: {
        plugins: [i18n],
      },
      props: {
        account: superAdminAccount,
      },
    });

    expect(wrapper.find('[aria-label="Delete"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Protected");
  });
});

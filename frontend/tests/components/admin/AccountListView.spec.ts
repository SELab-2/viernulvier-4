import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { PublicAccount } from "@repo/common";
import AccountListView from "../../../app/components/admin/AccountListView.vue";
import AccountListRow from "../../../app/components/admin/AccountListRow.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      accounts: {
        title: "Accounts",
        subtitle: "Manage the accounts in this list.",
        emptyTitle: "No accounts found",
        emptyDescription: "There are no accounts available to display yet.",
        username: "Username",
        accountId: "Account ID",
        role: "Role",
        actions: "Actions",
        delete: "Delete",
        superAdmin: "Super admin",
        admin: "Admin",
        protected: "Protected",
      },
    },
  },
});

const accounts: PublicAccount[] = [
  { id: 1, username: "root-admin", superAdmin: true },
  { id: 2, username: "intern-alice", superAdmin: false },
];

describe("AccountListView", () => {
  it("renders one row per account", () => {
    const wrapper = mount(AccountListView, {
      global: {
        plugins: [i18n],
      },
      props: {
        accounts,
      },
    });

    expect(wrapper.findAllComponents(AccountListRow)).toHaveLength(
      accounts.length,
    );
  });

  it("renders title, headers, and account rows", () => {
    const wrapper = mount(AccountListView, {
      global: {
        plugins: [i18n],
      },
      props: {
        accounts,
      },
    });

    const text = wrapper.text();
    expect(text).toContain("Accounts");
    expect(text).toContain("Username");
    expect(text).toContain("Account ID");
    expect(text).toContain("Role");
    expect(text).toContain("root-admin");
    expect(text).toContain("intern-alice");
    expect(text).toContain("Protected");
  });

  it("emits delete when delete button is clicked for a non-super-admin account", async () => {
    const wrapper = mount(AccountListView, {
      global: {
        plugins: [i18n],
      },
      props: {
        accounts,
      },
    });

    const deleteButton = wrapper.find('[aria-label="Delete"]');
    expect(deleteButton.exists()).toBe(true);

    await deleteButton.trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual([accounts[1]]);
  });

  it("shows empty state when no accounts are provided", () => {
    const wrapper = mount(AccountListView, {
      global: {
        plugins: [i18n],
      },
      props: {
        accounts: [],
      },
    });

    expect(wrapper.text()).toContain("No accounts found");
    expect(wrapper.text()).toContain(
      "There are no accounts available to display yet.",
    );
    expect(wrapper.findAll('[aria-label="Delete"]').length).toBe(0);
  });
});

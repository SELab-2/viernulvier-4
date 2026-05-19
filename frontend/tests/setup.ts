import { afterEach, beforeEach } from "vitest";

function ensureHistory() {
  if (typeof globalThis.history !== "undefined") return;

  Object.defineProperty(globalThis, "history", {
    value: {
      state: null,
      length: 1,
      pushState: () => {},
      replaceState: () => {},
      back: () => {},
      forward: () => {},
      go: () => {},
    },
    configurable: true,
    writable: true,
  });
}

ensureHistory();
beforeEach(ensureHistory);
afterEach(ensureHistory);

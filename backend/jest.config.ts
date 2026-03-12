import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testRegex: ".*\\.(spec|e2e-spec)\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "main\\.ts$",
    ".*\\.module\\.ts$",
    "app.controller.ts",
    "app.service.ts",
    "/src/database/",
    "src/util/logger/", // Shouldn't be testing the logger.
    "src/util/scraper/", // This should not be needed to test.
  ],

  // Fail tests if global coverage under 70%
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};

export default config;

import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
  "main\\.ts$",
  ".*\\.module\\.ts$"
  ],

  // Fail tests if global coverage under 70%
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};

export default config;

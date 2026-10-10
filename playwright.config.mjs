import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:4178/frontier-transformation-engineer/",
    browserName: "chromium",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["list"]],
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4178/frontier-transformation-engineer/",
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});

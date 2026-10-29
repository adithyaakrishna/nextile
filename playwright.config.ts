import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const ORIGIN = `http://localhost:${PORT}`;
const chromium = { browserName: "chromium" as const };

// Every device is emulated in Chromium (see docs/ENVIRONMENT.md); uncomment a WebKit or Firefox project to add one
const DEVICES = [
  { name: "mobile-320", use: { ...chromium, viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  { name: "iphone-se", use: { ...devices["iPhone SE"], ...chromium } },
  { name: "pixel-7", use: { ...devices["Pixel 7"], ...chromium } },
  { name: "ipad-mini", use: { ...devices["iPad Mini"], ...chromium } },
  { name: "laptop-1366", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } } },
  { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  // { name: "iphone-se-webkit", use: { ...devices["iPhone SE"] } },
  // { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
];

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1, // every test shares one server clock
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: [["list"]],
  outputDir: "test-results",
  use: { baseURL: ORIGIN, trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: `${ORIGIN}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "pipe",
    env: {
      E2E: "1",
      NX_CONTENT: "fixture",
      PUBLIC_ORIGIN: ORIGIN,
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      DATABASE_PATH: resolve("tmp/e2e/nextile.db"),
    },
  },
  projects: [
    { name: "laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } }, testIgnore: [/viewport\.spec/, /screenshots\.spec/] },
    ...DEVICES.map((d) => ({ ...d, testMatch: /viewport\.spec/ })),
    {
      name: "screenshots-phone",
      testMatch: /screenshots\.spec/,
      use: { ...devices["iPhone 13"], ...chromium, video: { mode: "on", size: { width: 390, height: 844 } } },
    },
    { name: "screenshots-desktop", testMatch: /screenshots\.spec/, use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } } },
  ],
});

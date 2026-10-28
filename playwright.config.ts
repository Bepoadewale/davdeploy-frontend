import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './browser-tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
  webServer: {
    command:
      'VITE_API_BASE_URL=http://api.fixture VITE_AUTH_MODE=local-fixture VITE_ENABLE_LOCAL_LOGIN=true npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

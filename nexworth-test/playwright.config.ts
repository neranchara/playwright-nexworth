import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  timeout: 120_000,

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'frontend',
      testDir: './tests/frontend',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3000',
      },
    },
    {
      name: 'backend',
      testDir: './tests/backend',
      use: { 
        baseURL: 'http://127.0.0.1:3001/api/v1',
      },
    },
  ],

  // Use the already running dev server (reuseExistingServer: true)
  /*
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  */
});

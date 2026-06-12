import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        timezoneId: 'Europe/London',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
    projects: [
        {
            name: 'Desktop Chrome',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 800 },
            },
        },
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
        // Mobile Safari requires a newer macOS — uncomment when available
        // { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    ],
})

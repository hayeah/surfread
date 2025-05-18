import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Removed jsdom environment since we're using real browsers
    browser: {
      enabled: true,
      provider: 'playwright', // Using Playwright as you already have it installed
      instances: [
        { browser: 'chromium' }, // You can add more browsers like 'firefox' or 'webkit' if needed
      ],
    },
    include: ['**/*.browser.{test,spec}.{ts,tsx}'], // File pattern for browser tests
  },
});

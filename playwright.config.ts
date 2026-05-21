import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview --env test',
		port: 8787
	},
	testMatch: '**/*.e2e.{ts,js}'
});

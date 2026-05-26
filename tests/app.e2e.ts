import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('loads with search form and example links', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('input[name="package"]')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'is-number' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'left-pad' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'is-odd' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'object-assign' })).toBeVisible();
	});

	test('has powered by e18e.dev link', async ({ page }) => {
		await page.goto('/');
		const link = page.getByRole('link', { name: /e18e/i });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', /e18e\.dev/);
	});

	test('has package navigation links', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Browse all packages →' })).toHaveAttribute(
			'href',
			'/packages'
		);
		await expect(page.getByRole('link', { name: 'Scan package.json →' })).toHaveAttribute(
			'href',
			'/package-json'
		);
	});

	test('typing in search shows autocomplete suggestions', async ({ page }) => {
		await page.goto('/');
		const input = page.locator('input[name="package"]');
		await input.fill('is-n');
		await expect(page.locator('.suggestions a', { hasText: 'is-number' })).toHaveCount(2);
	});

	test('clicking an autocomplete suggestion navigates via its link', async ({ page }) => {
		await page.goto('/');
		const input = page.locator('input[name="package"]');
		await input.fill('is-n');
		await page.locator('.suggestions a', { hasText: 'is-number' }).first().click();
		await expect(page).toHaveURL(/\/is-number/);
	});

	test('clicking an example link navigates to detail page', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'is-number' }).click();
		await expect(page).toHaveURL(/\/is-number/);
	});

	test('submitting search navigates to detail page', async ({ page }) => {
		await page.goto('/');
		const input = page.locator('input[name="package"]');
		await input.fill('is-number');
		await page.getByRole('button', { name: 'Search' }).click();
		await expect(page).toHaveURL(/\/is-number/);
	});
});

test.describe('Package detail page', () => {
	test('shows replacement info for "is-number"', async ({ page }) => {
		await page.goto('/is-number');
		await expect(page.getByText('is-number', { exact: true })).toBeVisible();
		await expect(page.locator('body')).not.toContainText('not found');
	});

	test('unknown package shows not found message', async ({ page }) => {
		await page.goto('/this-package-does-not-exist-xyz');
		await expect(page.getByRole('heading')).toHaveText(
			'"this-package-does-not-exist-xyz" not found'
		);
	});

	test('known package name without a known replacement shows not found for unscoped package', async ({
		page
	}) => {
		await page.goto('/eslint');
		await expect(page.getByRole('heading')).toHaveText('"eslint" not found');
	});

	test('known package name without a known replacement shows not found for scoped package', async ({
		page
	}) => {
		await page.goto('/@eslint/eslint');
		await expect(page.getByRole('heading')).toHaveText('"@eslint/eslint" not found');
	});

	test('back link navigates home', async ({ page }) => {
		await page.goto('/is-number');
		// The back link contains "mr.e18e" text
		await page.locator('.back-link').click();
		await expect(page).toHaveURL('/');
	});
});

test.describe('Package JSON scanner', () => {
	async function paste_package_json(page: import('@playwright/test').Page, package_json: unknown) {
		const paste_dispatched = await page.evaluate((text) => {
			const data_transfer = new DataTransfer();
			data_transfer.setData('text/plain', text);
			const event = new Event('paste', { bubbles: true, cancelable: true });
			Object.defineProperty(event, 'clipboardData', {
				value: data_transfer
			});
			return window.dispatchEvent(event);
		}, JSON.stringify(package_json));

		expect(paste_dispatched).toBe(true);
	}

	async function drop_package_json(page: import('@playwright/test').Page, package_json: unknown) {
		await page.evaluate((text) => {
			const file = new File([text], 'package.json', { type: 'application/json' });
			const data_transfer = new DataTransfer();
			data_transfer.items.add(file);
			const event = new DragEvent('drop', {
				bubbles: true,
				cancelable: true,
				dataTransfer: data_transfer
			});
			window.dispatchEvent(event);
		}, JSON.stringify(package_json));
	}

	async function drag_package_json_over_window(page: import('@playwright/test').Page) {
		await page.evaluate(() => {
			const file = new File(['{}'], 'package.json', { type: 'application/json' });
			const data_transfer = new DataTransfer();
			data_transfer.items.add(file);
			const event = new DragEvent('dragenter', {
				bubbles: true,
				cancelable: true,
				dataTransfer: data_transfer
			});
			window.dispatchEvent(event);
		});
	}

	test('loads with package.json form', async ({ page }) => {
		await page.goto('/package-json');
		await expect(page.locator('input[name="package_json"]')).toBeVisible();
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await expect(page.getByText('Drag a file or')).toBeVisible();
		await expect(page.getByText('Select Here')).toBeVisible();
		await expect(page.getByText('Paste the content of your package.json')).toBeVisible();
	});

	test('finds replacements from pasted package.json dependencies', async ({ page }) => {
		await page.goto('/package-json');
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await paste_package_json(page, {
			name: 'express',
			dependencies: {
				'body-parser': '^2.2.1',
				debug: '^4.4.0',
				qs: '^6.14.2'
			}
		});

		await expect(page.getByRole('heading', { name: 'Found 3 replacements' })).toBeVisible();
		await expect(page.getByLabel('Upload package.json')).toHaveCount(0);
		await expect(
			page.getByText('Click here to scan another package.json, or paste/drop one onto this page.')
		).toBeVisible();
		await expect(page.getByRole('link', { name: /body-parser/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /debug/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /qs/ })).toBeVisible();
	});

	test('finds replacements after file upload', async ({ page }) => {
		await page.goto('/package-json');
		await page.locator('input[name="package_json"]').setInputFiles({
			name: 'package.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify({
					name: 'express',
					dependencies: {
						'body-parser': '^2.2.1'
					}
				})
			)
		});

		await expect(page.locator('input[name="package_json"]')).toHaveCount(0);
		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
	});

	test('can scan another package.json by clicking, pasting, and dropping again', async ({
		page
	}) => {
		await page.goto('/package-json');
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await paste_package_json(page, {
			name: 'express',
			dependencies: {
				'body-parser': '^2.2.1'
			}
		});

		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
		const scan_again = page.getByRole('link', { name: 'Click here' });
		await expect(scan_again).toHaveAttribute('href', '/package-json');
		await scan_again.click();
		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toHaveCount(0);
		await expect(page.getByLabel('Upload package.json')).toBeVisible();

		await page.locator('input[name="package_json"]').setInputFiles({
			name: 'package.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify({
					name: 'express',
					dependencies: {
						debug: '^4.4.0'
					}
				})
			)
		});
		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
		await expect(page.getByRole('link', { name: /debug/ })).toBeVisible();

		await paste_package_json(page, {
			name: 'clean-package',
			dependencies: {
				svelte: '^5.0.0'
			}
		});
		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await drag_package_json_over_window(page);
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await expect(
			page.getByText('Click here to scan another package.json, or paste/drop one onto this page.')
		).toHaveCount(0);

		await drop_package_json(page, {
			name: 'express',
			dependencies: {
				qs: '^6.14.2'
			}
		});
		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
		await expect(page.getByRole('link', { name: /qs/ })).toBeVisible();
	});

	test('clears previous scan results after navigating away and back', async ({ page }) => {
		await page.goto('/package-json');
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await paste_package_json(page, {
			name: 'express',
			dependencies: {
				'body-parser': '^2.2.1',
				debug: '^4.4.0',
				qs: '^6.14.2'
			}
		});

		await expect(page.getByRole('heading', { name: 'Found 3 replacements' })).toBeVisible();
		await page.goto('/');
		await page.getByRole('link', { name: 'Scan package.json →' }).click();

		await expect(page.getByRole('heading', { name: 'Found 3 replacements' })).toHaveCount(0);
		await expect(page.getByText('Paste the content of your package.json or')).toBeVisible();
	});

	test('celebrates when pasted package.json has no replacements', async ({ page }) => {
		await page.goto('/package-json');
		await expect(page.getByLabel('Upload package.json')).toBeVisible();
		await paste_package_json(page, {
			name: 'clean-package',
			dependencies: {
				svelte: '^5.0.0'
			}
		});

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'No replaceable dependencies found' })
		).toBeVisible();
		await expect(
			page.getByText(
				'No packages with native replacements or more performant alternatives were found.'
			)
		).toBeVisible();
	});

	test('shows a submit button when JavaScript is disabled but only when a file is selected', async ({
		browser
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		await page.goto('/package-json');
		await expect(page.getByRole('button', { name: 'Scan package.json' })).not.toBeVisible();

		await page.locator('input[name="package_json"]').setInputFiles({
			name: 'package.json',
			mimeType: 'application/json',
			buffer: Buffer.from(
				JSON.stringify({
					name: 'express',
					dependencies: {
						'body-parser': '^2.2.1'
					}
				})
			)
		});

		await expect(page.getByRole('button', { name: 'Scan package.json' })).toBeVisible();

		await context.close();
	});

	// the assertions in this tests depends on the mock response defined in /mocks/index.ts
	// it uses the different number of packages to assert that the path traversal logic is working correctly

	test('scans a package.json without replacements from a GitHub repository URL', async ({
		page
	}) => {
		await page.goto('/github.com/sveltejs/svelte');

		await expect(page).toHaveURL(/package-json\?owner=sveltejs&repo=svelte$/);

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'No replaceable dependencies found' })
		).toBeVisible();
		await expect(
			page.getByText(
				'No packages with native replacements or more performant alternatives were found.'
			)
		).toBeVisible();
	});

	test('scans a package.json with replacements from a GitHub repository URL', async ({ page }) => {
		await page.goto('/github.com/expressjs/express');

		await expect(page).toHaveURL(/package-json\?owner=expressjs&repo=express$/);

		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
		await expect(page.getByText('Checked 1 packages from package.json')).toBeVisible();
		await expect(page.getByRole('link', { name: /body-parser/ })).toBeVisible();
	});

	test('scans a GitHub repository URL that does not use main as its default branch', async ({
		page
	}) => {
		await page.goto('/github.com/preactjs/preact');

		await expect(page).toHaveURL(/package-json\?owner=preactjs&repo=preact$/);

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(page.getByText('Checked 1 packages from package.json')).toBeVisible();
	});

	test('scans a package.json without replacements from a GitHub package URL', async ({ page }) => {
		await page.goto('/github.com/sveltejs/svelte/tree/main/packages/svelte');

		await expect(page).toHaveURL(
			/package-json\?owner=sveltejs&repo=svelte&branch=main&path=%2Fpackages%2Fsvelte$/
		);

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(page.getByText('Checked 2 packages from package.json')).toBeVisible();
	});

	test('scans a package.json with replacements from a GitHub package URL', async ({ page }) => {
		await page.goto('/github.com/expressjs/express/tree/main/packages/router');

		await expect(page).toHaveURL(
			/package-json\?owner=expressjs&repo=express&branch=main&path=%2Fpackages%2Frouter$/
		);

		await expect(page.getByRole('heading', { name: 'Found 2 replacements' })).toBeVisible();
		await expect(page.getByText('Checked 2 packages from package.json')).toBeVisible();
		await expect(page.getByRole('link', { name: /body-parser/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /debug/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /qs/ })).toHaveCount(0);
	});

	test('falls back to root package.json without replacements from a GitHub file outside a package folder', async ({
		page
	}) => {
		await page.goto('/github.com/sveltejs/svelte/blob/main/src/index.js');

		await expect(page).toHaveURL(
			/package-json\?owner=sveltejs&repo=svelte&branch=main&path=%2Fsrc$/
		);

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(page.getByText('Checked 1 packages from package.json')).toBeVisible();
	});

	test('falls back to root package.json with replacements from a GitHub file outside a package folder', async ({
		page
	}) => {
		await page.goto('/github.com/expressjs/express/blob/main/src/index.js');

		await expect(page).toHaveURL(
			/package-json\?owner=expressjs&repo=express&branch=main&path=%2Fsrc$/
		);

		await expect(page.getByRole('heading', { name: 'Found 1 replacements' })).toBeVisible();
		await expect(page.getByText('Checked 1 packages from package.json')).toBeVisible();
		await expect(page.getByRole('link', { name: /body-parser/ })).toBeVisible();
	});

	test('scans package package.json without replacements from a GitHub file inside a package folder', async ({
		page
	}) => {
		await page.goto('/github.com/sveltejs/svelte/blob/main/packages/svelte/src/index.js');

		await expect(page).toHaveURL(
			/package-json\?owner=sveltejs&repo=svelte&branch=main&path=%2Fpackages%2Fsvelte%2Fsrc$/
		);

		await expect(
			page.getByRole('heading', { name: '🎉 Your dependencies look good!🎉' })
		).toBeVisible();
		await expect(page.getByText('Checked 4 packages from package.json')).toBeVisible();
	});

	test('scans package package.json with replacements from a GitHub file inside a package folder', async ({
		page
	}) => {
		await page.goto('/github.com/expressjs/express/blob/main/packages/router/src/index.js');

		await expect(page).toHaveURL(
			/package-json\?owner=expressjs&repo=express&branch=main&path=%2Fpackages%2Frouter%2Fsrc$/
		);

		await expect(page.getByRole('heading', { name: 'Found 3 replacements' })).toBeVisible();
		await expect(page.getByText('Checked 4 packages from package.json')).toBeVisible();
		await expect(page.getByRole('link', { name: /body-parser/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /debug/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /qs/ })).toBeVisible();
	});

	test('shows not found error when no GitHub package.json is found in the tree', async ({
		page
	}) => {
		await page.goto('/github.com/missing/package-json/blob/main/packages/app/src/index.js');

		await expect(page).toHaveURL(
			/package-json\?owner=missing&repo=package-json&branch=main&path=%2Fpackages%2Fapp%2Fsrc$/
		);

		await expect(page.getByRole('alert')).toContainText(
			'package.json not found in this GitHub repository.'
		);
	});

	test('shows invalid JSON error for a malformed GitHub package.json', async ({ page }) => {
		await page.goto('/package-json?owner=invalid&repo=package-json&branch=main');

		await expect(page.getByRole('alert')).toContainText(
			'package.json found in this GitHub repository was not valid JSON.'
		);
	});
});

test.describe('Runtime switcher', () => {
	test('defaults to Any and persists selection via cookie', async ({ page }) => {
		await page.goto('/is-number');
		const select = page.getByRole('combobox', { name: 'Runtime' });
		await expect(select).toHaveValue('any');

		await select.selectOption('bun');
		await expect(select).toHaveValue('bun');

		const cookies = await page.context().cookies();
		expect(cookies.find((c) => c.name === 'runtime')?.value).toBe('bun');

		await page.reload();
		await expect(page.getByRole('combobox', { name: 'Runtime' })).toHaveValue('bun');
	});

	test('filters replacements on detail page when switching runtime', async ({ page }) => {
		// buffer-from has a node-only replacement
		await page.goto('/buffer-from');
		const comment = page.locator('.replacements > .comment');
		await expect(comment).toHaveText('// replacements (1)');

		await page.getByRole('combobox', { name: 'Runtime' }).selectOption('browser');
		await expect(comment).toHaveText('// replacements (0 of 1)');
		await expect(page.getByText(/No replacements match the/)).toBeVisible();
	});
});

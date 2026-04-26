import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('loads with search form and example links', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('combobox', { name: 'Package name' })).toBeVisible();
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

	test('typing in search shows autocomplete suggestions', async ({ page }) => {
		await page.goto('/');
		const input = page.getByRole('combobox', { name: 'Package name' });
		await input.fill('is-n');
		await expect(page.getByRole('option', { name: /is-number/ })).toHaveCount(2);
	});

	test('clicking an example link navigates to detail page', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'is-number' }).click();
		await expect(page).toHaveURL(/\/is-number/);
	});

	test('submitting search navigates to detail page', async ({ page }) => {
		await page.goto('/');
		const input = page.getByRole('combobox', { name: 'Package name' });
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

	test('back link navigates home', async ({ page }) => {
		await page.goto('/is-number');
		// The back link contains "mr.e18e" text
		await page.locator('.back-link').click();
		await expect(page).toHaveURL('/');
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

import { render } from 'vitest-browser-svelte';
import { expect, test, vi, beforeEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Autocomplete from './Autocomplete.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

const items = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'];
const get_item_href = (item: string) => `/packages/${item}`;

test('renders an input', () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	expect(input.element()).toBeTruthy();
});

test('typing filters and shows suggestions', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('link', { name: 'apple' })).toBeVisible();
	await expect.element(page.getByRole('link', { name: 'apricot' })).toBeVisible();
	expect(page.getByRole('link').elements()).toHaveLength(2);
});

test('ArrowDown/ArrowUp keyboard navigation', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('b');
	await expect.element(page.getByRole('link', { name: 'banana' })).toBeVisible();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(page.getByRole('link', { name: 'banana' })).toHaveClass(/active/);
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(page.getByRole('link', { name: 'blueberry' })).toHaveClass(/active/);
	await userEvent.keyboard('{ArrowUp}');
	await expect.element(page.getByRole('link', { name: 'banana' })).toHaveClass(/active/);
});

test('Enter calls onSelectNavigateTo with the active item', async () => {
	const on_select_navigate_to = vi.fn();
	render(Autocomplete, {
		items,
		get_item_href,
		on_select_navigate_to: on_select_navigate_to
	});
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('ch');
	await expect.element(page.getByRole('link', { name: 'cherry' })).toBeVisible();
	await userEvent.keyboard('{ArrowDown}');
	await userEvent.keyboard('{Enter}');
	expect(on_select_navigate_to).toHaveBeenCalledWith('cherry');
});

test('Escape closes the dropdown', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('link', { name: 'apple' })).toBeVisible();
	await userEvent.keyboard('{Escape}');
	expect(page.getByRole('link').elements()).toHaveLength(0);
});

test('exact match does not hide dropdown', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('cherry');
	expect(page.getByRole('link').elements()).toHaveLength(1);
});

test('clicking a suggestion uses a real link', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('bl');
	await expect
		.element(page.getByRole('link', { name: 'blueberry' }))
		.toHaveAttribute('href', '/packages/blueberry');
});

test('suggestions render real links', async () => {
	render(Autocomplete, { items, get_item_href, on_select_navigate_to: vi.fn() });
	const input = page.getByRole('textbox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect
		.element(page.getByRole('link', { name: 'apple' }))
		.toHaveAttribute('href', '/packages/apple');
});

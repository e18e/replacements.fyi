import { render } from 'vitest-browser-svelte';
import { expect, test, vi, beforeEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Autocomplete from './Autocomplete.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

const items = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'];

test('renders an input with combobox role', () => {
	render(Autocomplete, { items, onSelectNavigateTo: vi.fn() });
	const input = page.getByRole('combobox');
	expect(input.element()).toBeTruthy();
});

test('typing filters and shows suggestions', async () => {
	render(Autocomplete, { items, onSelectNavigateTo: vi.fn() });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await expect.element(page.getByRole('option', { name: 'apple' })).toBeVisible();
	await expect.element(page.getByRole('option', { name: 'apricot' })).toBeVisible();
	expect(page.getByRole('option').elements()).toHaveLength(2);
});

test('ArrowDown/ArrowUp keyboard navigation', async () => {
	render(Autocomplete, { items, onSelectNavigateTo: vi.fn() });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('b');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.keyboard('{ArrowDown}');
	await expect
		.element(page.getByRole('option', { name: 'banana' }))
		.toHaveAttribute('aria-selected', 'true');
	await userEvent.keyboard('{ArrowDown}');
	await expect
		.element(page.getByRole('option', { name: 'blueberry' }))
		.toHaveAttribute('aria-selected', 'true');
	await userEvent.keyboard('{ArrowUp}');
	await expect
		.element(page.getByRole('option', { name: 'banana' }))
		.toHaveAttribute('aria-selected', 'true');
});

test('Enter calls onSelectNavigateTo with the active item', async () => {
	const onSelectNavigateTo = vi.fn();
	render(Autocomplete, { items, onSelectNavigateTo });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ch');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.keyboard('{ArrowDown}');
	await userEvent.keyboard('{Enter}');
	expect(onSelectNavigateTo).toHaveBeenCalledWith('cherry');
});

test('Escape closes the dropdown', async () => {
	render(Autocomplete, { items, onSelectNavigateTo: vi.fn() });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.keyboard('{Escape}');
	expect(page.getByRole('listbox').elements()).toHaveLength(0);
});

test('exact match does not hide dropdown', async () => {
	render(Autocomplete, { items, onSelectNavigateTo: vi.fn() });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('cherry');
	expect(page.getByRole('listbox').elements()).toHaveLength(1);
});

test('clicking a suggestion calls onSelectNavigateTo with the item', async () => {
	const onSelectNavigateTo = vi.fn();
	render(Autocomplete, { items, onSelectNavigateTo });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('bl');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.click(page.getByRole('option', { name: 'blueberry' }));
	expect(onSelectNavigateTo).toHaveBeenCalledWith('blueberry');
});

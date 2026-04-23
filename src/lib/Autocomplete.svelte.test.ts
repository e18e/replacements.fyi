import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import Autocomplete from './Autocomplete.svelte';

const items = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'];

test('renders an input with combobox role', () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	expect(input.element()).toBeTruthy();
});

test('typing filters and shows suggestions', async () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await expect.element(page.getByRole('option', { name: 'apple' })).toBeVisible();
	await expect.element(page.getByRole('option', { name: 'apricot' })).toBeVisible();
	expect(page.getByRole('option').elements()).toHaveLength(2);
});

test('ArrowDown/ArrowUp keyboard navigation', async () => {
	render(Autocomplete, { items });
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

test('Enter selects the active item', async () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ch');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.keyboard('{ArrowDown}');
	await userEvent.keyboard('{Enter}');
	await expect.element(input).toHaveValue('cherry');
});

test('Escape closes the dropdown', async () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('ap');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.keyboard('{Escape}');
	expect(page.getByRole('listbox').elements()).toHaveLength(0);
});

test('exact match does not hide dropdown', async () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('cherry');
	expect(page.getByRole('listbox').elements()).toHaveLength(1);
});

test('clicking a suggestion selects it', async () => {
	render(Autocomplete, { items });
	const input = page.getByRole('combobox');
	await userEvent.click(input);
	await userEvent.keyboard('bl');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.click(page.getByRole('option', { name: 'blueberry' }));
	await expect.element(input).toHaveValue('blueberry');
});

import { describe, expect, test } from 'vitest';
import { get_github_info } from './utils';

function search_params_to_object(search_params: URLSearchParams | null) {
	return Object.fromEntries(search_params ?? []);
}

describe('get_github_info', () => {
	test('parses repository URLs', () => {
		expect(search_params_to_object(get_github_info('sveltejs/svelte'))).toEqual({
			owner: 'sveltejs',
			repo: 'svelte'
		});
	});

	test('parses tree URLs with paths', () => {
		expect(
			search_params_to_object(get_github_info('sveltejs/svelte/tree/main/packages/svelte'))
		).toEqual({
			owner: 'sveltejs',
			repo: 'svelte',
			branch: 'main',
			path: '/packages/svelte'
		});
	});

	test('parses blob package.json URLs as their containing folder', () => {
		expect(
			search_params_to_object(
				get_github_info('sveltejs/svelte/blob/main/packages/svelte/package.json')
			)
		).toEqual({
			owner: 'sveltejs',
			repo: 'svelte',
			branch: 'main',
			path: '/packages/svelte'
		});
	});

	test('parses blob file URLs as their containing folder', () => {
		expect(
			search_params_to_object(
				get_github_info('sveltejs/svelte/blob/main/packages/svelte/src/index.js')
			)
		).toEqual({
			owner: 'sveltejs',
			repo: 'svelte',
			branch: 'main',
			path: '/packages/svelte/src'
		});
	});

	test('parses root blob package.json URLs as the repository root', () => {
		expect(
			search_params_to_object(get_github_info('sveltejs/svelte/blob/main/package.json'))
		).toEqual({
			owner: 'sveltejs',
			repo: 'svelte',
			branch: 'main'
		});
	});
});

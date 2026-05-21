import { all } from 'module-replacements';
import { expect, test } from 'vitest';

import { eval_package_json } from './package-json-scan';

test('returns an error for invalid JSON', () => {
	expect(eval_package_json('{ "dependencies": {')).toEqual({
		success: false,
		error: 'File was not valid JSON.'
	});
});

test('returns an error when the file is not a JSON object', () => {
	expect(eval_package_json('[]')).toEqual({
		success: false,
		error: 'File was an invalid format (not an object).'
	});
});

test('returns an error when dependencies are missing', () => {
	expect(eval_package_json(JSON.stringify({ name: 'empty-package' }))).toEqual({
		success: false,
		error: 'No dependencies or devDependencies found.'
	});
});

test('returns an error when dependencies are not objects', () => {
	expect(
		eval_package_json(
			JSON.stringify({
				dependencies: 'debug'
			})
		)
	).toEqual({
		success: false,
		error: 'dependencies and devDependencies must be objects.'
	});
});

test('finds replacements from dependencies and devDependencies', () => {
	const result = eval_package_json(
		JSON.stringify({
			dependencies: {
				debug: '^4.4.0',
				svelte: '^5.0.0'
			},
			devDependencies: {
				qs: '^6.14.2',
				vitest: '^4.1.3'
			}
		})
	);

	expect(result).toEqual({
		success: true,
		checked: 4,
		replacements: expect.arrayContaining([
			{ dep: 'debug', replacement: all.mappings.debug },
			{ dep: 'qs', replacement: all.mappings.qs }
		])
	});
});

test('returns an empty replacement list when no replacements are found', () => {
	expect(
		eval_package_json(
			JSON.stringify({
				dependencies: {
					svelte: '^5.0.0'
				}
			})
		)
	).toEqual({
		success: true,
		checked: 1,
		replacements: []
	});
});

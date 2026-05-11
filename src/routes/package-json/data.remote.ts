import * as v from 'valibot';
import { command, form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { all } from 'module-replacements';
import type { ModuleReplacementMapping } from 'module-replacements';

const package_json_schema = v.pipe(
	v.file('Please select a package.json file.'),
	v.mimeType(['application/json'], 'Only valid JSON files are accepted.'),
	v.maxSize(1024 * 1024 * 10, 'Please select a file smaller than 10 MB.')
);

function is_record(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type PackageJsonScanResult =
	| { success: false; error: string }
	| {
			success: true;
			checked: number;
			replacements: {
				dep: string;
				replacement: ModuleReplacementMapping;
			}[];
	  };

function eval_package_json(package_json_string: string): PackageJsonScanResult {
	let parsed_json: unknown;
	try {
		parsed_json = JSON.parse(package_json_string);
	} catch {
		return { success: false, error: 'File was not valid JSON.' };
	}

	if (!is_record(parsed_json)) {
		return { success: false, error: 'File was an invalid format (not an object).' };
	}

	if (!parsed_json['devDependencies'] && !parsed_json['dependencies']) {
		return { success: false, error: 'No dependencies or devDependencies found.' };
	}

	const dev_deps = parsed_json['devDependencies'] ?? {};
	const prod_deps = parsed_json['dependencies'] ?? {};

	if (!is_record(dev_deps) || !is_record(prod_deps)) {
		return { success: false, error: 'dependencies and devDependencies must be objects.' };
	}

	const replacements = [];
	for (const mapping of Object.keys(all.mappings)) {
		const match = dev_deps[mapping] ?? prod_deps[mapping];
		if (match) {
			replacements.push({
				dep: mapping,
				replacement: all.mappings[mapping]
			});
		}
	}

	return {
		success: true,
		checked: Object.keys(dev_deps).length + Object.keys(prod_deps).length,
		replacements
	};
}

export const scan_package_json = form(
	v.object({
		package_json: package_json_schema
	}),
	async ({ package_json }, issue) => {
		const result = eval_package_json(await package_json.text());

		if (!result.success) {
			invalid(issue.package_json(result.error));
		}

		return result;
	}
);

export const scan_package_json_paste = command(
	v.object({
		package_json: v.string()
	}),
	async ({ package_json }) => {
		const result = eval_package_json(package_json);

		if (!result.success) {
			return { success: false, error: result.error };
		}

		return {
			success: true,
			checked: result.checked,
			replacements: result.replacements
		};
	}
);

import * as v from 'valibot';
import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { all } from 'module-replacements';

const package_json_schema = v.pipe(
	v.file('Please select a package.json file.'),
	v.mimeType(['application/json'], 'Only valid JSON files are accepted.'),
	v.maxSize(1024 * 1024 * 10, 'Please select a file smaller than 10 MB.')
);

function is_record(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const scan_package_json = form(
	v.object({
		package_json: package_json_schema
	}),
	async ({ package_json }, issue) => {
		let parsed_json: unknown;
		try {
			parsed_json = JSON.parse(await package_json.text());
		} catch {
			invalid(issue.package_json('File was not valid JSON.'));
		}

		if (!is_record(parsed_json)) {
			invalid(issue.package_json('File was an invalid format (not an object).'));
		}

		if (!parsed_json['devDependencies'] && !parsed_json['dependencies']) {
			invalid(issue.package_json('No dependencies or devDependencies found.'));
		}

		const dev_deps = parsed_json['devDependencies'] ?? {};
		const prod_deps = parsed_json['dependencies'] ?? {};

		if (!is_record(dev_deps) || !is_record(prod_deps)) {
			invalid(issue.package_json('dependencies and devDependencies must be objects.'));
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
);

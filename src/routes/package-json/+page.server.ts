import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { all } from 'module-replacements';
export const prerender = false;

function is_record(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const package_json = data.get('package_json');

		if (!package_json) {
			return fail(400, { package_json, error: 'Paste a package.json file to scan.' });
		}

		let parsed_json: unknown;
		try {
			parsed_json = JSON.parse(package_json.toString());
		} catch {
			return fail(400, { package_json, error: 'This is not valid JSON.' });
		}

		if (!is_record(parsed_json)) {
			return fail(400, {
				package_json,
				error: 'dependencies and devDependencies must be objects.'
			});
		}

		if (!parsed_json['devDependencies'] && !parsed_json['dependencies']) {
			return fail(400, {
				package_json,
				error: 'No dependencies or devDependencies found.'
			});
		}

		const dev_deps = parsed_json['devDependencies'] ?? {};
		const prod_deps = parsed_json['dependencies'] ?? {};

		if (!is_record(dev_deps) || !is_record(prod_deps)) {
			return fail(400, {
				package_json,
				error: 'dependencies and devDependencies must be objects.'
			});
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
} satisfies Actions;

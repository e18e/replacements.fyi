import * as v from 'valibot';
import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { eval_package_json } from '$lib/package-json-scan';

const package_json_schema = v.pipe(
	v.file('Please select a package.json file.'),
	v.mimeType(['application/json'], 'Only valid JSON files are accepted.'),
	v.maxSize(1024 * 1024 * 10, 'Please select a file smaller than 10 MB.')
);

export const scan_package_json_file = form(
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

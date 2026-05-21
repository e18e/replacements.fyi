import { all } from 'module-replacements';
import type { ModuleReplacementMapping } from 'module-replacements';

function is_record(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type PackageJSONScanSuccessResult = {
	success: true;
	checked: number;
	replacements: {
		dep: string;
		replacement: ModuleReplacementMapping;
	}[];
};

export type PackageJsonScanResult =
	| { success: false; error: string }
	| PackageJSONScanSuccessResult;

export function eval_package_json(package_json_string: string): PackageJsonScanResult {
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

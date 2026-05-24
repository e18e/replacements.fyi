import { error } from '@sveltejs/kit';
import { all } from 'module-replacements';

export const prerender = 'auto';

export function load({ params }) {
	const package_name = `${params.scope ? `${params.scope}/` : ''}${params.package}`;
	if (!Object.hasOwn(all.mappings, package_name)) {
		error(404, { message: `"${package_name}" not found`, package_name });
	}
}

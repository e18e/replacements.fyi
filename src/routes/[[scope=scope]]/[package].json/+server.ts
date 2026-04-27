import { all } from 'module-replacements';
import { error, json } from '@sveltejs/kit';

export const prerender = true;

export function GET({ params: { package: name, scope } }) {
	const full = `${scope ? `${scope}/` : ''}${name}`;
	if (!Object.hasOwn(all.mappings, full)) {
		throw error(404, `No replacement found for "${full}"`);
	}
	const mapping = all.mappings[full];

	const replacements = mapping.replacements.map((key) => all.replacements[key]);

	return json({
		name: mapping.moduleName,
		type: mapping.type,
		url: mapping.url,
		replacements
	});
}

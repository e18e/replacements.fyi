import { all } from 'module-replacements';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ params }) => {
	const full = `${params.scope}/${params.name}`;
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
};

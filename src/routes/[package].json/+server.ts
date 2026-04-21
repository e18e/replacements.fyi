import { all } from 'module-replacements';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ params }) => {
	const name = params.package;
	if (!name || !Object.hasOwn(all.mappings, name)) {
		throw error(404, `No replacement found for "${name}"`);
	}
	const mapping = all.mappings[name];

	const replacements = mapping.replacements.map((key) => all.replacements[key]);

	return json({
		name: mapping.moduleName,
		type: mapping.type,
		url: mapping.url,
		replacements
	});
};

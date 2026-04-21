import { all } from 'module-replacements';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const origin = url.origin;
	const names = Object.keys(all.mappings).sort();

	const lines = [
		'# replacements.fyi',
		'',
		'> Find more performant and safer replacements for outdated or unnecessary npm packages.',
		'',
		'Each known package has a human-readable page and a machine-readable JSON equivalent:',
		'',
		`- HTML: ${origin}/<package>`,
		`- JSON: ${origin}/<package>.json`,
		'',
		'The JSON response shape is `{ name, type, url?, replacements: [...] }`, where each',
		'replacement has a `type` (`native`, `simple`, `documented`, or `removal`) and',
		'type-specific fields (e.g. `description`, `example`, `replacementModule`, `url`).',
		'',
		'## packages',
		'',
		...names.map((name) => {
			const html = `${origin}/${encodeURIComponent(name)}`;
			const jsonPath = name.startsWith('@')
				? `${origin}/${name}.json`
				: `${origin}/${encodeURIComponent(name)}.json`;
			return `- [${name}](${html}) ([json](${jsonPath}))`;
		}),
		''
	];

	return new Response(lines.join('\n'), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
};

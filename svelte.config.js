import adapter from '@sveltejs/adapter-static';
import { all } from 'module-replacements';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
		experimental: { async: true }
	},
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		experimental: { remoteFunctions: true },
		prerender: {
			origin: 'https://replacements.fyi',
			entries: [
				'/llms.txt',
				...Object.keys(all.mappings).flatMap((key) => [`/${key}`, `/${key}.json`])
			]
		}
	}
};

export default config;

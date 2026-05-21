import { createMultiMatcher } from '@remix-run/route-pattern/match';

export const matcher =
	createMultiMatcher<(options: Record<string, string | undefined>) => Response>();

const packages: Record<string, Record<string, unknown>> = {
	'preactjs/preact/package.json': {
		name: 'preact',
		dependencies: {
			'@preact/signals': '^2.0.0'
		}
	},
	'sveltejs/svelte/package.json': {
		name: 'svelte',
		dependencies: {
			'magic-string': '^2.0.0'
		}
	},
	'sveltejs/svelte/packages/package.json': {
		name: 'svelte-packages-folder',
		dependencies: {
			'@sveltejs/adapter-auto': '^7.0.0',
			'@sveltejs/kit': '^2.0.0',
			'@sveltejs/vite-plugin-svelte': '^7.0.0'
		}
	},
	'sveltejs/svelte/packages/svelte/package.json': {
		name: 'svelte-package',
		dependencies: {
			'@sveltejs/package': '^2.0.0',
			vite: '^8.0.0'
		}
	},
	'sveltejs/svelte/packages/svelte/src/package.json': {
		name: 'svelte-src-folder',
		dependencies: {
			'@sveltejs/acorn-typescript': '^1.0.0',
			esrap: '^2.0.0',
			zimmerframe: '^1.0.0',
			clsx: '^2.0.0'
		}
	},
	'expressjs/express/package.json': {
		name: 'express',
		dependencies: {
			'body-parser': '^2.2.1'
		}
	},
	'expressjs/express/packages/package.json': {
		name: 'express-packages-folder',
		dependencies: {
			debug: '^4.4.0',
			qs: '^6.14.2',
			'body-parser': '^2.2.1'
		}
	},
	'expressjs/express/packages/router/package.json': {
		name: 'express-router',
		dependencies: {
			'body-parser': '^2.2.1',
			debug: '^4.4.0'
		}
	},
	'expressjs/express/packages/router/src/package.json': {
		name: 'express-router-src',
		dependencies: {
			'body-parser': '^2.2.1',
			debug: '^4.4.0',
			qs: '^6.14.2',
			depd: '^2.0.0'
		}
	}
};

const repo_default_branches: Record<string, string> = {
	'preactjs/preact': 'master',
	'sveltejs/svelte': 'main',
	'expressjs/express': 'main'
};

matcher.add('https://api.github.com/repos/:owner/:repo', (params) => {
	const default_branch = repo_default_branches[`${params.owner}/${params.repo}`];
	if (default_branch) return Response.json({ default_branch });

	return new Response('Not found', { status: 404 });
});

matcher.add('https://raw.githubusercontent.com/:owner/:repo/:branch/*path', (params) => {
	const package_json = packages[`${params.owner}/${params.repo}/${params.path}`];
	if (package_json) return new Response(JSON.stringify(package_json));

	return new Response('Not found', { status: 404 });
});

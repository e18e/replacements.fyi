import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import { all, nativeReplacements } from 'module-replacements';
import { format } from 'prettier';
import * as prettier_estree from 'prettier/plugins/estree';
import * as prettier_typescript from 'prettier/plugins/typescript';
import { codeToHtml } from 'shiki';
import * as v from 'valibot';

const PRINT_WIDTH = 50;

async function highlight(code: string) {
	// let's format the code with prettier so we don't end up with ugly overflows
	const formatted = await format(code, {
		parser: 'typescript',
		plugins: [prettier_estree, prettier_typescript],
		printWidth: PRINT_WIDTH,
		useTabs: true,
		singleQuote: true,
		semi: true
	});
	return codeToHtml(formatted.trim(), {
		lang: 'typescript',
		themes: {
			light: 'github-light',
			dark: 'github-dark'
		}
	});
}

export const get_package = prerender(
	v.string(),
	async (package_name) => {
		if (!Object.hasOwn(all.mappings, package_name)) {
			error(404, 'Not found');
		}
		const mapping = all.mappings[package_name];

		const resolved_replacements = await Promise.all(
			mapping.replacements.map(async (key) => {
				const data = all.replacements[key];
				return {
					key,
					data,
					in_native_manifest: key in nativeReplacements.replacements,
					highlighted_example:
						data.type === 'simple' && data.example ? await highlight(data.example) : null
				};
			})
		);

		return { mapping, resolved_replacements };
	},
	{
		inputs() {
			return Object.keys(all.mappings);
		}
	}
);

import { prerender } from '$app/server';
import { all } from 'module-replacements';
import { format } from 'prettier';
import * as prettier_estree from 'prettier/plugins/estree';
import * as prettier_typescript from 'prettier/plugins/typescript';
import { codeToHtml } from 'shiki';
import * as v from 'valibot';

const PRINT_WIDTH = 50;

export const highlight = prerender(
	v.string(),
	async (code) => {
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
	},
	{
		inputs() {
			// the input of this prerendered function is all the examples in the module replacements package
			return Object.values(all.mappings).flatMap((value) => {
				return value.replacements.reduce<string[]>((arr, replacement) => {
					const replacement_obj = all.replacements[replacement];
					if (replacement_obj.type === 'simple' && replacement_obj.example) {
						arr.push(replacement_obj.example);
					}
					return arr;
				}, []);
			});
		}
	}
);

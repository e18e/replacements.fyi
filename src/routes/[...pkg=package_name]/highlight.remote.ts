import { prerender } from '$app/server';
import * as v from 'valibot';
import { codeToHtml } from 'shiki';
import { format } from 'prettier';

const PRINT_WIDTH = 50;

export const highlight = prerender(v.string(), async (code) => {
	// let's format the code with prettier so we don't end up with ugly overflows
	const formatted = await format(code, {
		parser: 'typescript',
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
});

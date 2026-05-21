import type { ParamMatcher } from '@sveltejs/kit';

/**
 * super simple param matcher to match both github and github.com
 * to allow the user to easily prepone replacements.fyi in a repo
 * to scan the package.json
 */
export const match: ParamMatcher = (param) => {
	return /^github(?:\.com)?$/.test(param);
};

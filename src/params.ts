import { defineParams } from '@sveltejs/kit/params';
import { all } from 'module-replacements';

/**
 * super simple param matcher to match both github and github.com
 * to allow the user to easily prepone replacements.fyi in a repo
 * to scan the package.json
 */
function match_github(param: string) {
	return /^github(?:\.com)?$/.test(param);
}

// the client router only runs `decodeURI` on the pathname before matching, which leaves reserved
// characters like `@` encoded, so scoped packages reach the matcher as `%40scope/name`
function match_package_name(param: string) {
	try {
		return Object.hasOwn(all.mappings, decodeURIComponent(param));
	} catch {
		return false;
	}
}

function match_scope(value: string) {
	return value.startsWith('@') || value.startsWith('%40');
}

export const params = defineParams({
	github: (param) => (match_github(param) ? param : undefined),
	package_name: (param) => (match_package_name(param) ? param : undefined),
	scope: (param) => (match_scope(param) ? param : undefined)
});

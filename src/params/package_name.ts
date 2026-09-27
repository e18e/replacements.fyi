import type { ParamMatcher } from '@sveltejs/kit';
import { all } from 'module-replacements';

// the client router only runs `decodeURI` on the pathname before matching, which leaves reserved
// characters like `@` encoded, so scoped packages reach the matcher as `%40scope/name`
export const match: ParamMatcher = (param) => {
	try {
		return Object.hasOwn(all.mappings, decodeURIComponent(param));
	} catch {
		return false;
	}
};

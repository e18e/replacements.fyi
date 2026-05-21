export function scopify(pkg: string) {
	if (pkg.startsWith('@')) {
		const [scope, name] = pkg.split('/');
		return { scope, package: name };
	} else {
		return { scope: undefined, package: pkg };
	}
}

export const github_regex =
	/(?<owner>[^/]+)\/(?<repo>[^/]+)\/?(?:(?<type>tree|blob)\/(?<branch>[^/]+))?(?<path>\/.*)?/;

function normalize_github_path(
	path: string | undefined,
	type: string | undefined
): string | undefined {
	if (!path) return undefined;

	if (type === 'blob') {
		return path.slice(0, path.lastIndexOf('/')) || undefined;
	}

	return path;
}

export function get_github_info(value: string): URLSearchParams | null {
	const info = value.match(github_regex)?.groups;
	if (!info) return null;
	const { owner, repo, type, branch, path: raw_path } = info;
	const path = normalize_github_path(raw_path, type);
	// we need to filter out undefined keys or else the search params will contain the string "undefined" for optional values that are not provided
	const search_params = new URLSearchParams(
		Object.fromEntries(
			Object.entries({ owner, repo, branch, path }).filter(
				([, value]) => value != undefined
			) as Array<[string, string]>
		)
	);
	return search_params;
}

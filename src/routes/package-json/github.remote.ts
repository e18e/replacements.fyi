import { query } from '$app/server';
import * as v from 'valibot';

const github_info_schema = v.object({
	owner: v.string(),
	repo: v.string(),
	branch: v.optional(v.string()),
	path: v.optional(v.string())
});

function get_package_json_paths(path: string | undefined) {
	const package_json_paths = [];
	const trimmed_path = path?.trim().replace(/^\/+|\/+$/g, '');

	if (trimmed_path?.endsWith('/package.json')) {
		package_json_paths.push(trimmed_path);
	} else if (trimmed_path) {
		const path_parts = trimmed_path.split('/');
		package_json_paths.push(
			...path_parts.map(
				(_, index) => `${path_parts.slice(0, path_parts.length - index).join('/')}/package.json`
			)
		);
	}

	package_json_paths.push('package.json');
	return package_json_paths;
}

async function fetch_package_json(
	owner: string,
	repo: string,
	branch: string,
	path: string
): Promise<string | null> {
	const response = await fetch(
		`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
	);

	if (!response.ok) return null;

	return response.text();
}

export const get_repo_package_json = query(github_info_schema, async (github_info) => {
	const branch = github_info.branch ?? 'main';
	const repo_package_paths = get_package_json_paths(github_info.path);

	for (const repo_package_path of repo_package_paths) {
		// we go up the tree until we find a package.json
		const package_json = await fetch_package_json(
			github_info.owner,
			github_info.repo,
			branch,
			repo_package_path
		);

		if (package_json) return package_json;
	}
	// if no package.json is found we return an empty string so the client shows the not valid JSON UI
	return '';
});

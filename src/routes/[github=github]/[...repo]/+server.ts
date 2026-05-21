import { get_github_info } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export const prerender = false;

export function GET({ params: { repo } }) {
	const github_info = get_github_info(repo);
	if (!github_info) {
		return new Response('Invalid repository format', { status: 400 });
	}
	redirect(303, `/package-json?${github_info}`);
}

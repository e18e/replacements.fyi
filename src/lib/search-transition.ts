import type { Navigation } from '@sveltejs/kit';

export function is_search_bar_morph({ from, to }: Navigation): boolean {
	const from_home = from?.route?.id === '/';
	const to_home = to?.route?.id === '/';
	return from_home !== to_home;
}

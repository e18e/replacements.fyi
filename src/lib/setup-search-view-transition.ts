import { browser } from '$app/environment';
import { onNavigate } from '$app/navigation';
import { is_search_bar_morph } from '$lib/search-transition';

// Search-bar morph on home ↔ inner pages is inspired by npmx.dev:
// https://github.com/npmx-dev/npmx.dev/blob/master/app/plugins/view-transitions.client.ts
// https://github.com/npmx-dev/npmx.dev/blob/master/app/assets/main.css
export function setup_search_view_transition() {
	if (!browser || !document.startViewTransition) return;

	onNavigate((navigation) => {
		if (!is_search_bar_morph(navigation)) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
}

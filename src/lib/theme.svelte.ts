export type ThemePref = 'light' | 'dark' | 'system';

function read_cookie(): ThemePref {
	if (typeof document === 'undefined') return 'system';
	const match = document.cookie.match(/(?:^|;\s*)theme=(light|dark|system)/);
	return (match?.[1] as ThemePref) ?? 'system';
}

class Theme {
	pref = $state<ThemePref>(read_cookie());

	set(pref: ThemePref) {
		this.pref = pref;
		if (typeof document === 'undefined') return;
		document.cookie = `theme=${pref}; path=/; max-age=31536000; samesite=lax`;
		if (pref === 'system') {
			delete document.documentElement.dataset.theme;
		} else {
			document.documentElement.dataset.theme = pref;
		}
	}
}

export const theme = new Theme();

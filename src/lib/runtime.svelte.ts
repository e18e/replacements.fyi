export type Runtime = 'any' | 'nodejs' | 'bun' | 'deno' | 'cloudflare' | 'browser';

export const runtimes: { value: Runtime; label: string }[] = [
	{ value: 'any', label: 'Any' },
	{ value: 'nodejs', label: 'Node' },
	{ value: 'bun', label: 'Bun' },
	{ value: 'deno', label: 'Deno' },
	{ value: 'cloudflare', label: 'Cloudflare' },
	{ value: 'browser', label: 'Browser' }
];

const cookie_re = new RegExp(`(?:^|;\\s*)runtime=(${runtimes.map((r) => r.value).join('|')})`);

function read_cookie(): Runtime {
	if (typeof document === 'undefined') return 'any';
	const match = document.cookie.match(cookie_re);
	return (match?.[1] as Runtime) ?? 'any';
}

class RuntimeStore {
	pref = $state<Runtime>(read_cookie());

	set(pref: Runtime) {
		this.pref = pref;
		if (typeof document === 'undefined') return;
		document.cookie = `runtime=${pref}; path=/; max-age=31536000; samesite=lax`;
	}
}

export const runtime = new RuntimeStore();

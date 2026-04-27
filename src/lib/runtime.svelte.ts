export type Runtime = 'any' | 'nodejs' | 'bun' | 'deno' | 'cloudflare' | 'browser';
export type BrowserEngine =
	| 'chrome'
	| 'firefox'
	| 'safari'
	| 'edge'
	| 'safari_ios'
	| 'chrome_android'
	| 'firefox_android'
	| 'webview_android'
	| 'webview_ios'
	| 'samsunginternet_android'
	| 'opera'
	| 'opera_android';

export const runtimes: { value: Runtime; label: string }[] = [
	{ value: 'any', label: 'Any' },
	{ value: 'nodejs', label: 'Node' },
	{ value: 'bun', label: 'Bun' },
	{ value: 'deno', label: 'Deno' },
	{ value: 'cloudflare', label: 'Cloudflare' },
	{ value: 'browser', label: 'Browser' }
];

export const browser_engine_options: { value: BrowserEngine; label: string }[] = [
	{ value: 'chrome', label: 'Chrome' },
	{ value: 'firefox', label: 'Firefox' },
	{ value: 'safari', label: 'Safari' },
	{ value: 'edge', label: 'Edge' },
	{ value: 'safari_ios', label: 'Safari iOS' },
	{ value: 'chrome_android', label: 'Chrome Android' },
	{ value: 'firefox_android', label: 'Firefox Android' },
	{ value: 'webview_android', label: 'WebView Android' },
	{ value: 'webview_ios', label: 'WebView iOS' },
	{ value: 'samsunginternet_android', label: 'Samsung Internet Android' },
	{ value: 'opera', label: 'Opera' },
	{ value: 'opera_android', label: 'Opera Android' }
];

const browser_engine_set = new Set(browser_engine_options.map((item) => item.value));
const cookie_re = new RegExp(`(?:^|;\\s*)runtime=(${runtimes.map((r) => r.value).join('|')})`);
const browser_cookie_re = new RegExp(
	`(?:^|;\\s*)browserEngine=(${browser_engine_options.map((opt) => opt.value).join('|')})`
);
const version_cookie_re = /(?:^|;\s*)minVersion=([^;]+)/;

function read_cookie(): Runtime {
	if (typeof document === 'undefined') return 'any';
	const match = document.cookie.match(cookie_re);
	return (match?.[1] as Runtime) ?? 'any';
}

function read_browser_engine_cookie(): BrowserEngine {
	if (typeof document === 'undefined') return 'chrome';
	const match = document.cookie.match(browser_cookie_re);
	const value = match?.[1] as BrowserEngine | undefined;
	return value && browser_engine_set.has(value) ? value : 'chrome';
}

function read_min_version_cookie(): string {
	if (typeof document === 'undefined') return '';
	const match = document.cookie.match(version_cookie_re);
	if (!match?.[1]) return '';
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return '';
	}
}

class RuntimeStore {
	pref = $state<Runtime>(read_cookie());
	browserEngine = $state<BrowserEngine>(read_browser_engine_cookie());
	minVersion = $state<string>(read_min_version_cookie());

	set(pref: Runtime) {
		this.pref = pref;
		this.persist_runtime();
	}

	set_browser_engine(engine: BrowserEngine) {
		this.browserEngine = engine;
		if (typeof document === 'undefined') return;
		document.cookie = `browserEngine=${engine}; path=/; max-age=31536000; samesite=lax`;
	}

	set_min_version(value: string) {
		this.minVersion = value.trim();
		if (typeof document === 'undefined') return;
		document.cookie = `minVersion=${encodeURIComponent(this.minVersion)}; path=/; max-age=31536000; samesite=lax`;
	}

	private persist_runtime() {
		if (typeof document === 'undefined') return;
		document.cookie = `runtime=${this.pref}; path=/; max-age=31536000; samesite=lax`;
	}
}

export const runtime = new RuntimeStore();

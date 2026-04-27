import type { EngineConstraint } from 'module-replacements';
import type { Runtime } from './runtime.svelte';

export const browser_engines = [
	'chrome',
	'firefox',
	'safari',
	'edge',
	'safari_ios',
	'chrome_android',
	'firefox_android',
	'webview_android',
	'webview_ios',
	'samsunginternet_android',
	'opera',
	'opera_android'
];

export const runtime_engines = ['nodejs', 'deno', 'bun', 'cloudflare'];

export function engine_matches_runtime(engine: string, runtime: Runtime): boolean {
	if (runtime === 'any') return true;
	if (runtime === 'browser') return browser_engines.includes(engine);
	return engine === runtime;
}

export function engines_match_runtime(
	engines: EngineConstraint[] | undefined,
	runtime: Runtime
): boolean {
	if (runtime === 'any' || !engines || engines.length === 0) return true;
	return engines.some((e) => engine_matches_runtime(e.engine, runtime));
}

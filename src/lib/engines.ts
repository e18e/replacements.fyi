import type { EngineConstraint } from 'module-replacements';
import type { BrowserEngine, Runtime } from './runtime.svelte';

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
	// When runtime is "browser", follow-up filtering should also allow
	// choosing a specific browser engine (chrome/firefox/etc.) plus optional min version.
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

export type EngineFilterOptions = {
	runtime: Runtime;
	browser_engine: BrowserEngine;
	min_version: string;
};

function tokenize_version(version: string): string[] {
	return version.trim().split(/[.-]/).filter(Boolean);
}

function compare_version_parts(a: string, b: string): number {
	const a_is_num = /^\d+$/.test(a);
	const b_is_num = /^\d+$/.test(b);

	if (a_is_num && b_is_num) {
		const a_num = Number(a);
		const b_num = Number(b);
		if (a_num < b_num) return -1;
		if (a_num > b_num) return 1;
		return 0;
	}

	const lexical = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
	return lexical < 0 ? -1 : lexical > 0 ? 1 : 0;
}

function compare_versions(a: string, b: string): number {
	const a_parts = tokenize_version(a);
	const b_parts = tokenize_version(b);
	const max = Math.max(a_parts.length, b_parts.length);

	for (let i = 0; i < max; i += 1) {
		const a_part = a_parts[i] ?? '0';
		const b_part = b_parts[i] ?? '0';
		const compared = compare_version_parts(a_part, b_part);
		if (compared !== 0) return compared;
	}
	return 0;
}

function normalize_min_version(version: string): string {
	return version.trim();
}

function get_target_engine(
	runtime: Runtime,
	browser_engine: BrowserEngine
): Runtime | BrowserEngine {
	if (runtime === 'browser') return browser_engine;
	return runtime;
}

function is_version_compatible(constraint: EngineConstraint, user_min_version: string): boolean {
	const required_min = normalize_min_version(constraint.minVersion ?? '');
	if (!required_min) return true;
	return compare_versions(required_min, user_min_version) <= 0;
}

export function engines_match_preferences(
	engines: EngineConstraint[] | undefined,
	options: EngineFilterOptions
): boolean {
	const { runtime, browser_engine, min_version } = options;

	// Missing engine metadata means "all engines", which should pass every filter.
	if (!engines || engines.length === 0 || runtime === 'any') return true;

	const target_engine = get_target_engine(runtime, browser_engine);
	const matching_constraints = engines.filter((constraint) => constraint.engine === target_engine);
	if (matching_constraints.length === 0) return false;

	const normalized_user_min = normalize_min_version(min_version);
	if (!normalized_user_min) return true;

	// If a matching constraint has no minVersion, treat it as compatible/unknown.
	return matching_constraints.some((constraint) =>
		is_version_compatible(constraint, normalized_user_min)
	);
}

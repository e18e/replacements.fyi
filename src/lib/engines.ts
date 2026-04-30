import type { EngineConstraint } from 'module-replacements';
import type { BrowserEngine, Runtime } from './runtime.svelte';
import * as semver from 'semver';

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

export interface EngineFilterOptions {
	runtime: Runtime;
	browser_engine: BrowserEngine;
	min_version: string;
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
	const required_semver = semver.coerce(required_min);
	const user_semver = semver.coerce(user_min_version);
	// Invalid or non-semver-like versions are treated as unknown and allowed.
	if (!required_semver || !user_semver) return true;
	return semver.lte(required_semver, user_semver);
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

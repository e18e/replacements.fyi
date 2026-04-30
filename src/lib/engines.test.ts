import type { EngineConstraint } from 'module-replacements';
import { describe, expect, test } from 'vitest';
import { engines_match_preferences } from './engines';

const default_options = {
	runtime: 'browser' as const,
	browser_engine: 'chrome' as const,
	min_version: '100'
};

function match(
	engines: EngineConstraint[] | undefined,
	min_version: string = default_options.min_version
): boolean {
	return engines_match_preferences(engines, { ...default_options, min_version });
}

describe('engines_match_preferences', () => {
	test('passes when metadata is missing', () => {
		expect(match(undefined)).toBe(true);
		expect(match([])).toBe(true);
	});

	test('fails when no matching engine constraint exists', () => {
		const engines: EngineConstraint[] = [{ engine: 'firefox', minVersion: '90' }];
		expect(match(engines)).toBe(false);
	});

	test('passes when matching engine constraint has no minVersion', () => {
		const engines: EngineConstraint[] = [{ engine: 'chrome' }];
		expect(match(engines)).toBe(true);
	});

	test('compares numeric versions via semver coercion', () => {
		const engines: EngineConstraint[] = [{ engine: 'chrome', minVersion: '101' }];
		expect(match(engines, '100')).toBe(false);
		expect(match(engines, '101')).toBe(true);
		expect(match(engines, '101.1')).toBe(true);
	});

	test('handles semver-like versions', () => {
		const engines: EngineConstraint[] = [{ engine: 'chrome', minVersion: '1.2.3' }];
		expect(match(engines, '1.2.2')).toBe(false);
		expect(match(engines, '1.2.3')).toBe(true);
		expect(match(engines, '1.3.0')).toBe(true);
	});

	test('treats uncoercible versions as compatible (lenient-pass)', () => {
		expect(match([{ engine: 'chrome', minVersion: 'latest' }], '100')).toBe(true);
		expect(match([{ engine: 'chrome', minVersion: '100' }], 'rolling')).toBe(true);
	});
});

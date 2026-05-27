import type { ParamMatcher } from '@sveltejs/kit';
import { all } from 'module-replacements';

export const match: ParamMatcher = (param) => Object.hasOwn(all.mappings, param);

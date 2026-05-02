<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		all,
		resolveDocUrl,
		nativeReplacements,
		type EngineConstraint,
		type KnownUrl,
		type ModuleReplacement
	} from 'module-replacements';
	import { highlight } from './highlight.remote';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';
	import RuntimeToggle from '$lib/RuntimeToggle.svelte';
	import { browser_engines, runtime_engines, engines_match_runtime } from '$lib/engines';
	import { runtime } from '$lib/runtime.svelte';

	let { params } = $props();

	let package_name = $derived(`${params.scope ? `${params.scope}/` : ''}${params.package}`);

	let mapping = $derived(
		Object.hasOwn(all.mappings, package_name) ? all.mappings[package_name] : undefined
	);

	let resolved_replacements = $derived(
		mapping ? mapping.replacements.map((key: string) => ({ key, data: all.replacements[key] })) : []
	);

	let visible_replacements = $derived(
		resolved_replacements.filter(({ data }) => engines_match_runtime(data.engines, runtime.pref))
	);

	let count_label = $derived(
		visible_replacements.length === resolved_replacements.length
			? `${resolved_replacements.length}`
			: `${visible_replacements.length} of ${resolved_replacements.length}`
	);

	function get_url_display_name(url: KnownUrl): string {
		if (typeof url === 'string') return url;
		if (url.type === 'mdn') return `MDN`;
		if (url.type === 'e18e') return `e18e docs`;
		return `Node.js docs`;
	}

	function get_type_display_name(
		type: ModuleReplacement['type'],
		in_native_manifest: boolean
	): string {
		if (in_native_manifest) return 'Available natively';
		if (type === 'native') return 'Available natively';
		if (type === 'simple') return 'Simple or drop-in replacement';
		if (type === 'documented') return 'Community choice';
		if (type === 'removal') return 'Just remove it, no replacement needed';
		return type;
	}

	function is_in_native_manifest(key: string): boolean {
		return key in nativeReplacements.replacements;
	}

	function categorized_engines(engines: EngineConstraint[] | undefined) {
		if (!engines) return [];
		const browsers = engines.filter((e) => browser_engines.includes(e.engine));
		const runtimes = engines.filter((e) => runtime_engines.includes(e.engine));
		const other = engines.filter(
			(e) => !browser_engines.includes(e.engine) && !runtime_engines.includes(e.engine)
		);
		return [
			{ label: 'browsers', engines: browsers },
			{ label: 'runtimes', engines: runtimes },
			{ label: 'other', engines: other }
		].filter((c) => c.engines.length > 0);
	}

	function resolve_npm_url(module_name: string): string {
		return `https://npmx.dev/package/${module_name}`;
	}
</script>

<svelte:head>
	{#if mapping}
		<title>{package_name} - replacements.fyi</title>
		<meta name="description" content="Replacements for the '{package_name}' npm package." />
	{:else}
		<title>{package_name} not found - replacements.fyi</title>
		<meta name="description" content="No replacement found for the '{package_name}' npm package." />
	{/if}
</svelte:head>

<a href={resolve('/')} class="back-link"><ReplacementsTitle /></a>
<main class="page">
	{#if !mapping}
		<div class="not-found">
			<header>
				<p class="comment">// 404</p>
				<h1>"<span class="pkg">{package_name}</span>" not found</h1>
			</header>
			<p>we don't have a replacement for "{package_name}"...yet</p>
			<p>
				if you have a suggestion, please <a
					href="https://github.com/e18e/module-replacements/issues/new?template=1-replacement.yml"
					target="_blank"
					rel="noopener noreferrer">let us know</a
				>
			</p>
		</div>
	{:else}
		<header class="pkg-header">
			<p class="comment">// package</p>
			<h1 class="pkg-name"><span class="pkg">{package_name}</span></h1>
			<p class="pkg-type">type: "{mapping.type}"</p>
		</header>

		<section class="preferences">
			<p class="comment">// preferences</p>
			<div class="prefs-list">
				<RuntimeToggle />
			</div>
		</section>

		<section class="replacements">
			<p class="comment">// replacements ({count_label})</p>

			{#if visible_replacements.length === 0}
				<p class="description">
					No replacements match the <span class="teal">{runtime.pref}</span> runtime. Try switching
					to <span class="teal">any</span>.
				</p>
			{/if}

			{#each visible_replacements as { key, data } (key)}
				<div class="replacement">
					<h2 class="replacement-id">{key}</h2>
					<span class="badge">{get_type_display_name(data.type, is_in_native_manifest(key))}</span>

					{#if data.type === 'native'}
						<p class="description">
							This feature is available natively by using <span class="teal">{key}</span>. No
							third-party package needed.
						</p>
						{#if data.url}
							<p class="doc-link">
								→ docs:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={resolveDocUrl(data.url)} target="_blank" rel="noopener"
									>{get_url_display_name(data.url)}</a
								>
							</p>
						{/if}
						{#if data.engines && data.engines.length > 0}
							<p class="comment">// engine support</p>
							{@const categories = categorized_engines(data.engines)}
							<div class="engine-tabs" style:--tab-count={categories.length}>
								{#each categories as cat, i (cat.label)}
									<details name="engine-category-{key}" class="engine-tab" open={i === 0}>
										<summary class="tab-btn" style:--n={i + 1}>{cat.label}</summary>
										<table class="engine-table">
											<thead>
												<tr>
													<th>engine</th>
													<th>min version</th>
												</tr>
											</thead>
											<tbody>
												{#each cat.engines as eng (eng.engine)}
													<tr>
														<td>{eng.engine}</td>
														<td>{eng.minVersion ?? '?'}</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</details>
								{/each}
							</div>
						{/if}
					{:else if data.type === 'simple'}
						<p class="description">This package is no longer necessary. {data.description}</p>
						{#if data.example}
							<p class="comment">// example</p>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html await highlight(data.example)}
						{/if}
					{:else if data.type === 'removal'}
						<p class="description">This package is no longer necessary. {data.description}</p>
						<p class="verdict">// verdict: just remove it</p>
					{:else if data.type === 'documented'}
						<p class="description">
							This package provides equivalent functionality and has been flagged as more
							performant.
						</p>
						{#if data.url}
							<p class="doc-link">
								→ docs:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={resolveDocUrl(data.url)} target="_blank" rel="noopener"
									>{get_url_display_name(data.url)}</a
								>
							</p>
						{/if}
						{#if data.replacementModule}
							<p class="doc-link">
								→ npmx:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={resolve_npm_url(data.replacementModule)} target="_blank" rel="noopener"
									>{key}</a
								>
							</p>
						{/if}
					{/if}
				</div>
			{/each}
		</section>
	{/if}
</main>

<style>
	.page {
		min-height: 100vh;
		color: var(--text);
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
		box-sizing: border-box;
	}

	.pkg {
		view-transition-name: package-name;
	}

	a {
		text-decoration: none;
	}

	.back-link {
		color: var(--accent);
		font-size: 1rem;
		display: inline-block;
		margin: 1.5rem;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.comment {
		color: var(--subtle);
		font-size: 0.8rem;
		margin: 0 0 0.25rem;
	}

	.pkg-header {
		margin-bottom: 2.5rem;
	}

	.pkg-name {
		font-size: 2rem;
		font-weight: 700;
		margin: 0.25rem 0 0.5rem;
		color: var(--text);
	}

	.pkg-type {
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0;
	}

	.replacements > .comment {
		margin-bottom: 1.5rem;
	}

	.preferences {
		margin-bottom: 2rem;
	}

	.prefs-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.replacement {
		padding-bottom: 1.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.replacement:last-child {
		border-bottom: none;
	}

	.replacement-id {
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--accent);
		margin: 0 0 0.5rem;
	}

	.badge {
		display: inline-block;
		background: var(--code-bg);
		color: var(--accent-contrast);
		padding: 0.15rem 0.5rem;
		font-size: 0.7rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.doc-link {
		font-size: 0.85rem;
		color: var(--muted);
		margin: 0.5rem 0;
	}

	.doc-link a {
		color: var(--accent);
		text-decoration: underline;
	}

	.doc-link a:hover {
		color: var(--accent-hover);
	}

	.teal {
		color: var(--accent);
		font-weight: 600;
	}

	.description {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.7;
		margin: 0.5rem 0;
	}

	.verdict {
		color: var(--accent);
		font-style: italic;
		font-size: 0.85rem;
		margin: 0.75rem 0 0;
	}

	.replacement .comment {
		margin-top: 1rem;
	}

	.replacement :global(pre) {
		overflow-x: auto;
		padding: 1.5rem;
	}

	.engine-tabs {
		display: grid;
		grid-template-columns: repeat(var(--tab-count), auto);
		grid-template-rows: auto 1fr;
		margin: 0.75rem 0;
		border: 1px solid var(--border);
		border-radius: 4px;
		overflow: hidden;
	}

	.engine-tab {
		display: grid;
		grid-template-columns: subgrid;
		grid-template-rows: subgrid;
		grid-column: 1 / -1;
		grid-row: 1 / -1;
	}

	.engine-tab[open] > .tab-btn {
		background: var(--accent-contrast);
		color: var(--bg);
	}

	.engine-tab::details-content {
		grid-row: 2;
		grid-column: 1 / -1;
		padding: 0.5rem 1rem;
	}

	.engine-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}

	.engine-table th {
		text-align: left;
		color: var(--subtle);
		font-weight: 400;
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.engine-table td {
		padding: 0.3rem 0.5rem;
		color: var(--muted);
	}

	.engine-table td:last-child {
		color: var(--accent);
		font-weight: 600;
	}

	.tab-btn {
		grid-row: 1;
		grid-column: var(--n) / span 1;
		z-index: 1;
		background: none;
		color: var(--accent);
		border: none;
		border-right: 1px solid var(--border);
		padding: 0.4rem 0.9rem;
		font-family: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
		list-style: none;
	}

	.tab-btn:hover {
		background: var(--accent-tint);
	}

	.engine-tab:last-of-type > .tab-btn {
		border-right: none;
	}

	.tab-btn::marker,
	.tab-btn::-webkit-details-marker {
		display: none;
	}

	/* Not found */
	.not-found {
		padding-top: 3rem;
	}

	.not-found h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text);
		margin: 0.25rem 0 1.5rem;
	}
</style>

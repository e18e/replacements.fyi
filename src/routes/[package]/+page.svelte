<script lang="ts">
	import { resolve } from '$app/paths';
	import { all, type EngineConstraint, type KnownUrl } from 'module-replacements';
	import MrE18e from '$lib/MrE18e.svelte';

	let { params } = $props();

	let package_name = $derived(params.package ?? '');
	let mapping = $derived(all.mappings[package_name]);

	let resolved_replacements = $derived(
		mapping ? mapping.replacements.map((key: string) => ({ key, data: all.replacements[key] })) : []
	);

	const browser_engines = [
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
	const runtime_engines = ['nodejs', 'deno', 'bun'];

	let selected_category: 'browsers' | 'runtimes' | 'other' | null = $state(null);

	function get_url(url: KnownUrl): string {
		if (typeof url === 'string') return url;
		if (url.type === 'mdn') return `https://developer.mozilla.org/en-US/docs/${url.id}`;
		if (url.type === 'e18e')
			return `https://github.com/e18e/module-replacements/tree/main/docs/modules/${url.id}.md`;
		return `https://nodejs.org/${url.id}`;
	}

	function get_url_display_name(url: KnownUrl): string {
		if (typeof url === 'string') return url;
		if (url.type === 'mdn') return `MDN`;
		if (url.type === 'e18e') return `e18e docs`;
		return `Node.js docs`;
	}

	function filtered_engines(engines: EngineConstraint[] | undefined) {
		if (!engines) return [];
		if (!selected_category) return engines;
		if (selected_category === 'other') {
			return engines.filter(
				(e) => !browser_engines.includes(e.engine) && !runtime_engines.includes(e.engine)
			);
		}
		const cat_engines = selected_category === 'browsers' ? browser_engines : runtime_engines;
		return engines.filter((e) => cat_engines.includes(e.engine));
	}

	function toggle_category(cat: 'browsers' | 'runtimes' | 'other') {
		selected_category = selected_category === cat ? null : cat;
	}
</script>

<a href={resolve('/')} class="back-link"><MrE18e /></a>
<div class="page">
	{#if !mapping}
		<div class="not-found">
			<p class="comment">// 404</p>
			<h1>"<span class="pkg">{package_name}</span>" not found</h1>
			<p>we don't have a replacement for "{package_name}"...yet</p>
			<p>
				if you have a suggestion, please <a
					href="https://github.com/e18e/module-replacements/issues/new"
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

		<section class="replacements">
			<p class="comment">// replacements ({resolved_replacements.length})</p>

			{#each resolved_replacements as { key, data } (key)}
				<div class="replacement">
					<h2 class="replacement-id">{key}</h2>
					<span class="badge">{data.type}</span>

					{#if data.type === 'native'}
						{#if data.url}
							<p class="doc-link">
								→ docs:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={get_url(data.url)} target="_blank" rel="noopener"
									>{get_url_display_name(data.url)}</a
								>
							</p>
						{/if}
						{#if data.engines && data.engines.length > 0}
							<p class="comment">// engine support</p>
							<div class="engine-filters">
								{#each ['browsers', 'runtimes', 'other'] as const as cat (cat)}
									<button
										class="filter-btn"
										class:active={selected_category === cat}
										onclick={() => toggle_category(cat)}>{cat}</button
									>
								{/each}
							</div>
							<ul class="engine-list">
								{#each filtered_engines(data.engines) as eng (eng.engine)}
									<li>· {eng.engine} >= {eng.minVersion ?? '?'}</li>
								{/each}
							</ul>
						{/if}
					{:else if data.type === 'simple'}
						<p class="description">{data.description}</p>
						{#if data.example}
							<p class="comment">// example</p>
							<pre><code>{data.example}</code></pre>
						{/if}
					{:else if data.type === 'removal'}
						<p class="description">{data.description}</p>
						<p class="verdict">// verdict: just remove it</p>
					{:else if data.type === 'documented'}
						{#if data.url}
							→ docs:
							<p class="doc-link">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={get_url(data.url)} target="_blank" rel="noopener"
									>{get_url_display_name(data.url)}</a
								>
							</p>
						{/if}
						{#if data.replacementModule}
							<p class="doc-link">→ use: <span class="teal">{data.replacementModule}</span></p>
						{/if}
					{/if}
				</div>
			{/each}
		</section>
	{/if}
</div>

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
		color: var(--accent);
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

	pre {
		background: var(--code-bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0.5rem 0 0;
	}

	code {
		font-family: inherit;
		font-size: 0.8rem;
		white-space: pre-wrap;
		word-break: break-word;
		color: var(--text);
	}

	.engine-filters {
		display: flex;
		gap: 0.5rem;
		margin: 0.75rem 0;
	}

	.filter-btn {
		background: none;
		color: var(--accent);
		border: 1px solid var(--accent);
		padding: 0.3rem 0.7rem;
		font-family: inherit;
		font-size: 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.filter-btn:hover {
		background: var(--accent-tint);
	}

	.filter-btn.active {
		background: var(--accent);
		color: var(--bg);
	}

	.engine-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.engine-list li {
		font-size: 0.85rem;
		color: var(--text);
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

<script lang="ts">
	import { resolve } from '$app/paths';
	import { all } from 'module-replacements';
	import FilterInput from '$lib/FilterInput.svelte';
	import MrE18e from '$lib/MrE18e.svelte';

	const packages = Object.keys(all.mappings).sort();

	let filter = $state('');

	let filter_lower = $derived(filter.toLowerCase());

	let filtered_packages = $derived(
		packages.filter((pkg) => filter === '' || pkg.toLowerCase().includes(filter_lower))
	);
</script>

<svelte:head>
	<title>All Packages - replacements.fyi</title>
	<meta name="description" content="Browse all npm packages with replacements." />
</svelte:head>

<a href={resolve('/')} class="back-link"><MrE18e /></a>

<div class="page">
	<header class="header">
		<p class="comment">// all packages</p>
		<h1>Package Directory</h1>
		<p class="count">{filtered_packages.length} of {packages.length} packages</p>
	</header>

	<div class="filters">
		<FilterInput placeholder="Filter packages..." bind:value={filter} autofocus />
	</div>

	<ul class="package-list">
		{#each filtered_packages as pkg (pkg)}
			<li>
				<a href={resolve('/[package]', { package: encodeURIComponent(pkg) })} class="package-link">
					<span class="package-name">{pkg}</span>
				</a>
			</li>
		{/each}
	</ul>

	{#if filtered_packages.length === 0}
		<p class="no-results">No packages match your search.</p>
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		color: var(--text);
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem;
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

	.header {
		margin-bottom: 2rem;
	}

	.comment {
		color: var(--subtle);
		font-size: 0.8rem;
		margin: 0 0 0.25rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0.25rem 0 0.5rem;
		color: var(--text);
	}

	.count {
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0;
	}

	.filters {
		display: flex;
		flex: 1;
		align-items: center;
		margin-bottom: 1.5rem;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		background: var(--input-bg);
		overflow: visible;
		transition: border-color 0.15s;
	}

	.filters:focus-within {
		border-color: var(--accent);
	}

	.package-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
	}

	.package-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
		color: var(--text);
		transition: background 0.15s;
	}

	.package-list li:last-child .package-link {
		border-bottom: none;
	}

	.package-link:hover {
		background: var(--code-bg);
	}

	.package-name {
		font-weight: 500;
		color: var(--accent);
	}

	.no-results {
		text-align: center;
		color: var(--muted);
		padding: 3rem;
	}
</style>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PackageSearch from '$lib/PackageSearch.svelte';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';
	import { all } from 'module-replacements';

	const examples = ['is-number', 'left-pad', 'is-odd', 'object-assign'];
	const all_packages = Object.keys(all.mappings);

	let random_pkg = $state(all_packages[0] ?? '');

	function package_href(package_name: string) {
		return resolve('/[...pkg=package_name]', { pkg: package_name });
	}

	function get_random_package() {
		if (all_packages.length === 0) return '';
		return all_packages[Math.floor(Math.random() * all_packages.length)];
	}

	afterNavigate(() => {
		random_pkg = get_random_package();
	});
</script>

<div class="page">
	<main class="container">
		<header>
			<div class="title">
				<ReplacementsTitle />
			</div>

			<p class="params">
				<span class="paren">(</span><span class="param">module_replacements</span><span
					class="paren">)</span
				>
			</p>
		</header>

		<p class="tagline">type a package name. we'll tell you what you don't need.</p>

		<PackageSearch variant="hero" autofocus />

		<div class="examples">
			<span class="examples-header">// examples</span>
			<ul class="examples-list">
				{#each examples as name (name)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<li><a href={package_href(name)}>{name}</a></li>
				{/each}
			</ul>
		</div>

		<div class="actions">
			<div class="nav-group" role="group" aria-label="Quick Navigation">
				<a href={resolve('/packages')} class="seg">Browse all</a>
				<a href={resolve('/package-json')} class="seg">Scan package.json</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={resolve('/[...pkg=package_name]', { pkg: random_pkg })} class="seg">
					I'm feeling lucky
				</a>
			</div>
		</div>
	</main>

	<footer class="footer">
		<a href="https://e18e.dev" class="powered-by" target="_blank" rel="noopener">
			powered by e18e.dev
		</a>
	</footer>
</div>

<style>
	.page {
		height: 100dvh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 1.5rem 2rem;
		overflow-y: auto;
	}

	.container {
		max-width: 480px;
		width: 100%;
		margin: auto;
		container-type: inline-size;
	}

	.title {
		margin-bottom: 0.5rem;
		font-size: min(3rem, 10cqi);
		line-height: 1;
	}

	.params {
		margin: 0.75rem 0 0;
		font-size: 1rem;
	}

	.paren {
		color: var(--subtle);
	}

	.param {
		color: var(--accent);
	}

	.tagline {
		color: var(--muted);
		font-size: 0.875rem;
		margin: 1.5rem 0 0;
		line-height: 1.5;
	}

	.examples {
		margin-top: 2rem;
	}

	.examples-header {
		color: var(--subtle);
		font-size: 0.8125rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.examples-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0;
		margin: 0;
		list-style-position: inside;
	}

	.examples-list li::marker {
		content: '· ';
		color: var(--accent);
		font-size: 0.875rem;
	}

	.examples-list a {
		color: var(--accent);
		text-decoration: none;
		font-size: 0.875rem;
		padding: 0.125rem 0;
	}

	.examples-list a:hover {
		text-decoration: underline;
	}

	.actions {
		margin-top: 2.5rem;
		display: flex;
		justify-content: center;
	}

	.nav-group {
		display: inline-flex;
		align-items: stretch;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
		background: var(--surface);
		height: 32px;
	}

	.seg {
		display: inline-flex;
		align-items: center;
		background: none;
		border: none;
		color: var(--subtle-contrast);
		font-family: inherit;
		font-size: 0.75rem;
		padding: 0 0.75rem;
		cursor: pointer;
		line-height: 1;
		text-decoration: none;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.seg + .seg {
		border-left: 1px solid var(--border);
	}

	.seg:hover {
		color: var(--accent-contrast);
		background: color-mix(in srgb, var(--accent) 10%, transparent);
	}

	.footer {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		padding-top: 1rem;
	}

	.powered-by {
		color: var(--subtle);
		font-size: 0.75rem;
		text-decoration: none;
	}

	.powered-by:hover {
		text-decoration: underline;
	}
</style>

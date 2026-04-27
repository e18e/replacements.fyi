<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { all } from 'module-replacements';
	import Autocomplete from '$lib/Autocomplete.svelte';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';
	import { scopify } from '$lib/utils';

	const examples = ['is-number', 'left-pad', 'is-odd', 'object-assign'];
	const packages = Object.keys(all.mappings);

	function package_href(package_name: string) {
		return resolve('/[[scope=scope]]/[package]', scopify(package_name));
	}

	function navigate_to(package_name: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(package_href(package_name));
	}
</script>

<div class="page">
	<div class="container">
		<div class="title">
			<ReplacementsTitle />
		</div>

		<p class="params">
			<span class="paren">(</span><span class="param">module_replacements</span><span class="paren"
				>)</span
			>
		</p>

		<p class="tagline">type a package name. we'll tell you what you don't need.</p>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				const form_data = new FormData(e.currentTarget);
				const package_name = form_data.get('package');
				if (package_name) {
					const input = e.currentTarget.querySelector('input')!;
					input.style.setProperty('view-transition-name', 'package-name');
					navigate_to(package_name.toString());
				}
			}}
			class="search-form"
		>
			<Autocomplete
				items={packages}
				placeholder="e.g. is-number"
				name="package"
				get_item_href={package_href}
				on_select_navigate_to={navigate_to}
				autofocus
			/>
			<button type="submit" class="submit-btn" aria-label="Search">→</button>
		</form>

		<div class="examples">
			<span class="examples-header">// examples</span>
			<ul class="examples-list">
				{#each examples as name (name)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<li><a href={package_href(name)}>{name}</a></li>
				{/each}
			</ul>
		</div>

		<a href="https://e18e.dev" class="powered-by" target="_blank" rel="noopener"
			>powered by e18e.dev</a
		>

		<a href={resolve('/packages')} class="all-packages-link">Browse all packages →</a>
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.container {
		max-width: 480px;
		width: 100%;
		transform: translateY(-2rem);
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

	.search-form {
		display: flex;
		align-items: center;
		margin-top: 1.5rem;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		background: var(--input-bg);
		overflow: visible;
		transition: border-color 0.15s;
	}

	.search-form:focus-within {
		border-color: var(--accent);
	}

	.submit-btn {
		background: none;
		border: none;
		color: var(--accent);
		font-family: inherit;
		font-size: 1.125rem;
		padding: 0.625rem 0.75rem;
		cursor: pointer;
		flex-shrink: 0;
		line-height: 1;
	}

	.submit-btn:hover {
		color: var(--accent-hover);
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

	.powered-by {
		display: block;
		margin-top: 3rem;
		color: var(--subtle);
		font-size: 0.75rem;
		text-decoration: none;
	}

	.powered-by:hover {
		text-decoration: underline;
	}

	.all-packages-link {
		display: block;
		text-align: center;
		margin-top: 2rem;
		color: var(--accent);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.all-packages-link:hover {
		text-decoration: underline;
	}
</style>

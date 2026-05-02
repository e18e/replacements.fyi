<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import FilterInput from '$lib/FilterInput.svelte';
	import SingleInputSubmitButton from '$lib/SingleInputSubmitButton.svelte';
	import { scopify } from '$lib/utils';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let package_json = $derived(typeof form?.package_json === 'string' ? form.package_json : '');

	function package_href(package_name: string) {
		return resolve('/[[scope=scope]]/[package]', scopify(package_name));
	}

	function add_view_transition_name(link: HTMLAnchorElement) {
		const package_name = link.querySelector<HTMLElement>('.package-name');
		package_name?.style.setProperty('view-transition-name', 'package-name');
	}

	function handle_on_input(event: Event & { currentTarget: HTMLInputElement }) {
		if (!(event instanceof InputEvent) || event.inputType !== 'insertFromPaste') return;
		event.currentTarget.form?.requestSubmit();
	}
</script>

<svelte:head>
	<title>Scan package.json - replacements.fyi</title>
	<meta name="description" content="Scan a package.json for replacements." />
</svelte:head>

<main class="page">
	<header class="header">
		<p class="comment">// package.json</p>
		<h1>Package Directory</h1>
		<p class="count">Scan package.json for replacements</p>
	</header>

	<form method="POST" use:enhance>
		<div class="filters">
			<FilterInput
				placeholder="Paste in package.json"
				name="package_json"
				value={package_json}
				oninput={handle_on_input}
				autofocus
			/>
			<SingleInputSubmitButton aria-label="Scan package.json" />
		</div>
		{#if form?.error}
			<p class="error" role="alert">
				<span class="error-label">// error</span>
				<span>{form.error}</span>
			</p>
		{/if}
	</form>

	{#if form?.success}
		<section class="results" aria-live="polite">
			<header class="results-header">
				<p class="comment">// scan complete</p>
				<h2>Found {form.replacements.length} replacements</h2>
				<p class="count">Checked {form.checked} packages from package.json</p>
			</header>

			{#if form.replacements.length > 0}
				<ul class="replacement-list">
					{#each form.replacements as replacement (replacement.dep)}
						<li>
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								onclick={(e) => {
									add_view_transition_name(e.currentTarget);
								}}
								href={package_href(replacement.replacement.moduleName)}
								class="replacement-link"
							>
								<span class="replacement-copy">
									<span class="package-name">{replacement.dep}</span>
									<span class="replacement-target"
										>{replacement.replacement.replacements.length} replacement option{replacement
											.replacement.replacements.length === 1
											? ''
											: 's'}</span
									>
								</span>
								<span class="details-link">View details →</span>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty-state">
					<p class="empty-copy">
						We checked your dependencies against the replacement directory and did not find any
						matches.
					</p>
					<a href={resolve('/packages')} class="empty-link">Browse all known replacements →</a>
				</div>
			{/if}
		</section>
	{/if}
</main>

<style>
	.page {
		min-height: 100vh;
		color: var(--text);
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
	}

	.comment {
		color: var(--subtle);
		font-size: 0.8rem;
		margin: 0 0 0.25rem;
	}

	h1,
	h2 {
		color: var(--text);
		font-weight: 700;
		margin: 0.25rem 0 0.5rem;
	}

	h1 {
		font-size: 2rem;
	}

	h2 {
		font-size: 1.25rem;
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

	.error {
		display: grid;
		gap: 0.35rem;
		margin: -0.5rem 0 1.5rem;
		padding: 0.875rem 1rem;
		border: 1px solid color-mix(in srgb, #dc2626 45%, var(--border));
		border-radius: 6px;
		background: color-mix(in srgb, #dc2626 8%, var(--surface));
		color: var(--text);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.error-label {
		color: #dc2626;
		font-size: 0.75rem;
	}

	.results {
		margin-top: 2rem;
	}

	.results-header {
		margin-bottom: 1rem;
	}

	.replacement-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
	}

	.replacement-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
		color: var(--text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.replacement-list li:last-child .replacement-link {
		border-bottom: none;
	}

	.replacement-link:hover {
		background: var(--code-bg);
	}

	.replacement-copy {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}

	.package-name {
		color: var(--accent);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.replacement-target {
		color: var(--muted);
		font-size: 0.8rem;
		overflow-wrap: anywhere;
	}

	.details-link {
		color: var(--accent);
		font-size: 0.8rem;
		white-space: nowrap;
	}

	.replacement-link:hover .details-link {
		color: var(--accent-hover);
		text-decoration: underline;
	}

	.empty-state {
		margin: 0;
		padding: 0.25rem 0 0;
	}

	.empty-copy {
		color: var(--muted);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0 0 0.875rem;
	}

	.empty-link {
		color: var(--accent);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.empty-link:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}

	@media (max-width: 520px) {
		.replacement-link {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { all } from 'module-replacements';
	import Autocomplete from '$lib/Autocomplete.svelte';
	import SingleInputSubmitButton from '$lib/SingleInputSubmitButton.svelte';

	type Props = {
		variant?: 'hero' | 'url';
		value?: string;
		autofocus?: boolean;
	};

	let { variant = 'url', value = $bindable(''), autofocus = false }: Props = $props();

	const packages = Object.keys(all.mappings);

	const placeholder = $derived(variant === 'hero' ? 'e.g. is-number' : 'package-name');

	function package_href(package_name: string) {
		return resolve('/[...pkg=package_name]', { pkg: package_name });
	}

	function navigate_to(package_name: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(package_href(package_name));
	}
</script>

<form
	class="search-form search-box"
	class:hero={variant === 'hero'}
	class:url-bar={variant === 'url'}
	onsubmit={(e) => {
		e.preventDefault();
		const form_data = new FormData(e.currentTarget);
		const package_name = form_data.get('package');
		if (package_name) {
			navigate_to(package_name.toString());
		}
	}}
>
	<a href={resolve('/')} class="origin" aria-label="Home">replacements<span>.fyi</span></a>
	<span class="slash" aria-hidden="true">/</span>
	<Autocomplete
		items={packages}
		{placeholder}
		name="package"
		get_item_href={package_href}
		on_select_navigate_to={navigate_to}
		{autofocus}
		bind:value
	/>
	<SingleInputSubmitButton aria-label="Search" />
</form>

<style>
	.search-form {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		background: var(--input-bg);
		overflow: visible;
		transition: border-color 0.15s;
		/* Persistent name pairs with setup-search-view-transition (npmx-inspired). */
		view-transition-name: search-box;
	}

	.search-form.hero {
		margin-top: 1.5rem;
		width: 100%;
	}

	.search-form.url-bar {
		margin: 1.5rem;
		max-width: 600px;
	}

	.search-form:focus-within {
		border-color: var(--accent);
	}

	.origin {
		flex-shrink: 0;
		padding: 0.625rem 0 0.625rem 0.75rem;
		color: var(--text);
		font-weight: 700;
		text-decoration: none;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.origin span {
		color: var(--subtle);
	}

	.origin:hover {
		text-decoration: underline;
	}

	.slash {
		color: var(--subtle);
		flex-shrink: 0;
		font-size: 0.9375rem;
		padding: 0.625rem 0;
	}

	.search-form :global(.autocomplete input) {
		padding-left: 0.25rem;
	}
</style>

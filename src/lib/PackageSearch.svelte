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

{#if variant === 'url'}
	<div class="url-header">
		<a href={resolve('/')} class="replacements-title" aria-label="Home"
			>replacements<span>.fyi</span></a
		>
		<form
			class="search-form search-box url-bar"
			onsubmit={(e) => {
				e.preventDefault();
				const form_data = new FormData(e.currentTarget);
				const package_name = form_data.get('package');
				if (package_name) {
					navigate_to(package_name.toString());
				}
			}}
		>
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
	</div>
{:else}
	<form
		class="search-form search-box hero"
		onsubmit={(e) => {
			e.preventDefault();
			const form_data = new FormData(e.currentTarget);
			const package_name = form_data.get('package');
			if (package_name) {
				navigate_to(package_name.toString());
			}
		}}
	>
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
{/if}

<style>
	.url-header {
		position: fixed;
		top: 1rem;
		left: 1.5rem;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		view-transition-name: header-bar;
	}

	.replacements-title {
		color: var(--text);
		font-weight: 700;
		text-decoration: none;
		font-size: 0.85rem;
		line-height: 1;
		white-space: nowrap;
		transition: opacity 0.15s;
	}

	.replacements-title span {
		color: var(--subtle);
		font-family: inherit;
		line-height: 1;
	}

	.replacements-title:hover {
		opacity: 0.8;
	}

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
		margin: 0;
		max-width: 260px;
		width: 100%;
		height: 28px;
		font-size: 0.7rem;
	}

	.search-form:focus-within {
		border-color: var(--accent);
	}

	.search-form :global(.autocomplete input) {
		padding-left: 0.5rem;
	}

	.search-form.url-bar :global(.autocomplete input) {
		font-size: 0.7rem;
		padding: 0 0.4rem;
		height: 100%;
	}

	.search-form.url-bar :global(button) {
		padding: 0 0.55rem;
		font-size: 0.7rem;
		height: 100%;
		display: inline-flex;
		align-items: center;
	}
</style>

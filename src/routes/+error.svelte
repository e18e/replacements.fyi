<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';

	const error_message = $derived(page.error?.message ?? 'An error occurred');
	const package_name = $derived(page.error?.package_name);
</script>

<svelte:head>
	<title>{page.status} - replacements.fyi</title>
</svelte:head>

<a href={resolve('/')} class="back-link"><ReplacementsTitle /></a>

<main class="page">
	<header>
		<p class="comment">// {page.status}</p>
		<h1>{error_message}</h1>
	</header>
	{#if package_name}
		<p class="suggestion">
			we don't have a replacement for "{package_name}"...yet
		</p>
		<p class="suggestion">
			if you have a suggestion, please
			<a
				href="https://github.com/e18e/module-replacements/issues/new?template=1-replacement.yml"
				target="_blank"
				rel="noopener noreferrer">let us know</a
			>
		</p>
	{/if}
	<a href={resolve('/')} class="home-link">← Go back home</a>
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

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0.25rem 0 1.5rem;
	}

	.suggestion {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.7;
		margin: 0 0 0.5rem;
	}

	.suggestion a {
		color: var(--accent);
		text-decoration: underline;
	}

	.suggestion a:hover {
		color: var(--accent-hover);
	}

	.home-link {
		color: var(--accent);
		font-size: 0.875rem;
		text-decoration: none;
		display: inline-block;
		margin-top: 0.5rem;
	}

	.home-link:hover {
		text-decoration: underline;
	}
</style>

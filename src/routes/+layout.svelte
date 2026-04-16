<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import './global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThemeToggle />

{@render children()}

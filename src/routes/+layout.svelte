<script lang="ts">
	import '@fontsource/ibm-plex-mono/100.css';
	import '@fontsource/ibm-plex-mono/200.css';
	import '@fontsource/ibm-plex-mono/300.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '@fontsource/ibm-plex-mono/600.css';
	import '@fontsource/ibm-plex-mono/700.css';
	import favicon from '$lib/assets/favicon.svg';
	import Controls from '$lib/Controls.svelte';
	import './global.css';
	import { setupViewTransition } from 'sveltekit-view-transition';

	setupViewTransition();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>replacements.fyi - performant, safer npm package alternatives</title>
	<meta
		name="description"
		content="Find more performant and safer replacements for outdated or unnecessary npm packages."
	/>
</svelte:head>

<Controls />

{@render children()}

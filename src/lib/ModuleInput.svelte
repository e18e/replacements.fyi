<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		value?: string;
	} & HTMLInputAttributes;

	let { value = $bindable(''), ...rest }: Props = $props();
</script>

<input bind:value {...rest} type="text" autocomplete="off" spellcheck="false" role="searchbox" />

<style>
	input {
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		font-family: inherit;
		font-size: 0.9375rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		box-sizing: border-box;
	}

	input::placeholder {
		color: var(--subtle);
	}
</style>

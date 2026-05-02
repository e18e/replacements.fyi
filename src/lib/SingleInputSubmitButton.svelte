<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes;

	let { ...rest }: Props = $props();
</script>

<button {...rest} type="submit">→</button>

<style>
	button {
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

	button:hover {
		color: var(--accent-hover);
	}
</style>

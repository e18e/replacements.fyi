<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Props = {
		placeholder?: boolean;
		children: Snippet;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'placeholder'>;

	let { placeholder = false, children, ...rest }: Props = $props();
</script>

<label class="file-input">
	<input {...rest} type="file" />
	<span class:placeholder>{@render children()}</span>
</label>

<style>
	.file-input {
		display: flex;
		flex: 1;
		align-items: center;
		margin-bottom: 1.5rem;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		background: var(--input-bg);
		cursor: pointer;
		overflow: visible;
		transition: border-color 0.15s;
	}

	.file-input:focus-within {
		border-color: var(--accent);
	}

	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	span {
		color: var(--text);
		font-family: inherit;
		font-size: 0.9375rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		box-sizing: border-box;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.placeholder {
		color: var(--subtle);
	}
</style>

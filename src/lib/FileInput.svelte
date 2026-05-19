<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Props = {
		placeholder?: boolean;
		selected?: boolean;
		children: Snippet;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'placeholder'>;

	let { placeholder = false, selected = false, children, ...rest }: Props = $props();
</script>

<label class="file-input" class:selected>
	<input {...rest} type="file" />
	<span class="file-input-content" class:placeholder aria-hidden="true">{@render children()}</span>
</label>

<style>
	.file-input {
		display: block;
		margin-bottom: 1rem;
		border: 2px dashed var(--accent);
		border-radius: 8px;
		background: var(--input-bg);
		cursor: pointer;
		overflow: visible;
		transition:
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.file-input:hover,
	.file-input:focus-within {
		border-color: var(--accent);
		background: var(--accent-tint);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
	}

	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.file-input-content {
		color: var(--text);
		font-family: inherit;
		font-size: 0.9375rem;
		display: grid;
		min-height: 10.5rem;
		box-sizing: border-box;
		place-items: center;
		text-align: center;
	}

	.placeholder {
		color: var(--text);
	}

	.selected .file-input-content {
		min-height: 8.5rem;
		grid-template-rows: 1fr auto;
	}

	:global(.file-input-prompt) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		width: 100%;
		min-height: 5.25rem;
		padding: 1.25rem;
		box-sizing: border-box;
		line-height: 1.5;
	}

	:global(.file-input-action) {
		color: var(--accent);
		font-weight: 700;
	}

	:global(.file-input-selection) {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: fit-content;
		max-width: 100%;
		padding: 0.9rem 1.25rem 1rem;
		border-top: 2px dashed var(--accent);
		box-sizing: border-box;
		text-align: left;
	}

	:global(.file-input-icon) {
		width: 2.75rem;
		height: 2.75rem;
		color: var(--accent);
	}

	:global(.file-input-name) {
		min-width: 0;
		overflow: hidden;
		color: var(--text);
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 520px) {
		.file-input-content {
			min-height: 8.5rem;
		}

		.selected .file-input-content {
			min-height: 7.5rem;
		}

		:global(.file-input-prompt) {
			min-height: 4.75rem;
			padding: 1rem;
		}

		:global(.file-input-selection) {
			grid-template-columns: 1fr;
			justify-items: center;
			gap: 0.5rem;
			text-align: center;
		}
	}
</style>

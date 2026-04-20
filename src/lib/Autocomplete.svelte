<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		items: string[];
		value?: string;
	} & HTMLInputAttributes;

	let { items, value = $bindable(''), ...rest }: Props = $props();

	let open = $state(false);
	let active_index = $state(-1);

	let filtered = $derived(
		value.length > 0 ? items.filter((item) => item.includes(value)).slice(0, 20) : []
	);

	let exact = $derived(filtered.length === 1 && filtered[0] === value);

	function select(item: string) {
		value = item;
		open = false;
		active_index = -1;
	}

	function handle_keydown(e: KeyboardEvent) {
		if (!open && filtered.length > 0 && e.key !== 'Escape') {
			open = true;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active_index = Math.min(active_index + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active_index = Math.max(active_index - 1, 0);
		} else if (e.key === 'Enter' && active_index >= 0 && open) {
			e.preventDefault();
			select(filtered[active_index]);
		} else if (e.key === 'Escape') {
			open = false;
			active_index = -1;
		}
	}

	function handle_input() {
		open = filtered.length > 0;
		active_index = -1;
	}
</script>

<div class="autocomplete">
	<input
		bind:value
		oninput={handle_input}
		onkeydown={handle_keydown}
		onfocus={() => {
			if (filtered.length > 0) open = true;
		}}
		onblur={() => {
			setTimeout(() => {
				open = false;
			}, 150);
		}}
		{...rest}
		autocomplete="off"
		spellcheck="false"
		role="combobox"
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls="autocomplete-list"
		aria-activedescendant={active_index >= 0 ? `option-${active_index}` : undefined}
	/>
	{#if open && filtered.length > 0 && !exact}
		<ul id="autocomplete-list" class="suggestions" role="listbox">
			{#each filtered as item, i (item)}
				<li
					{@attach (node) => {
						if (active_index === i) {
							node.scrollIntoView({ block: 'nearest' });
						}
					}}
					id="option-{i}"
					role="option"
					aria-selected={i === active_index}
					class:active={i === active_index}
					onmousedown={() => select(item)}
				>
					{item}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.autocomplete {
		position: relative;
		flex: 1;
	}

	input {
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		font-family: inherit;
		font-size: 0.9375rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
	}

	input::placeholder {
		color: var(--subtle);
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		margin: 0;
		padding: 0.25rem 0;
		list-style: none;
		background: var(--input-bg, #1a1a2e);
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
	}

	.suggestions li {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text);
		cursor: pointer;
	}

	.suggestions li:hover,
	.suggestions li.active {
		background: var(--accent);
		color: var(--bg, #0a0a1a);
	}
</style>

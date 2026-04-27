<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		items: string[];
		value?: string;
		get_item_href: (item: string) => string;
		on_select_navigate_to: (item: string) => void;
	} & HTMLInputAttributes;

	let {
		items,
		value = $bindable(''),
		get_item_href,
		on_select_navigate_to,
		...rest
	}: Props = $props();

	let open = $state(false);
	let active_index = $state(-1);

	let filtered = $derived(
		value.length > 0 ? items.filter((item) => item.includes(value.toLowerCase())).slice(0, 20) : []
	);

	let input: HTMLInputElement;

	function select(item: string) {
		prepare_transition();
		on_select_navigate_to(item);
	}

	function prepare_transition() {
		input.style.setProperty('view-transition-name', 'package-name');
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
		bind:this={input}
		bind:value
		oninput={handle_input}
		onkeydown={handle_keydown}
		onfocus={() => {
			if (filtered.length > 0) open = true;
		}}
		onblur={() => {
			open = false;
			active_index = -1;
		}}
		{...rest}
		autocomplete="off"
		spellcheck="false"
	/>
	{#if open && filtered.length > 0}
		<ul class="suggestions">
			{#each filtered as item, i (item)}
				<li>
					<a
						{@attach (node) => {
							if (active_index === i) {
								node.scrollIntoView({ block: 'nearest' });
							}
						}}
						href={get_item_href(item)}
						class:active={i === active_index}
						aria-current={i === active_index ? 'true' : undefined}
						onmousedown={(e) => e.preventDefault()}
						onclick={prepare_transition}
					>
						{item}
					</a>
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
		padding: 0.625rem 0 0.625rem 0.75rem;
		box-sizing: border-box;
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

	.suggestions a {
		display: block;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text);
		cursor: pointer;
		text-decoration: none;
	}

	.suggestions a:hover,
	.suggestions a.active {
		background: var(--accent);
		color: var(--bg, #0a0a1a);
	}
</style>

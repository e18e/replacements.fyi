<script lang="ts">
	import { theme, type ThemePref } from '$lib/theme.svelte';

	const options: { value: ThemePref; label: string }[] = [
		{ value: 'light', label: 'light' },
		{ value: 'dark', label: 'dark' },
		{ value: 'system', label: 'auto' }
	];
</script>

<div class="toggle" role="group" aria-label="Theme">
	{#each options as opt (opt.value)}
		<button
			type="button"
			class="seg"
			class:active={theme.pref === opt.value}
			aria-label="Use {opt.value} theme"
			aria-pressed={theme.pref === opt.value}
			onclick={() => {
				if (!document.startViewTransition) {
					theme.set(opt.value);
					return;
				}
				document.startViewTransition(() => {
					theme.set(opt.value);
				});
			}}
		>
			{opt.label}
		</button>
	{/each}
</div>

<style>
	.toggle {
		position: fixed;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 100;
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
		background: var(--surface);
	}

	.seg {
		background: none;
		border: none;
		color: var(--subtle);
		font-family: inherit;
		font-size: 0.7rem;
		padding: 0.3rem 0.55rem;
		cursor: pointer;
		line-height: 1;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.seg + .seg {
		border-left: 1px solid var(--border);
	}

	.seg:hover {
		color: var(--muted);
	}

	.seg.active {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 10%, transparent);
	}
</style>

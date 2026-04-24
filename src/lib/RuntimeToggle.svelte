<script lang="ts">
	import { runtime, runtimes, type Runtime } from '$lib/runtime.svelte';
</script>

<label class="toggle">
	<span class="label">runtime</span>
	<select
		value={runtime.pref}
		onchange={(e) => runtime.set((e.currentTarget as HTMLSelectElement).value as Runtime)}
	>
		{#each runtimes as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</label>

<style>
	.toggle {
		position: fixed;
		top: 0.75rem;
		right: 10.5rem;
		z-index: 100;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		padding: 0 0.55rem;
	}

	.label {
		color: var(--subtle);
		font-size: 0.7rem;
		line-height: 1;
	}

	select {
		background: none;
		border: none;
		color: var(--muted);
		font-family: inherit;
		font-size: 0.7rem;
		padding: 0.3rem 0;
		cursor: pointer;
		line-height: 1;
		outline: none;
	}

	select:hover {
		color: var(--accent);
	}
</style>

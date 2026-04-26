<script lang="ts">
	import { runtime, runtimes, type Runtime } from '$lib/runtime.svelte';
</script>

<label class="field">
	<span class="label">runtime:</span>
	<select
		value={runtime.pref}
		name="runtime"
		aria-label="Runtime"
		onchange={(e) => runtime.set((e.currentTarget as HTMLSelectElement).value as Runtime)}
	>
		{#each runtimes as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</label>

<style>
	.field {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		line-height: 1;
	}

	.label {
		color: var(--subtle);
	}

	select {
		appearance: none;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--muted);
		font-family: inherit;
		padding: 0.3rem 0.55rem;
		margin: 0;
		cursor: pointer;
		line-height: 1;
		outline: none;
	}

	select:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	select:focus-visible {
		border-color: var(--accent);
	}
</style>

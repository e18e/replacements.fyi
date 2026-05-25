<script lang="ts">
	import {
		browser_engine_options,
		runtime,
		runtimes,
		type BrowserEngine,
		type Runtime
	} from '$lib/runtime.svelte';
</script>

<div class="field">
	<label class="field-item">
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

	{#if runtime.pref === 'browser'}
		<label class="field-item">
			<span class="label">browser engine:</span>
			<select
				value={runtime.browserEngine}
				name="browser-engine"
				aria-label="Browser engine"
				onchange={(e) =>
					runtime.set_browser_engine((e.currentTarget as HTMLSelectElement).value as BrowserEngine)}
			>
				{#each browser_engine_options as opt (opt.value)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</label>
	{/if}

	<label class="field-item">
		<span class="label">min version:</span>
		<input
			type="text"
			name="min-version"
			aria-label="Minimum version"
			inputmode="numeric"
			placeholder="e.g. 20.0.0"
			value={runtime.minVersion}
			oninput={(e) => runtime.set_min_version((e.currentTarget as HTMLInputElement).value)}
		/>
	</label>
</div>

<style>
	.field {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.field-item {
		display: inline-flex;
		align-items: center;
		line-height: 1;
	}

	.label {
		color: var(--subtle);
	}

	select,
	input {
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

	select:hover,
	input:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	select:focus-visible,
	input:focus-visible {
		border-color: var(--accent);
	}

	input {
		min-width: 8.5rem;
	}
</style>

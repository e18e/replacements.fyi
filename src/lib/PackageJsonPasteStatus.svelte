<script lang="ts">
	type Props = {
		pasted?: boolean;
	};

	let { pasted = false }: Props = $props();
</script>

<div class="paste-status" aria-live="polite">
	{#if pasted}
		<svg
			class="paste-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
			aria-hidden="true"
		>
			<path
				d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"
			/>
			<path
				d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"
			/>
		</svg>
		<span>pasted successfully</span>
	{:else}
		<p>or paste the content of your package.json</p>
	{/if}
</div>

<style>
	.paste-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 3.5rem;
		margin: 0 0 1.5rem;
		color: var(--text);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	p {
		margin: 0;
	}

	.paste-icon {
		width: 2.75rem;
		height: 2.75rem;
		flex: 0 0 auto;
		color: var(--accent);
	}

	span {
		font-weight: 600;
	}
</style>

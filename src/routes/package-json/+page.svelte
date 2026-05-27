<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import FileInput from '$lib/FileInput.svelte';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';
	import { eval_package_json } from '$lib/package-json-scan';
	import type { PackageJsonScanResult } from '$lib/package-json-scan';

	import { scan_package_json_file } from './data.remote';
	import { get_repo_package_json } from './github.remote';

	let file_name = $state('');
	let dragging_file = $state(false);

	const github_info = $derived.by(() => {
		const params = Object.fromEntries(page.url.searchParams.entries());
		if ('repo' in params && 'owner' in params) {
			return params as { owner: string; repo: string; branch?: string; path?: string };
		}
		return null;
	});

	function eval_github_package_json(package_json: string | null): PackageJsonScanResult {
		if (package_json === null) {
			return { success: false, error: 'package.json not found in this GitHub repository.' };
		}

		const result = eval_package_json(package_json);
		// note (ux): A GitHub scan resolves a repository file, rather than an uploaded file.
		// Use source-specific copy so users know the link resolved but its package.json is malformed.
		if (!result.success && result.error === 'File was not valid JSON.') {
			return {
				success: false,
				error: 'package.json found in this GitHub repository was not valid JSON.'
			};
		}

		return result;
	}

	// the ternary is here so that we will only wait when the query parameters are actually there
	const github_result = $derived(
		github_info ? eval_github_package_json(await get_repo_package_json(github_info)) : null
	);

	// we prioritize github result over the result of the form submission, this is fine because:
	// 1. if JS is enabled we simply override the value of the variable with the new scan (which means the UI will update with the new scan result)
	// 2. if JS is not enabled the form submission will navigate to the remote function URL which will override the github search params
	let scan_result = $derived(
		github_result ? (github_result.success ? github_result : null) : scan_package_json_file.result
	);
	let scan_error = $derived(
		github_result
			? github_result.success
				? ''
				: github_result.error
			: scan_package_json_file.fields.package_json.issues()?.[0]?.message || ''
	);

	function package_href(package_name: string) {
		return resolve('/[...pkg=package_name]', { pkg: package_name });
	}

	function add_view_transition_name(link: HTMLAnchorElement) {
		const package_name = link.querySelector<HTMLElement>('.package-name');
		package_name?.style.setProperty('view-transition-name', 'package-name');
	}

	function handle_scan_again(event: MouseEvent) {
		event.preventDefault();
		scan_result = null;
		scan_error = '';
		file_name = '';
		dragging_file = false;
	}

	async function handle_file_change(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		if (file) {
			const text = await file.text();
			const result = eval_package_json(text);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				file_name = file.name;
			} else {
				scan_error = result.error;
			}
		}
	}

	function is_paste_package_json(package_json: string) {
		try {
			JSON.parse(package_json);
			return true;
		} catch {
			return false;
		}
	}

	async function handle_paste(event: ClipboardEvent) {
		const package_json = event.clipboardData?.getData('text/plain')?.trim();
		const file = event.clipboardData?.files[0];

		if (package_json && is_paste_package_json(package_json)) {
			const result = eval_package_json(package_json);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				file_name = '';
				dragging_file = false;
				return;
			}
			scan_error = result.error;
		}

		if (file && file?.type === 'application/json') {
			const text = await file.text();
			const result = eval_package_json(text);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				file_name = '';
				dragging_file = false;
			} else {
				scan_error = result.error;
			}
		}

		// TODO: Handle pasted file path
	}

	function is_dragging_file(event: DragEvent) {
		return Array.from(event.dataTransfer?.types ?? []).includes('Files');
	}

	function handle_dragenter(event: DragEvent) {
		if (is_dragging_file(event)) {
			dragging_file = true;
		}
	}

	function handle_dragover(event: DragEvent) {
		event.preventDefault();
		if (is_dragging_file(event)) {
			dragging_file = true;
		}
	}

	function handle_dragleave(event: DragEvent) {
		if (
			event.clientX <= 0 ||
			event.clientY <= 0 ||
			event.clientX >= innerWidth ||
			event.clientY >= innerHeight
		) {
			dragging_file = false;
		}
	}

	async function handle_drop(event: DragEvent) {
		event.preventDefault();
		dragging_file = false;
		const file = event.dataTransfer?.files[0];
		if (file && file.type === 'application/json') {
			const text = await file.text();
			const result = eval_package_json(text);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				file_name = file.name;
			} else {
				scan_error = result.error;
			}
		}
	}
</script>

<svelte:window
	ondragenter={handle_dragenter}
	ondragover={handle_dragover}
	ondragleave={handle_dragleave}
	ondrop={handle_drop}
	onpaste={handle_paste}
/>

<svelte:head>
	<title>Scan package.json - replacements.fyi</title>
	<meta name="description" content="Scan a package.json for replacements." />
</svelte:head>

<a href={resolve('/')} class="back-link"><ReplacementsTitle /></a>

<main class="page">
	<header class="header">
		<p class="comment">// package.json</p>
		<h1>Package Directory</h1>
		<p class="count">Scan package.json for replacements</p>
	</header>

	{#if !scan_result || scan_error}
		<div class="paste-here">
			<p>Paste the content of your package.json or</p>
		</div>
	{/if}
	<form
		{...scan_package_json_file.enhance(() => {
			// prevents the form to submit when JS is available since we handle that on file change
		})}
		enctype="multipart/form-data"
	>
		{#if scan_result && !scan_error && !dragging_file}
			<p class="scan-again-copy">
				<a href={resolve('/package-json')} onclick={handle_scan_again}>Click here</a> to scan another
				package.json, or paste/drop one onto this page.
			</p>
		{:else}
			<div class="package-json-upload">
				<FileInput
					name="package_json"
					required
					accept="application/json,.json"
					placeholder={!file_name}
					selected={Boolean(file_name)}
					aria-label="Upload package.json"
					onchange={handle_file_change}
				>
					<span class="file-input-prompt">
						<span>Drag a file or</span>
						<span class="file-input-action">Select Here</span>
					</span>
				</FileInput>
			</div>
			<div class={['scan-submit-row', { browser }]}>
				<button class="no-js-submit" type="submit">Scan package.json</button>
			</div>
		{/if}
		{#if scan_error}
			<p class="error" role="alert">
				<span class="error-label">// error</span>
				<span>{scan_error}</span>
			</p>
		{/if}
	</form>

	{#if scan_result && !scan_error}
		<section class="results" aria-live="polite">
			<header class="results-header">
				<p class="comment">// scan complete</p>
				<h2>
					{scan_result.replacements.length > 0
						? `Found ${scan_result.replacements.length} replacements`
						: '🎉 Your dependencies look good!🎉'}
				</h2>
				<p class="count">
					Checked {scan_result.checked} packages from package.json
				</p>
			</header>

			{#if scan_result.replacements.length > 0}
				<ul class="replacement-list">
					{#each scan_result.replacements as replacement, i (replacement.dep)}
						<li style:--i={i}>
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								onclick={(e) => {
									add_view_transition_name(e.currentTarget);
								}}
								href={package_href(replacement.replacement.moduleName)}
								class="replacement-link"
							>
								<span class="replacement-copy">
									<span class="package-name">{replacement.dep}</span>
									<span class="replacement-target"
										>{replacement.replacement.replacements.length} replacement option{replacement
											.replacement.replacements.length === 1
											? ''
											: 's'}</span
									>
								</span>
								<span class="details-link">View details →</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty-state">
					<img
						class="empty-gif"
						src="/clean-package.gif"
						alt="A person celebrating at a computer"
						width="260"
						height="195"
					/>
					<div class="empty-content">
						<p class="empty-label">scan complete</p>
						<h3>No replaceable dependencies found</h3>
						<p class="empty-copy">
							No packages with native replacements or more performant alternatives were found. Nice
							work.
						</p>
						<a href={resolve('/packages')} class="empty-link">Browse all known replacements →</a>
					</div>
				</div>
			{/if}
		</section>
	{/if}
</main>

<style>
	.page {
		min-height: 100vh;
		color: var(--text);
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem;
	}

	.back-link {
		color: var(--accent);
		font-size: 1rem;
		display: inline-block;
		margin: 1.5rem;
	}

	a {
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.header {
		margin-bottom: 2rem;
	}

	.comment {
		color: var(--subtle);
		font-size: 0.8rem;
		margin: 0 0 0.25rem;
	}

	h1,
	h2 {
		color: var(--text);
		font-weight: 700;
		margin: 0.25rem 0 0.5rem;
	}

	h1 {
		font-size: 2rem;
	}

	h2 {
		font-size: 1.25rem;
	}

	.count {
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0;
	}

	.paste-here {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 3.5rem;
		margin: 0 0 1.5rem;
		color: var(--text);
		font-size: 0.95rem;
		line-height: 1.5;
		p {
			margin: 0;
			text-align: center;
		}
	}

	.package-json-upload {
		margin-bottom: 0.45rem;
		& {
			min-height: 2.5rem;
			overflow: hidden;
			interpolate-size: allow-keywords;
			--timing: 0.3s;
			transition:
				opacity var(--timing),
				height var(--timing) allow-discrete,
				display var(--timing) allow-discrete;

			@starting-style {
				height: 0;
				opacity: 0;
			}
		}
	}

	.package-json-upload :global(.file-input) {
		margin-bottom: 0;
	}

	.scan-again-copy {
		color: var(--muted);
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0 0 1.5rem;
		text-align: center;
	}

	.scan-again-copy a {
		color: var(--accent);
		font-weight: 700;
	}

	.scan-again-copy a:hover,
	.scan-again-copy a:focus-visible {
		color: var(--accent-hover);
		text-decoration: underline;
	}

	.scan-submit-row {
		display: flex;
		justify-content: stretch;
		margin: 0 0 1.5rem;
	}
	.browser {
		display: none;
	}
	form:has(:global(input:invalid)) {
		.scan-submit-row {
			display: none;
		}
	}

	.no-js-submit {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		padding: 0.4rem 1rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: color-mix(in srgb, var(--accent) 10%, transparent);
		color: var(--accent-contrast);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1;
		transition:
			color 0.15s,
			background 0.15s,
			border-color 0.15s;
	}

	.no-js-submit:hover,
	.no-js-submit:focus-visible {
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		border-color: var(--border);
		color: var(--accent-contrast);
	}

	.no-js-submit:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.error {
		display: grid;
		gap: 0.35rem;
		margin: -0.5rem 0 1.5rem;
		padding: 0.875rem 1rem;
		border: 1px solid color-mix(in srgb, #dc2626 45%, var(--border));
		border-radius: 6px;
		background: color-mix(in srgb, #dc2626 8%, var(--surface));
		color: var(--text);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.error-label {
		color: #dc2626;
		font-size: 0.75rem;
	}

	.results {
		margin-top: 2rem;
		animation: results-in 0.35s ease-out both;
	}

	.results-header {
		margin-bottom: 1rem;
	}

	@keyframes results-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}

	@keyframes item-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.results,
		.replacement-list li,
		.empty-state {
			animation: none;
		}
	}

	.replacement-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
	}

	.replacement-list li {
		animation: item-in 0.3s ease-out both;
		animation-delay: calc(0.15s + var(--i, 0) * 0.04s);
	}

	.empty-state {
		animation: item-in 0.35s ease-out 0.15s both;
	}

	.replacement-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
		color: var(--text);
		text-decoration: none;
		transition: background 0.15s;
	}

	.replacement-list li:last-child .replacement-link {
		border-bottom: none;
	}

	.replacement-link:hover {
		background: var(--code-bg);
	}

	.replacement-copy {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}

	.package-name {
		color: var(--accent);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.replacement-target {
		color: var(--muted);
		font-size: 0.8rem;
		overflow-wrap: anywhere;
	}

	.details-link {
		color: var(--accent);
		font-size: 0.8rem;
		white-space: nowrap;
	}

	.replacement-link:hover .details-link {
		color: var(--accent-hover);
		text-decoration: underline;
	}

	.empty-state {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr);
		align-items: center;
		gap: 1rem;
		margin: 0;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
	}

	.empty-gif {
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 3;
		border-radius: 4px;
		object-fit: cover;
	}

	.empty-content {
		min-width: 0;
	}

	.empty-label {
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.4;
		margin: 0 0 0.35rem;
		text-transform: uppercase;
	}

	.empty-content h3 {
		color: var(--text);
		font-size: 1.1rem;
		line-height: 1.35;
		margin: 0 0 0.4rem;
	}

	.empty-copy {
		color: var(--muted);
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0 0 0.75rem;
	}

	.empty-link {
		color: var(--accent);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.empty-link:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}

	.file-input-prompt {
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

	.file-input-action {
		color: var(--accent);
		font-weight: 700;
	}

	@media (max-width: 520px) {
		.replacement-link {
			align-items: flex-start;
			flex-direction: column;
		}

		.empty-state {
			grid-template-columns: 1fr;
		}

		.file-input-prompt {
			min-height: 4.75rem;
			padding: 1rem;
		}

		.empty-gif {
			max-width: 260px;
		}
	}
</style>

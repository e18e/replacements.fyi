<script lang="ts">
	import { resolve } from '$app/paths';
	import FileInput from '$lib/FileInput.svelte';
	import PackageJsonPasteStatus from '$lib/PackageJsonPasteStatus.svelte';
	import ReplacementsTitle from '$lib/ReplacementsTitle.svelte';
	import { eval_package_json } from '$lib/package-json-scan';
	import { scopify } from '$lib/utils';

	import { scan_package_json_file } from './data.remote';

	let file_name = $state('');
	let pasted_successfully = $state(false);

	// TODO: Add loading state
	let scan_result = $derived(scan_package_json_file.result);
	let scan_error = $derived(
		scan_package_json_file.fields.package_json.issues()?.[0]?.message || ''
	);

	function package_href(package_name: string) {
		return resolve('/[[scope=scope]]/[package]', scopify(package_name));
	}

	function add_view_transition_name(link: HTMLAnchorElement) {
		const package_name = link.querySelector<HTMLElement>('.package-name');
		package_name?.style.setProperty('view-transition-name', 'package-name');
	}

	function handle_file_change(event: Event & { currentTarget: HTMLInputElement }) {
		file_name = event.currentTarget.files?.[0]?.name ?? '';
		pasted_successfully = false;
		event.currentTarget.form?.requestSubmit();
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
				pasted_successfully = true;
				file_name = '';
				return;
			}
			scan_error = result.error;
			pasted_successfully = false;
		}

		if (file && file?.type === 'application/json') {
			const text = await file.text();
			const result = eval_package_json(text);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				pasted_successfully = true;
				file_name = '';
			} else {
				scan_error = result.error;
				pasted_successfully = false;
			}
		}

		// TODO: Handle pasted file path
	}

	function handle_dragover(event: DragEvent) {
		event.preventDefault();
	}

	async function handle_drop(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (file && file.type === 'application/json') {
			const text = await file.text();
			const result = eval_package_json(text);
			if (result.success) {
				scan_result = result;
				scan_error = '';
				file_name = file.name;
				pasted_successfully = false;
			} else {
				scan_error = result.error;
				pasted_successfully = false;
			}
		}
	}
</script>

<svelte:window ondragover={handle_dragover} ondrop={handle_drop} onpaste={handle_paste} />

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

	<form {...scan_package_json_file} enctype="multipart/form-data">
		<FileInput
			name="package_json"
			accept="application/json,.json"
			placeholder={!file_name}
			selected={Boolean(file_name)}
			aria-label="Upload package.json"
			onchange={handle_file_change}
		>
			<span class="file-input-prompt">
				<span>Drag file or</span>
				<span class="file-input-action">Select Here</span>
			</span>
			{#if file_name}
				<span class="file-input-selection">
					<svg
						class="file-input-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						viewBox="0 0 16 16"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM4.151 15.29a1.2 1.2 0 0 1-.111-.449h.764a.58.58 0 0 0 .255.384q.105.073.25.114.142.041.319.041.245 0 .413-.07a.56.56 0 0 0 .255-.193.5.5 0 0 0 .084-.29.39.39 0 0 0-.152-.326q-.152-.12-.463-.193l-.618-.143a1.7 1.7 0 0 1-.539-.214 1 1 0 0 1-.352-.367 1.1 1.1 0 0 1-.123-.524q0-.366.19-.639.192-.272.528-.422.337-.15.777-.149.456 0 .779.152.326.153.5.41.18.255.2.566h-.75a.56.56 0 0 0-.12-.258.6.6 0 0 0-.246-.181.9.9 0 0 0-.37-.068q-.324 0-.512.152a.47.47 0 0 0-.185.384q0 .18.144.3a1 1 0 0 0 .404.175l.621.143q.326.075.566.211a1 1 0 0 1 .375.358q.135.222.135.56 0 .37-.188.656a1.2 1.2 0 0 1-.539.439q-.351.158-.858.158-.381 0-.665-.09a1.4 1.4 0 0 1-.478-.252 1.1 1.1 0 0 1-.29-.375m-3.104-.033a1.3 1.3 0 0 1-.082-.466h.764a.6.6 0 0 0 .074.27.5.5 0 0 0 .454.246q.285 0 .422-.164.137-.165.137-.466v-2.745h.791v2.725q0 .66-.357 1.005-.355.345-.985.345a1.6 1.6 0 0 1-.568-.094 1.15 1.15 0 0 1-.407-.266 1.1 1.1 0 0 1-.243-.39m9.091-1.585v.522q0 .384-.117.641a.86.86 0 0 1-.322.387.9.9 0 0 1-.47.126.9.9 0 0 1-.47-.126.87.87 0 0 1-.32-.387 1.55 1.55 0 0 1-.117-.641v-.522q0-.386.117-.641a.87.87 0 0 1 .32-.387.87.87 0 0 1 .47-.129q.265 0 .47.129a.86.86 0 0 1 .322.387q.117.255.117.641m.803.519v-.513q0-.565-.205-.973a1.46 1.46 0 0 0-.59-.63q-.38-.22-.916-.22-.534 0-.92.22a1.44 1.44 0 0 0-.589.628q-.205.407-.205.975v.513q0 .562.205.973.205.407.589.626.386.217.92.217.536 0 .917-.217.384-.22.589-.626.204-.41.205-.973m1.29-.935v2.675h-.746v-3.999h.662l1.752 2.66h.032v-2.66h.75v4h-.656l-1.761-2.676z"
						/>
					</svg>
					<span class="file-input-name">{file_name}</span>
				</span>
			{/if}
		</FileInput>
		<noscript>
			<span class="no-js-submit-row">
				<button class="no-js-submit" type="submit">Scan package.json</button>
			</span>
		</noscript>
		{#if scan_error}
			<p class="error" role="alert">
				<span class="error-label">// error</span>
				<span>{scan_error}</span>
			</p>
		{/if}
	</form>

	<PackageJsonPasteStatus pasted={pasted_successfully} />

	{#if scan_result}
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
					{#each scan_result.replacements as replacement (replacement.dep)}
						<li>
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

	.no-js-submit-row {
		display: flex;
		justify-content: flex-end;
		margin: 0 0 1.5rem;
	}

	.no-js-submit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 0.9rem;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--accent);
		color: var(--surface);
		cursor: pointer;
		font: inherit;
		font-weight: 700;
		line-height: 1;
	}

	.no-js-submit:hover,
	.no-js-submit:focus-visible {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
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
	}

	.results-header {
		margin-bottom: 1rem;
	}

	.replacement-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--border);
		border-radius: 6px;
		overflow: hidden;
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

	@media (max-width: 520px) {
		.replacement-link {
			align-items: flex-start;
			flex-direction: column;
		}

		.empty-state {
			grid-template-columns: 1fr;
		}

		.empty-gif {
			max-width: 260px;
		}
	}
</style>

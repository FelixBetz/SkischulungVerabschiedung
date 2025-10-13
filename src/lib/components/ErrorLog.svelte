<script lang="ts">
	import type { ErrorEntry } from '$lib/stores/errorStore';

	let errors: ErrorEntry[] = $state([]);
	//let loading = $state(false);
	let filterType: 'all' | 'error' | 'warning' = $state('all');
	let filterSource: string = $state('');

	// Available sources for filtering
	let availableSources: string[] = $state([]);

	async function loadErrors() {
		try {
			//loading = true;

			// Build query parameters
			const queryParams: string[] = [];
			if (filterType !== 'all') {
				queryParams.push(`type=${encodeURIComponent(filterType)}`);
			}
			if (filterSource) {
				queryParams.push(`source=${encodeURIComponent(filterSource)}`);
			}
			const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

			const response = await fetch(`/api/errors${queryString}`);
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					errors = result.data.errors;
					// Extract unique sources for filter dropdown
					const sources = new Set(errors.map((e) => e.source));
					availableSources = Array.from(sources).sort();
				}
			}
		} catch (err) {
			console.error('Error loading error log:', err);
		} finally {
			//loading = false;
		}
	}

	async function clearErrors(type?: 'error' | 'warning', source?: string) {
		try {
			const queryParams: string[] = [];
			if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
			if (source) queryParams.push(`source=${encodeURIComponent(source)}`);
			const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

			const response = await fetch(`/api/errors${queryString}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadErrors(); // Refresh the list
			}
		} catch (err) {
			console.error('Error clearing errors:', err);
		}
	}

	async function removeError(errorId: string) {
		try {
			const queryString = `?id=${encodeURIComponent(errorId)}`;

			const response = await fetch(`/api/errors${queryString}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadErrors(); // Refresh the list
			}
		} catch (err) {
			console.error('Error removing error:', err);
		}
	}

	// Load errors on mount and set up auto-refresh
	$effect(() => {
		loadErrors();
		const interval = setInterval(loadErrors, 5000); // Refresh every 5 seconds
		return () => clearInterval(interval);
	});

	// Reload when filters change
	$effect(() => {
		loadErrors();
	});

	function formatTimestamp(timestamp: Date): string {
		return new Date(timestamp).toLocaleString();
	}

	function getErrorIcon(type: 'error' | 'warning'): string {
		return type === 'error' ? '🚨' : '⚠️';
	}

	function getErrorColor(type: 'error' | 'warning'): string {
		return type === 'error' ? 'border-red-500 bg-red-900/20' : 'border-yellow-500 bg-yellow-900/20';
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold text-orange-300">System Errors & Warnings</h2>
		<div class="flex items-center gap-2">
			<button
				onclick={() => loadErrors()}
				class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
			>
				Refresh
			</button>
			<button
				onclick={() => clearErrors()}
				class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
			>
				Clear All
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-4">
		<div class="flex items-center gap-2">
			<label for="type-filter" class="text-sm text-gray-300">Type:</label>
			<select
				id="type-filter"
				bind:value={filterType}
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
			>
				<option value="all">All</option>
				<option value="error">Errors</option>
				<option value="warning">Warnings</option>
			</select>
		</div>

		<div class="flex items-center gap-2">
			<label for="source-filter" class="text-sm text-gray-300">Source:</label>
			<select
				id="source-filter"
				bind:value={filterSource}
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
			>
				<option value="">All Sources</option>
				{#each availableSources as source (source)}
					<option value={source}>{source}</option>
				{/each}
			</select>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={() =>
					clearErrors(filterType === 'all' ? undefined : filterType, filterSource || undefined)}
				disabled={errors.length === 0}
				class="rounded bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700 disabled:opacity-50"
			>
				Clear Filtered
			</button>
		</div>
	</div>

	<!-- Error Count -->
	<div class="text-sm text-gray-400">
		Showing {errors.length} items
		{#if filterType !== 'all' || filterSource}
			(filtered)
		{/if}
	</div>

	<!-- Error List -->
	<div class=" space-y-2 overflow-y-auto">
		{#if errors.length === 0}
			<div class="text-center text-gray-400">No errors or warnings found</div>
		{:else}
			{#each errors as error (error.id)}
				<div class="rounded border p-3 {getErrorColor(error.type)}">
					<div class="flex items-start justify-between">
						<div class="flex flex-1 items-start gap-3">
							<span class="text-lg">{getErrorIcon(error.type)}</span>
							<div class="flex-1">
								<div class="flex items-center gap-2 text-sm">
									<span class="font-medium text-white">{error.source}</span>
									<span class="text-gray-400">•</span>
									<span class="text-gray-400">{formatTimestamp(error.timestamp)}</span>
								</div>
								<p class="mt-1 text-white">{error.message}</p>
								{#if error.details}
									<details class="mt-2">
										<summary class="cursor-pointer text-xs text-gray-300 hover:text-white">
											Show details
										</summary>
										<pre
											class="mt-1 max-h-32 overflow-y-auto rounded bg-black/30 p-2 text-xs text-gray-300">{JSON.stringify(
												error.details,
												null,
												2
											)}</pre>
									</details>
								{/if}
							</div>
						</div>
						<button
							onclick={() => removeError(error.id)}
							class="text-gray-400 hover:text-white"
							title="Remove this error"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

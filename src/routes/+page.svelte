<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ScoreSidebar from '$lib/components/ScoreSidebar.svelte';
	import type { Team } from '$lib/types';

	let teams = $state<Team[]>([]);

	let loading = $state(true);
	let error: string | null = $state(null);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	async function loadTeams() {
		try {
			// Only show loading on initial load, not on subsequent updates
			if (teams.length === 0) {
				loading = true;
			}
			error = null;

			const response = await fetch('/api/teams');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (result.success && Array.isArray(result.data)) {
				teams = result.data;
			} else {
				throw new Error(result.error || 'Failed to load teams');
			}
		} catch (err) {
			console.error('Error loading teams:', err);
			error = err instanceof Error ? err.message : 'Failed to load teams';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		// Load teams immediately
		loadTeams();

		// Set up interval to load teams every second
		intervalId = setInterval(loadTeams, 5000);
	});

	onDestroy(() => {
		// Clean up interval when component is destroyed
		if (intervalId !== null) {
			clearInterval(intervalId);
		}
	});
</script>

<svelte:head>
	<title>Skischulung Verabschiedung</title>
	<meta name="description" content="Skischulung farewell event" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-mono">
	<!-- Animated background -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		{#each Array(20) as _, i}
			<div
				class="absolute h-1 w-1 animate-pulse rounded-full bg-white"
				style="top: {Math.random() * 100}%; left: {Math.random() *
					100}%; animation-delay: {Math.random() * 2}s;"
			></div>
		{/each}
	</div>

	<div class="relative z-10 flex min-h-screen">
		{#if loading}
			<!-- Loading sidebar -->
			<div
				class="flex w-80 items-center justify-center border-r-4 border-cyan-400 bg-black shadow-2xl"
			>
				<div class="text-center">
					<div class="mb-4 text-lg font-bold text-cyan-400">Lade Teams...</div>
					<div
						class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
					></div>
				</div>
			</div>
		{:else if error}
			<!-- Error sidebar -->
			<div
				class="flex w-80 items-center justify-center border-r-4 border-red-400 bg-black shadow-2xl"
			>
				<div class="px-4 text-center">
					<div class="mb-2 text-lg font-bold text-red-400">Fehler!</div>
					<div class="mb-4 text-sm text-red-300">{error}</div>
					<button
						onclick={loadTeams}
						class="border-2 border-red-400 bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-500"
					>
						Erneut versuchen
					</button>
				</div>
			</div>
		{:else}
			<ScoreSidebar {teams} />
		{/if}

		<!-- Main content area -->
		<div class="flex flex-1 items-center justify-center p-8">
			<div class="max-w-4xl text-center">
				<!-- Main title -->
				<div class="mb-16">
					<h1
						class="mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-8xl font-black tracking-wider text-transparent drop-shadow-2xl"
					>
						Skischulung 2025
					</h1>
					<h2
						class="mb-4 bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-6xl font-black tracking-wider text-transparent"
					>
						Vearschiedung Felix Betz
					</h2>
					<div class="text-2xl font-bold tracking-[0.3em] text-cyan-400">◆ ◇ ◆ ◇ ◆ ◇ ◆</div>
				</div>
			</div>
		</div>
	</div>
</div>

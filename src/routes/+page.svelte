<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ScoreSidebar from '$lib/components/ScoreSidebar.svelte';
	import Welcome from '$lib/components/Welcome.svelte';
	import Game1 from '$lib/components/Game1.svelte';
	import Game2 from '$lib/components/Game2.svelte';
	import Game3 from '$lib/components/Game3.svelte';
	import Game4 from '$lib/components/Game4.svelte';
	import Game5 from '$lib/components/Game5.svelte';
	import type { Team } from '$lib/types';
	import { GameState } from '$lib/types';

	let teams = $state<Team[]>([]);
	let currentGameState: GameState = $state(GameState.HOME);

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

	async function loadGameState() {
		try {
			const response = await fetch('/api/gamestate');
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					currentGameState = result.data.currentState;
				}
			}
		} catch (err) {
			console.error('Error loading game state:', err);
		}
	}

	onMount(() => {
		// Load teams and game state immediately
		loadTeams();
		loadGameState();

		// Set up interval to load teams and game state
		intervalId = setInterval(() => {
			loadTeams();
			loadGameState();
		}, 500);
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
		{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}
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
			<!-- Dynamic content based on game state -->
			{#if currentGameState === GameState.HOME}
				<Welcome />
			{:else if currentGameState === GameState.GAME1}
				<Game1 {teams} />
			{:else if currentGameState === GameState.GAME2}
				<Game2 {teams} />
			{:else if currentGameState === GameState.GAME3}
				<Game3 {teams} />
			{:else if currentGameState === GameState.GAME4}
				<Game4 {teams} />
			{:else if currentGameState === GameState.GAME5}
				<Game5 {teams} />
			{/if}
		</div>
	</div>
</div>

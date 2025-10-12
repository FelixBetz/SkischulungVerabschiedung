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

	let intervalId: ReturnType<typeof setInterval> | null = null;

	async function loadTeams() {
		const response = await fetch('/api/teams');
		if (!response.ok) {
			teams = [];
		}

		const result = await response.json();
		if (result.success && Array.isArray(result.data)) {
			teams = result.data;
		} else {
			teams = [];
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
		<ScoreSidebar {teams} />

		<!-- Main content area -->
		<div class="flex flex-1 items-center justify-center">
			<!-- Dynamic content based on game state -->
			{#if currentGameState === GameState.HOME}
				<Welcome />
			{:else if currentGameState === GameState.GAME1}
				<Game1 {teams} />
			{:else if currentGameState === GameState.GAME2}
				<Game2 />
			{:else if currentGameState === GameState.GAME3}
				<Game3 />
			{:else if currentGameState === GameState.GAME4}
				<Game4 />
			{:else if currentGameState === GameState.GAME5}
				<Game5 />
			{/if}
		</div>
	</div>
</div>

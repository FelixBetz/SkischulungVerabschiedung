<script lang="ts">
	import type { Team, Game1State, Game1Action } from '$lib/types';
	import { Game1ActionType } from '$lib/types';

	let { teams = [] }: { teams: Team[] } = $props();

	// Game state from API
	let gameState = $state<Game1State>({
		gameStarted: false,
		orderedWords: ['Sonne'],
		remainingWords: [],
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1
	});

	// Admin-specific state - removed, now using gameState.selectedPosition

	// Load game state on component mount
	$effect(() => {
		loadGameState();
		// Set up polling to keep state synchronized
		const interval = setInterval(loadGameState, 1000);
		return () => clearInterval(interval);
	});

	async function loadGameState() {
		try {
			const response = await fetch('/api/game1');
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					gameState = result.data;
				}
			}
		} catch (err) {
			console.error('Error loading game state:', err);
		}
	}

	async function gameAction(action: Game1Action): Promise<void> {
		try {
			const response = await fetch('/api/game1', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(action)
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					gameState = result.data;
				}
			}
		} catch (err) {
			console.error('Error performing game action:', err);
		}
	}
</script>

<div class="rounded-lg border-2 border-orange-400 bg-gray-800 p-6">
	<h2 class="mb-4 text-2xl font-bold text-orange-400">Game 1: Wörter ordnen - Admin</h2>

	<!-- Game Control Section -->
	<div class="mb-6 rounded border border-orange-300 bg-orange-900/20 p-4">
		<h3 class="mb-3 text-lg font-bold text-orange-300">Spiel-Steuerung</h3>

		<div class="mb-4 flex flex-wrap gap-2">
			{#if !gameState.gameStarted}
				<button
					onclick={() => gameAction({ type: Game1ActionType.START_GAME })}
					class="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-500"
				>
					Spiel starten
				</button>
			{:else}
				<button
					onclick={() => gameAction({ type: Game1ActionType.RESET_GAME })}
					class="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
				>
					Spiel zurücksetzen
				</button>
			{/if}
		</div>
	</div>

	<!-- Word Placement Control -->
	{#if gameState.gameStarted}
		<div class="mb-6 rounded border border-orange-300 bg-orange-900/20 p-4">
			<!-- Available Words -->
			<div class="mb-4">
				<h4 class="mb-2 text-sm font-bold text-orange-200">Verfügbare Wörter:</h4>
				<div class="flex flex-wrap gap-2">
					{#each gameState.remainingWords as word (word)}
						<button
							onclick={() => gameAction({ type: Game1ActionType.SELECT_WORD, word })}
							class="rounded border-2 px-3 py-1 text-sm font-bold transition-all {gameState.selectedWord ===
							word
								? 'border-orange-400 bg-orange-600 text-white'
								: 'border-gray-600 bg-gray-800 text-gray-300 hover:border-orange-400'}"
						>
							{word}
						</button>
					{/each}
				</div>
			</div>

			<!-- Position Buttons -->
			<div class="mb-4">
				<h4 class="mb-2 text-sm font-bold text-orange-200">Position wählen:</h4>
				<div class="flex flex-wrap gap-2">
					{#each Array.from({ length: gameState.orderedWords.length + 1 }, (_, i) => i + 1) as position (position)}
						<button
							onclick={() =>
								gameAction({ type: Game1ActionType.SELECT_POSITION, position: position - 1 })}
							class="flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-all {gameState.selectedPosition ===
							position - 1
								? 'border-orange-400 bg-orange-600 text-white'
								: 'cursor-pointer border-gray-600 bg-gray-800 text-gray-300 hover:border-orange-400'}"
						>
							{position}
						</button>
					{/each}
				</div>
			</div>

			<!-- Platzieren Button -->
			<div class="mb-4">
				<button
					onclick={() => {
						if (gameState.selectedWord && gameState.selectedPosition !== -1) {
							gameAction({
								type: Game1ActionType.INSERT_WORD,
								word: gameState.selectedWord,
								position: gameState.selectedPosition,
								teamCount: teams.length
							});
						}
					}}
					disabled={!gameState.selectedWord || gameState.selectedPosition === -1}
					class="rounded bg-green-600 px-6 py-2 font-bold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50"
				>
					Platzieren
				</button>
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import type { Game1State } from '$lib/types';

	// Game state from API
	let gameState = $state<Game1State>({
		gameStarted: false,
		orderedWords: ['Sonne'],
		remainingWords: [],
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: 'general'
	});

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
</script>

<div class="flex flex-1 p-8" style="background-color: rgba(255, 165, 0, 0.3);">
	<div class="mx-auto w-full max-w-7xl">
		<!-- Header -->
		<div class="mb-4 text-center">
			<h1 class="mb-1 text-4xl font-black text-orange-400">Game 1: Wörter ordnen</h1>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Word Sequence -->
			<div class="space-y-2">
				<h2 class="mb-3 text-2xl font-bold text-orange-300">Wort-Reihenfolge</h2>

				<div class="space-y-1">
					{#each Array.from({ length: gameState.orderedWords.length + 1 }, (_, i) => i) as position, index (position)}
						{#if position < gameState.orderedWords.length}
							<!-- Position button -->
							<div class="flex items-center" style="margin-top: -10px;">
								<button
									disabled={gameState.selectedPosition === index}
									class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all {gameState.selectedPosition ===
									position
										? 'border-orange-400 bg-orange-600 text-white'
										: 'cursor-not-allowed border-gray-600 bg-gray-800 text-gray-500 opacity-50'}"
								>
									{position + 1}
								</button>
							</div>

							<!-- Word -->
							<div class="ml-8 flex items-center" style="margin-top: -15px;">
								<div class="flex-1 border border-gray-600 bg-gray-700 p-2 font-semibold text-white">
									{gameState.orderedWords[position]}
								</div>
							</div>
						{:else}
							<!-- Final position button -->
							<div class="flex items-center" style="margin-top: -15px;">
								<button
									disabled={!gameState.selectedWord}
									class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all {gameState.selectedPosition ===
									position
										? 'border-orange-400 bg-orange-600 text-white'
										: 'cursor-not-allowed border-gray-600 bg-gray-800 text-gray-500 opacity-50'}"
								>
									{position + 1}
								</button>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Available Words -->
			<div class="space-y-4">
				<h2 class="mb-3 text-2xl font-bold text-orange-300">Verfügbare Wörter</h2>
				<div class="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto">
					{#each gameState.remainingWords as word (word)}
						<button
							class="border-2 p-3 text-left transition-all {gameState.selectedWord === word
								? 'border-orange-400 bg-orange-600 text-white'
								: 'border-gray-600 bg-gray-800 text-gray-300 hover:border-orange-400'}"
						>
							{word}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

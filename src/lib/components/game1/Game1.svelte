<script lang="ts">
	import type { Game1State } from '$lib/types';
	import { addError } from '$lib/stores/errorStore';

	// Game state from API
	let gameState = $state<Game1State>({
		gameStarted: false,
		orderedWords: ['Sonne'],
		remainingWords: [],
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: 'general',
		correctOrder: []
	});

	// Load game state on component mount
	$effect(() => {
		loadGameState();
		// Set up polling to keep state synchronized
		const interval = setInterval(loadGameState, 100);
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
			addError('error', 'game1', 'Error loading game state', err);
		}
	}
</script>

<div class="flex flex-1 p-8">
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

		<!-- Error Message Display -->
		{#if gameState.lastErrorMessage}
			<div class="mx-auto mt-6 max-w-2xl">
				<div class="rounded-lg border border-red-400 bg-red-900/20 p-4 text-red-200">
					<div class="flex items-start justify-between">
						<div class="flex items-start space-x-3">
							<svg
								class="mt-0.5 h-6 w-6 flex-shrink-0 text-red-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								></path>
							</svg>
							<div>
								<h3 class="font-bold text-red-300">Ungültige Platzierung!</h3>
								<p class="mt-1 text-sm">{gameState.lastErrorMessage}</p>
							</div>
						</div>
						<button
							onclick={() => {
								// This will be handled by the polling - the admin can clear the error
							}}
							class="ml-2 text-red-400 hover:text-red-300"
							title="Die Fehlermeldung wird automatisch ausgeblendet"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

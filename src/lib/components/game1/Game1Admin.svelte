<script lang="ts">
	import type { Team, Game1State, Game1Action } from '$lib/types';
	import { Game1ActionType } from '$lib/types';
	import type { WordSet } from '$lib/data/game1-loader';
	import { addError } from '$lib/stores/errorStore';

	let { teams = [] }: { teams: Team[] } = $props();

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

	// Word sets
	// Word sets
	let availableWordSets = $state<WordSet[]>([]);

	// Load game state and word sets on component mount
	$effect(() => {
		loadGameState();
		loadWordSets();
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
			addError('error', 'game1-admin', 'Error loading game state', err);
		}
	}

	async function loadWordSets() {
		try {
			const response = await fetch('/api/game1/wordsets');
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					availableWordSets = result.data;
				}
			}
		} catch (err) {
			addError('error', 'game1-admin', 'Error loading word sets', err);
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
			addError('error', 'game1-admin', 'Error performing game action', err);
		}
	}
</script>

<div class="rounded-lg border-2 border-orange-400 bg-gray-800 p-6">
	<h2 class="mb-4 text-2xl font-bold text-orange-400">Game 1: Wörter ordnen - Admin</h2>

	<!-- Game Control Section -->
	<div class="mb-6 rounded border border-orange-300 bg-orange-900/20 p-4">
		<h3 class="mb-3 text-lg font-bold text-orange-300">Spiel-Steuerung</h3>

		<!-- Word Set Selection -->
		{#if !gameState.gameStarted && availableWordSets.length > 0}
			<div class="mb-4">
				<label for="wordset-select" class="mb-2 block text-sm font-bold text-orange-200"
					>Wortliste wählen:</label
				>
				<select
					id="wordset-select"
					bind:value={gameState.currentWordSet}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						gameAction({ type: Game1ActionType.CHANGE_WORD_SET, wordSetId: target.value });
					}}
					class="rounded border-2 border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-orange-400"
				>
					{#each availableWordSets as wordSet (wordSet.id)}
						<option value={wordSet.id}>{wordSet.name}</option>
					{/each}
				</select>
			</div>
		{/if}

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

	<!-- Main Game Interface -->
	{#if gameState.gameStarted && gameState.correctOrder.length > 0}
		<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Left Side: Word Selection and Placement -->
			<div class="rounded border border-orange-300 bg-orange-900/20 p-4">
				<h4 class="mb-4 text-lg font-bold text-orange-300">Wörter auswählen & platzieren</h4>

				<!-- Available Words -->
				<div class="mb-6">
					<h5 class="mb-2 text-sm font-bold text-orange-200">Verfügbare Wörter:</h5>
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
					<h5 class="mb-2 text-sm font-bold text-orange-200">Position wählen:</h5>
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

				<!-- Error Message -->
				{#if gameState.lastErrorMessage}
					<div class="mt-3 rounded border border-red-400 bg-red-900/20 p-3 text-red-200">
						<div class="flex items-start justify-between">
							<div class="flex items-start space-x-2">
								<svg
									class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									></path>
								</svg>
								<p class="text-sm font-medium">{gameState.lastErrorMessage}</p>
							</div>
							<button
								onclick={() => gameAction({ type: Game1ActionType.CLEAR_ERROR })}
								class="ml-2 text-red-400 hover:text-red-300"
								title="Fehlermeldung schließen"
							>
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Side: Correct Order Reference -->
			<div class="rounded border border-blue-300 bg-blue-900/20 p-4">
				<h4 class="mb-3 text-lg font-bold text-blue-300">Korrekte Reihenfolge</h4>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each gameState.correctOrder as word, index (word)}
						{@const isPlaced = gameState.orderedWords.includes(word)}
						<div
							class="flex items-center rounded border px-3 py-2 transition-all {isPlaced
								? 'border-green-400 bg-green-800/30'
								: 'border-blue-400 bg-blue-800/30'}"
						>
							<span
								class="mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white {isPlaced
									? 'bg-green-600'
									: 'bg-blue-600'}"
							>
								{index + 1}
							</span>
							<span class="font-medium {isPlaced ? 'text-green-100' : 'text-blue-100'}">{word}</span
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

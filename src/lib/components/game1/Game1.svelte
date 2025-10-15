<script lang="ts">
	import type { Game1State } from '$lib/types';
	import { addError } from '$lib/stores/errorStore';
	import PositionButton from './PositionButton.svelte';

	// Game state from API
	let gameState = $state<Game1State>({
		gameStarted: false,
		orderedWords: ['Sonne'],
		remainingWords: [],
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: 'general',
		currentWordSetName: '',
		topLabel: 'Oben',
		botLabel: 'Unten',
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
			<h1 class="mb-1 text-4xl font-black text-orange-400">
				Ordnungssamt: {gameState.currentWordSetName} ordnen
			</h1>
		</div>

		{#if gameState.gameStarted}
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Word Sequence -->
				<div class="space-y-2">
					<!-- Top label as box -->
					<div class="mb-3 text-center">
						<div
							class="inline-block rounded border border-orange-400 bg-orange-600/20 px-3 py-1 text-sm font-medium text-orange-200"
						>
							{gameState.topLabel}
						</div>
					</div>

					<div class="space-y-1">
						{#each Array.from({ length: gameState.orderedWords.length + 1 }, (_, i) => i) as position (position)}
							{#if position < gameState.orderedWords.length}
								<PositionButton
									position={position + 1}
									isSelected={gameState.selectedPosition === position}
								/>

								<!-- Word -->
								<div class="ml-8 flex items-center" style="margin-top: -15px;">
									<div
										class="flex-1 border border-gray-600 bg-gray-700 p-2 font-semibold text-white"
									>
										{gameState.orderedWords[position]}
									</div>
								</div>
							{:else}
								<PositionButton
									position={position + 1}
									isSelected={gameState.selectedPosition === position}
								/>
							{/if}
						{/each}
					</div>

					<!-- Bottom label as box -->
					<div class="mt-3 text-center">
						<div
							class="inline-block rounded border border-orange-400 bg-orange-600/20 px-3 py-1 text-sm font-medium text-orange-200"
						>
							{gameState.botLabel}
						</div>
					</div>
				</div>

				<!-- Available Words -->
				<div class="space-y-4">
					<h2 class="mb-3 text-2xl font-bold text-orange-300">Sortiere ein</h2>
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
		{:else}
			<!-- Word ordering animation -->
			<div class="mx-auto flex h-96 w-full max-w-2xl flex-col items-center justify-center">
				<!-- Animated word blocks -->
				<div class="relative mb-12 h-64 w-full">
					<!-- Position markers (1, 2, 3, 4) -->
					<div class="absolute bottom-0 flex w-full justify-between px-8">
						{#each [1, 2, 3, 4] as position (position)}
							<div
								class="animate-pulse-position flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-400 bg-gray-800 text-sm font-bold text-orange-300"
								style="animation-delay: {(position - 1) * 0.2}s;"
							>
								{position}
							</div>
						{/each}
					</div>

					<!-- Animated word blocks -->
					<div class="absolute inset-0">
						<!-- Word block 1 -->
						<div
							class="animate-word-shuffle-1 absolute top-8 left-4 flex h-12 w-20 items-center justify-center rounded border-2 border-orange-400 bg-orange-600/20 text-xs font-bold text-orange-300"
						>
							Ordnung
						</div>

						<!-- Word block 2 -->
						<div
							class="animate-word-shuffle-2 absolute top-20 right-16 flex h-12 w-20 items-center justify-center rounded border-2 border-orange-500 bg-orange-500/20 text-xs font-bold text-orange-400"
						>
							Position
						</div>

						<!-- Word block 3 -->
						<div
							class="animate-word-shuffle-3 absolute top-32 left-12 flex h-12 w-20 items-center justify-center rounded border-2 border-orange-300 bg-orange-400/20 text-xs font-bold text-orange-200"
						>
							Liste
						</div>

						<!-- Word block 4 -->
						<div
							class="animate-word-shuffle-4 absolute top-44 right-8 flex h-12 w-20 items-center justify-center rounded border-2 border-orange-600 bg-orange-700/20 text-xs font-bold text-orange-400"
						>
							Sequenz
						</div>

						<!-- Flow arrows -->
						<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
							<div class="relative h-24 w-24">
								<!-- Arrow pointing to position 1 -->
								<svg
									class="animate-arrow-1 absolute -top-4 -left-8 h-6 w-6 text-orange-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>

								<!-- Arrow pointing to position 2 -->
								<svg
									class="animate-arrow-2 absolute -top-6 -right-2 h-5 w-5 rotate-45 text-orange-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>

								<!-- Arrow pointing to position 3 -->
								<svg
									class="animate-arrow-3 absolute -right-8 -bottom-4 h-6 w-6 rotate-90 text-orange-300"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>

								<!-- Arrow pointing to position 4 -->
								<svg
									class="animate-arrow-4 absolute -bottom-6 -left-2 h-5 w-5 rotate-135 text-orange-600"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									></path>
								</svg>

								<!-- Central organizing dot -->
								<div
									class="animate-center-pulse absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Minimal text -->
				<div class="text-center">
					<h2 class="animate-text-glow text-2xl font-light text-orange-300">
						Wörter werden sortiert...
					</h2>
				</div>
			</div>
		{/if}

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

<style>
	@keyframes pulse-position {
		0%,
		100% {
			transform: scale(1);
			border-color: rgb(251 146 60);
		}
		50% {
			transform: scale(1.2);
			border-color: rgb(254 215 170);
		}
	}

	@keyframes word-shuffle-1 {
		0% {
			transform: translateX(0px) translateY(0px);
		}
		25% {
			transform: translateX(200px) translateY(-30px);
		}
		50% {
			transform: translateX(300px) translateY(120px);
		}
		75% {
			transform: translateX(100px) translateY(60px);
		}
		100% {
			transform: translateX(0px) translateY(0px);
		}
	}

	@keyframes word-shuffle-2 {
		0% {
			transform: translateX(0px) translateY(0px);
		}
		25% {
			transform: translateX(-150px) translateY(80px);
		}
		50% {
			transform: translateX(-250px) translateY(-20px);
		}
		75% {
			transform: translateX(-50px) translateY(40px);
		}
		100% {
			transform: translateX(0px) translateY(0px);
		}
	}

	@keyframes word-shuffle-3 {
		0% {
			transform: translateX(0px) translateY(0px);
		}
		25% {
			transform: translateX(180px) translateY(-80px);
		}
		50% {
			transform: translateX(280px) translateY(60px);
		}
		75% {
			transform: translateX(80px) translateY(-20px);
		}
		100% {
			transform: translateX(0px) translateY(0px);
		}
	}

	@keyframes word-shuffle-4 {
		0% {
			transform: translateX(0px) translateY(0px);
		}
		25% {
			transform: translateX(-120px) translateY(-100px);
		}
		50% {
			transform: translateX(-220px) translateY(80px);
		}
		75% {
			transform: translateX(-20px) translateY(-40px);
		}
		100% {
			transform: translateX(0px) translateY(0px);
		}
	}

	@keyframes arrow-1 {
		0%,
		100% {
			transform: translateX(0) scale(1);
			opacity: 0.4;
		}
		50% {
			transform: translateX(8px) scale(1.2);
			opacity: 1;
		}
	}

	@keyframes arrow-2 {
		0%,
		100% {
			transform: rotate(45deg) translateX(0) scale(1);
			opacity: 0.5;
		}
		50% {
			transform: rotate(45deg) translateX(6px) scale(1.1);
			opacity: 1;
		}
	}

	@keyframes arrow-3 {
		0%,
		100% {
			transform: rotate(90deg) translateX(0) scale(1);
			opacity: 0.6;
		}
		50% {
			transform: rotate(90deg) translateX(8px) scale(1.2);
			opacity: 1;
		}
	}

	@keyframes arrow-4 {
		0%,
		100% {
			transform: rotate(135deg) translateX(0) scale(1);
			opacity: 0.3;
		}
		50% {
			transform: rotate(135deg) translateX(6px) scale(1.1);
			opacity: 0.9;
		}
	}

	@keyframes center-pulse {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.7;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.5);
			opacity: 1;
		}
	}

	@keyframes text-glow {
		0%,
		100% {
			text-shadow: 0 0 10px rgba(253, 186, 116, 0.5);
		}
		50% {
			text-shadow:
				0 0 20px rgba(253, 186, 116, 0.8),
				0 0 30px rgba(251, 146, 60, 0.6);
		}
	}

	.animate-pulse-position {
		animation: pulse-position 2s ease-in-out infinite;
	}

	.animate-word-shuffle-1 {
		animation: word-shuffle-1 25s ease-in-out infinite;
	}

	.animate-word-shuffle-2 {
		animation: word-shuffle-2 22s ease-in-out infinite;
	}

	.animate-word-shuffle-3 {
		animation: word-shuffle-3 28s ease-in-out infinite;
	}

	.animate-word-shuffle-4 {
		animation: word-shuffle-4 24s ease-in-out infinite;
	}

	.animate-arrow-1 {
		animation: arrow-1 2.5s ease-in-out infinite;
	}

	.animate-arrow-2 {
		animation: arrow-2 3s ease-in-out infinite;
	}

	.animate-arrow-3 {
		animation: arrow-3 2.8s ease-in-out infinite;
	}

	.animate-arrow-4 {
		animation: arrow-4 3.2s ease-in-out infinite;
	}

	.animate-center-pulse {
		animation: center-pulse 2s ease-in-out infinite;
	}

	.animate-text-glow {
		animation: text-glow 3s ease-in-out infinite;
	}
</style>

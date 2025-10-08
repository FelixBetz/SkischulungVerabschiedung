<script lang="ts">
	import { teamsStore } from '$lib/stores/teams.svelte.js';
	import { onMount } from 'svelte';
	import ScoreSidebar from '$lib/components/ScoreSidebar.svelte';

	onMount(() => {
		teamsStore.initializeSampleTeams();
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
		<ScoreSidebar />

		<!-- Main content area -->
		<div class="flex flex-1 items-center justify-center p-8">
			<div class="max-w-4xl text-center">
				<!-- Main title -->
				<div class="mb-16">
					<h1
						class="mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-8xl font-black tracking-wider text-transparent drop-shadow-2xl"
					>
						SKI
					</h1>
					<h2
						class="mb-4 bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-6xl font-black tracking-wider text-transparent"
					>
						CHALLENGE
					</h2>
					<div class="text-2xl font-bold tracking-[0.3em] text-cyan-400">◆ ◇ ◆ ◇ ◆ ◇ ◆</div>
				</div>

				<!-- Game status display -->
				<div
					class="mb-12 rounded-none border-4 border-cyan-400 bg-black/80 p-8 shadow-2xl shadow-cyan-400/20"
				>
					<div class="grid grid-cols-3 gap-8 text-center">
						<div class="border-r-2 border-gray-600 pr-8">
							<div class="mb-2 text-4xl font-bold text-yellow-400">⚡</div>
							<div class="text-xl font-bold text-white">AKTIV</div>
							<div class="text-sm text-gray-400">SYSTEM STATUS</div>
						</div>
						<div class="border-r-2 border-gray-600 pr-8">
							<div class="mb-2 text-4xl font-bold text-green-400">●</div>
							<div class="text-xl font-bold text-white">LIVE</div>
							<div class="text-sm text-gray-400">PUNKTESTAND</div>
						</div>
						<div>
							<div class="mb-2 text-4xl font-bold text-purple-400">4</div>
							<div class="text-xl font-bold text-white">TEAMS</div>
							<div class="text-sm text-gray-400">IM RENNEN</div>
						</div>
					</div>
				</div>

				<!-- Action buttons -->
				<div class="space-y-6">
					<button
						class="w-full transform border-4 border-cyan-300 bg-gradient-to-r from-cyan-500 to-blue-600 px-12 py-6 text-2xl font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-cyan-400 hover:to-blue-500"
					>
						► SPIEL STARTEN
					</button>
					<button
						class="w-full border-4 border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:from-purple-500 hover:to-pink-500"
					>
						⚙ EINSTELLUNGEN
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

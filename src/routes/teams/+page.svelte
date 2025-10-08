<script lang="ts">
	import { teamsStore } from '$lib/stores/teams.svelte.js';
	import { onMount } from 'svelte';

	const { teams } = teamsStore;

	onMount(() => {
		teamsStore.initializeSampleTeams();
	});
</script>

<svelte:head>
	<title>Teams</title>
	<meta name="description" content="View all teams" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-8 py-8">
	<h1 class="mb-8 text-center text-3xl font-bold text-gray-800">Teams</h1>

	{#if teams.length === 0}
		<p class="text-center text-gray-600 italic">No teams available yet.</p>
	{:else}
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each teams as team}
				<div
					class="rounded-lg bg-white p-6 text-center shadow-lg transition-transform hover:-translate-y-1"
				>
					<img
						src={team.iconUrl}
						alt="{team.name} icon"
						class="mx-auto mb-4 h-16 w-16 object-contain"
					/>
					<h3 class="mb-2 text-lg font-semibold text-gray-800">{team.name}</h3>
					<p class="text-xl font-bold text-blue-600">{team.points} Points</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

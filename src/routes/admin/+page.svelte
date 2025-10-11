<script lang="ts">
	import { onMount } from 'svelte';
	import type { Team } from '$lib/types.js';

	let teams: Team[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	let saveStatus: { [teamId: number]: 'saving' | 'saved' | 'error' } = $state({});

	async function loadTeams(forceLoading = false) {
		try {
			if (teams.length === 0 || forceLoading) {
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

	async function updateTeam(teamId: number, updates: { name?: string; points?: number }) {
		try {
			saveStatus[teamId] = 'saving';
			saveStatus = { ...saveStatus }; // Trigger reactivity

			const response = await fetch(`/api/teams/${teamId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || 'Failed to update team');
			}

			// Update local team data immediately with the server response
			if (result.data) {
				const teamIndex = teams.findIndex((t) => t.id === teamId);
				if (teamIndex !== -1) {
					teams[teamIndex] = result.data;
					teams = [...teams]; // Trigger reactivity
				}
			}

			saveStatus[teamId] = 'saved';
			setTimeout(() => {
				delete saveStatus[teamId];
				saveStatus = { ...saveStatus };
			}, 2000);
		} catch (err) {
			console.error('Error updating team:', err);
			saveStatus[teamId] = 'error';
			setTimeout(() => {
				delete saveStatus[teamId];
				saveStatus = { ...saveStatus };
			}, 3000);
		}
	}

	function handleNameChange(team: Team, event: Event) {
		const input = event.target as HTMLInputElement;
		const newName = input.value.trim();
		if (newName && newName !== team.name) {
			updateTeam(team.id, { name: newName });
		}
	}

	function handlePointsChange(team: Team, event: Event) {
		console.log('handlePointsChange called');

		const input = event.target as HTMLInputElement;
		const newPoints = parseInt(input.value);
		if (!isNaN(newPoints) && newPoints !== team.points) {
			updateTeam(team.id, { points: newPoints });
		}
	}

	onMount(() => {
		loadTeams();
	});
</script>

<svelte:head>
	<title>Admin Panel - Skischulung</title>
	<meta name="description" content="Skischulung admin panel for team management" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-mono">
	<!-- Header -->
	<div class="border-b-4 border-orange-400 bg-gradient-to-r from-orange-500 to-red-500 p-6">
		<div class="mx-auto flex max-w-6xl items-center justify-between">
			<div>
				<h1 class="text-3xl font-black tracking-wider text-white">ADMIN PANEL</h1>
				<p class="font-bold text-orange-100">Team Management System</p>
			</div>
			<div class="flex gap-3">
				<button
					onclick={() => loadTeams(true)}
					class="border-2 border-white bg-transparent px-4 py-2 font-bold text-white transition-colors hover:bg-white hover:text-orange-500"
					disabled={loading}
				>
					{loading ? '↻ Lädt...' : '↻ Aktualisieren'}
				</button>
				<a
					href="/"
					class="border-2 border-white bg-transparent px-4 py-2 font-bold text-white transition-colors hover:bg-white hover:text-orange-500"
				>
					← Zurück zur Hauptseite
				</a>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-6xl p-6">
		{#if loading}
			<div class="py-12 text-center">
				<div class="mb-4 text-xl font-bold text-orange-400">Lade Teams...</div>
				<div
					class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"
				></div>
			</div>
		{:else if error}
			<div class="py-12 text-center">
				<div class="mb-4 text-xl font-bold text-red-400">Fehler beim Laden!</div>
				<div class="mb-6 text-red-300">{error}</div>
				<button
					onclick={() => loadTeams()}
					class="border-2 border-red-400 bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-500"
				>
					Erneut versuchen
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each teams as team (team.id)}
					<div class="border-4 border-orange-400 bg-gray-800 p-6 shadow-lg">
						<!-- Team Icon and ID -->
						<div class="mb-4 flex items-center">
							<div
								class="mr-4 flex h-16 w-16 items-center justify-center border-2 border-gray-600 bg-black p-2"
							>
								<img
									src={team.iconUrl}
									alt="{team.name} icon"
									class="h-full w-full object-contain brightness-110 contrast-125 filter"
								/>
							</div>
							<div class="font-mono text-xs text-gray-400">
								ID: {team.id}
							</div>
						</div>

						<!-- Editable Team Name -->
						<div class="mb-4">
							<label for="name-{team.id}" class="mb-2 block text-sm font-bold text-orange-300">
								Team Name:
							</label>
							<input
								id="name-{team.id}"
								type="text"
								value={team.name}
								onblur={(e) => handleNameChange(team, e)}
								onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement)?.blur()}
								class="w-full border-2 border-gray-600 bg-gray-700 px-3 py-2 font-bold text-white transition-colors focus:border-orange-400 focus:outline-none"
								placeholder="Team Name"
							/>
						</div>

						<!-- Editable Points -->
						<div class="mb-4">
							<label for="points-{team.id}" class="mb-2 block text-sm font-bold text-orange-300">
								Punkte:
							</label>
							<input
								id="points-{team.id}"
								type="number"
								value={team.points}
								onblur={(e) => handlePointsChange(team, e)}
								onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement)?.blur()}
								class="w-full border-2 border-gray-600 bg-gray-700 px-3 py-2 font-bold text-white transition-colors focus:border-orange-400 focus:outline-none"
								placeholder="0"
							/>
						</div>

						<!-- Save Status -->
						{#if saveStatus[team.id]}
							<div class="py-2 text-center">
								{#if saveStatus[team.id] === 'saving'}
									<span class="text-sm text-yellow-400">● Speichert...</span>
								{:else if saveStatus[team.id] === 'saved'}
									<span class="text-sm text-green-400">✓ Gespeichert!</span>
								{:else if saveStatus[team.id] === 'error'}
									<span class="text-sm text-red-400">✗ Fehler beim Speichern</span>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			{#if teams.length === 0}
				<div class="py-12 text-center">
					<div class="text-xl text-gray-400">Keine Teams verfügbar</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

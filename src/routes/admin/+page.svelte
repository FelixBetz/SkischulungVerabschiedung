<script lang="ts">
	// Load teams from the API
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
			addError('error', 'admin-panel', 'Error loading teams', err);
			error = err instanceof Error ? err.message : 'Failed to load teams';
		} finally {
			loading = false;
		}
	}
	import { onMount } from 'svelte';
	import type { Team } from '$lib/types.js';
	import { GameState } from '$lib/types.js';
	import Game1Admin from '$lib/components/Game1/Game1Admin.svelte';
	import ErrorLog from '$lib/components/ErrorLog.svelte';
	import { addError } from '$lib/stores/errorStore';

	let teams: Team[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	let saveStatus: { [teamId: number]: 'saving' | 'saved' | 'error' } = $state({});
	let currentGameState: GameState = $state(GameState.HOME);

	// Handle hearts change and persist to API
	async function handleHeartsChange(team: Team, newHearts: number) {
		try {
			saveStatus[team.id] = 'saving';
			saveStatus = { ...saveStatus };

			const response = await fetch(`/api/teams/${team.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ hearts: newHearts })
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || 'Failed to update hearts');
			}

			// Update local team data immediately with the server response
			if (result.data) {
				const teamIndex = teams.findIndex((t) => t.id === team.id);
				if (teamIndex !== -1) {
					teams[teamIndex] = result.data;
					teams = [...teams];
				}
			}

			saveStatus[team.id] = 'saved';
			setTimeout(() => {
				delete saveStatus[team.id];
				saveStatus = { ...saveStatus };
			}, 2000);
		} catch (err) {
			addError('error', 'admin-panel', `Error updating hearts for team ${team.id}`, err);
			saveStatus[team.id] = 'error';
			setTimeout(() => {
				delete saveStatus[team.id];
				saveStatus = { ...saveStatus };
			}, 3000);
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
			addError('error', 'admin-panel', `Error updating team ${teamId}`, err);
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
		const input = event.target as HTMLInputElement;
		const newPoints = parseInt(input.value);
		if (!isNaN(newPoints) && newPoints !== team.points) {
			updateTeam(team.id, { points: newPoints });
		}
	}

	async function addPoints(teamId: number, pointsToAdd: number) {
		try {
			saveStatus[teamId] = 'saving';
			saveStatus = { ...saveStatus };

			const response = await fetch(`/api/teams/${teamId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ addPoints: pointsToAdd })
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || 'Failed to add points');
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
			addError('error', 'admin-panel', `Error adding points to team ${teamId}`, err);
			saveStatus[teamId] = 'error';
			setTimeout(() => {
				delete saveStatus[teamId];
				saveStatus = { ...saveStatus };
			}, 3000);
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
			addError('error', 'admin-panel', 'Error loading game state', err);
		}
	}

	async function updateGameState(newState: GameState) {
		try {
			const response = await fetch('/api/gamestate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ state: newState })
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					currentGameState = result.data.currentState;
				}
			}
		} catch (err) {
			addError('error', 'admin-panel', 'Error updating game state', err);
		}
	}

	onMount(() => {
		loadTeams();
		loadGameState();
	});
</script>

<svelte:head>
	<title>Admin Panel - Skischulung</title>
	<meta name="description" content="Skischulung admin panel for team management" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-mono">
	<!-- Header -->
	<div class="border-b-2 border-orange-400 bg-gradient-to-r from-orange-500 to-red-500 p-4">
		<div class="mx-auto max-w-7xl">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-black tracking-wider text-white">ADMIN PANEL</h1>
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => loadTeams(true)}
						class="border border-white bg-transparent px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-orange-500"
						disabled={loading}
					>
						{loading ? '↻ Lädt...' : '↻ Refresh'}
					</button>
				</div>
			</div>

			<!-- Game State Switching Buttons -->
			<div class="flex flex-wrap gap-2">
				{#each Object.values(GameState) as state (state)}
					<button
						onclick={() => updateGameState(state)}
						class="px-3 py-1.5 text-sm font-bold transition-colors {currentGameState === state
							? 'border border-white bg-white text-orange-500'
							: 'border border-white bg-transparent text-white hover:bg-white hover:text-orange-500'}"
					>
						{state}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl p-4">
		<!-- Game-specific Admin Components -->
		{#if !loading && !error && currentGameState === GameState.GAME1}
			<div class="mt-6">
				<Game1Admin {teams} />
			</div>
		{/if}

		{#if loading}
			<div class="py-8 text-center">
				<div class="mb-3 text-lg font-bold text-orange-400">Lade Teams...</div>
				<div
					class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"
				></div>
			</div>
		{:else if error}
			<div class="py-8 text-center">
				<div class="mb-3 text-lg font-bold text-red-400">Fehler beim Laden!</div>
				<div class="mb-4 text-red-300">{error}</div>
				<button
					onclick={() => loadTeams()}
					class="border-2 border-red-400 bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-500"
				>
					Erneut versuchen
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each teams as team (team.id)}
					<div class="border-2 border-orange-400 bg-gray-800 p-4 shadow-lg">
						<!-- Team Info Section -->
						<div class="mb-3">
							<div class="mb-1 flex items-center justify-between">
								<span class="text-xs font-bold text-orange-300">Team Name:</span>
								<span class="font-mono text-xs text-gray-400">ID: {team.id}</span>
							</div>
							<div class="flex items-center gap-2">
								<!-- Team Icon -->
								<div
									class="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-gray-600 bg-black p-1"
								>
									<img
										src={team.iconUrl}
										alt="{team.name} icon"
										class="h-full w-full object-contain brightness-110 contrast-125 filter"
									/>
								</div>
								<!-- Team Name Input -->
								<input
									id="name-{team.id}"
									type="text"
									value={team.name}
									onblur={(e) => handleNameChange(team, e)}
									onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement)?.blur()}
									class="flex-1 border border-gray-600 bg-gray-700 px-2 py-1 text-sm font-bold text-white transition-colors focus:border-orange-400 focus:outline-none"
									placeholder="Team Name"
								/>
							</div>
							<!-- Hearts Display and Controls -->
							<div class="mt-2 flex flex-row items-center gap-1">
								<button
									class="rounded border border-orange-400 bg-gray-700 px-2 py-0.5 text-xs font-bold text-orange-300 hover:bg-orange-400 hover:text-white disabled:opacity-50"
									onclick={() => handleHeartsChange(team, Math.max(0, (team.hearts ?? 3) - 1))}
									disabled={(team.hearts ?? 3) <= 0}
									title="Herz entfernen"
								>
									-
								</button>
								{#each Array(team.hearts ?? 3)
									.fill(0)
									.map((_, i) => i) as i (i)}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-5 w-5 text-red-500"
									>
										<path
											fill-rule="evenodd"
											d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
											clip-rule="evenodd"
										/>
									</svg>
								{/each}
								<button
									class="rounded border border-orange-400 bg-gray-700 px-2 py-0.5 text-xs font-bold text-orange-300 hover:bg-orange-400 hover:text-white disabled:opacity-50"
									onclick={() => handleHeartsChange(team, Math.min(5, (team.hearts ?? 3) + 1))}
									disabled={(team.hearts ?? 3) >= 5}
									title="Herz hinzufügen"
								>
									+
								</button>
							</div>
						</div>

						<!-- Points Section -->
						<div class="mb-3">
							<div class="mb-1 text-xs font-bold text-orange-300">Punkte:</div>
							<div class="flex items-center gap-2">
								<!-- Small Points Input -->
								<input
									id="points-{team.id}"
									type="number"
									value={team.points}
									onblur={(e) => handlePointsChange(team, e)}
									onkeydown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement)?.blur()}
									class="w-16 border border-gray-600 bg-gray-700 px-2 py-1 text-xs font-bold text-white transition-colors focus:border-orange-400 focus:outline-none"
									placeholder="0"
								/>
								<!-- Point Increment Buttons -->
								<div class="flex flex-1 gap-1">
									{#each [1, 2, 3, 4, 5] as points (points)}
										<button
											onclick={() => addPoints(team.id, points)}
											class="flex-1 border border-orange-400 bg-orange-600 px-1 py-1 text-xs font-bold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
											disabled={saveStatus[team.id] === 'saving'}
										>
											+{points}
										</button>
									{/each}
								</div>
							</div>
						</div>

						<!-- Save Status -->
						{#if saveStatus[team.id]}
							<div class="py-1 text-center">
								{#if saveStatus[team.id] === 'saving'}
									<span class="text-xs text-yellow-400">● Speichert...</span>
								{:else if saveStatus[team.id] === 'saved'}
									<span class="text-xs text-green-400">✓ Gespeichert!</span>
								{:else if saveStatus[team.id] === 'error'}
									<span class="text-xs text-red-400">✗ Fehler beim Speichern</span>
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

		<!-- Error Log Section -->
		<div class="mt-8 mb-8 rounded-lg border border-gray-700 bg-gray-800/50 p-6">
			<ErrorLog />
		</div>
	</div>
</div>

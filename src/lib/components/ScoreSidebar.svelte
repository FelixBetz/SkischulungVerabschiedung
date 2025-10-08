<script lang="ts">
	import type { Team } from '$lib/types';

	let { teams = [] }: { teams: Team[] } = $props();

	let sortedTeams: Team[] = $derived(teams);
</script>

<!-- Retro Sidebar -->
<div class="w-80 border-r-4 border-cyan-400 bg-black shadow-2xl">
	<!-- Header -->
	<div class="border-b-4 border-cyan-300 bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
		<div class="text-center">
			<div class="text-lg font-black tracking-[0.2em] text-white">SKISCHULUNG</div>
			<div class="text-lg font-bold tracking-[0.15em] text-yellow-300">2025</div>
		</div>
	</div>

	<div class="space-y-3 p-4">
		{#each sortedTeams as team, index}
			<div class="group relative">
				<!-- Team card -->
				<div
					class="relative border-2 border-cyan-400 bg-gray-900 p-3 transition-all duration-200 group-hover:border-pink-400 group-hover:bg-gray-800 group-hover:shadow-lg group-hover:shadow-cyan-400/20"
				>
					<!-- Simple ranking number in top right -->
					<div
						class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center border-2 border-yellow-300 bg-yellow-400 text-sm font-bold text-black shadow-lg"
					>
						{index + 1}
					</div>

					<div class="flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center border-2 border-gray-600 bg-black p-1"
						>
							<img
								src={team.iconUrl}
								alt="{team.name} icon"
								class="h-full w-full object-contain brightness-110 contrast-125 filter"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="mb-1 truncate text-sm font-bold tracking-wide text-cyan-300 uppercase">
								{team.name}
							</h3>
							<div class="flex items-center gap-2">
								<span class="text-xs text-yellow-400">◆</span>
								<span class="text-lg font-bold text-white">{team.points}</span>
								<span class="text-xs text-gray-400 uppercase">Punkte</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

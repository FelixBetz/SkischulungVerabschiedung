<script lang="ts">
	interface Props {
		position: number;
		isSelected: boolean;

		onclick?: () => void;
	}

	let { position, isSelected, onclick }: Props = $props();
</script>

<!-- Position button -->
<div class="flex items-center" style="margin-top: -10px;">
	<button
		{onclick}
		class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xl font-bold transition-all {isSelected
			? 'border-orange-400 bg-orange-600 text-white'
			: 'border-orange-300 bg-orange-200/10 text-orange-200 '}"
	>
		{position}
	</button>
</div>

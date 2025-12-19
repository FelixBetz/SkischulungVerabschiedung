<script lang="ts">
	interface Props {
		position: number;
		isSelected: boolean;
		isDisabled?: boolean;
		onclick?: () => void;
	}

	let { position, isSelected, isDisabled = false, onclick }: Props = $props();
</script>

<!-- Position button -->
<div class="flex items-center" style="margin-top: -10px;">
	<button
		disabled={isDisabled}
		onclick={isDisabled ? undefined : onclick}
		class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xl font-bold transition-all {isDisabled
			? 'cursor-not-allowed border-gray-600 bg-gray-800 text-gray-500 opacity-50'
			: isSelected
				? 'border-orange-400 bg-orange-600 text-white'
				: 'border-orange-300 bg-orange-200/10 text-orange-200 hover:border-orange-400 hover:bg-orange-300/20'}"
	>
		{position}
	</button>
</div>

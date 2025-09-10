<script lang="ts">
	interface Props {
		row: number;
		col: number;
		isOccupied: boolean;
		onAddClick: (row: number, col: number) => void;
	}
	let { row, col, isOccupied, onAddClick }: Props = $props();
</script>

<style>
	.field {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 0.2vw dashed rgba(255, 255, 255, 0.3);
		border-radius: 1vw;
		transition: all 0.3s ease;
		cursor: pointer;
		min-height: 0;
		min-width: 0;
	}

	.field:hover {
		border-color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(5px);
	}

	.add-button {
		background: transparent;
		border: none;
		color: white;
		font-size: clamp(1rem, 3vw, 2rem);
		cursor: pointer;
		opacity: 0.6;
		transition: all 0.3s ease;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.add-button:hover {
		opacity: 1;
		transform: scale(1.2);
	}
</style>

{#if !isOccupied}
	<div class="field" style="grid-column: {col + 1}; grid-row: {row + 1};" on:click|stopPropagation={() => onAddClick(row, col)} on:keydown|stopPropagation role="button" tabindex="0">+</div>
{/if}

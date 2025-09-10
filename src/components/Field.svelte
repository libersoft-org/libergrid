<script lang="ts">
	interface Props {
		row: number;
		col: number;
		occupied: boolean;
		onAddClick: (row: number, col: number) => void;
	}
	let { row, col, occupied: occupied, onAddClick }: Props = $props();
</script>

<style>
	.field {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 0;
		min-width: 0;
		font-size: 3cqw;
		font-weight: bold;
		border: 0.2cqw dashed rgba(255, 255, 255, 0.5);
		border-radius: 1vw;
		color: rgba(255, 255, 255, 0.5);
		background-color: rgba(255, 255, 255, 0.2);
		transition: all 0.5s ease;
		cursor: pointer;
	}

	.field:hover {
		border-color: rgba(255, 255, 255, 1);
		color: rgba(255, 255, 255, 1);
		background-color: rgba(255, 255, 255, 0.4);
		backdrop-filter: blur(5px);
	}
</style>

{#if !occupied}
	<div class="field" style="grid-column: {col + 1}; grid-row: {row + 1};" on:click|stopPropagation={() => onAddClick(row, col)} on:keydown|stopPropagation role="button" tabindex="0">+</div>
{/if}

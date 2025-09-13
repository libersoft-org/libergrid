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
		container-type: size;
		border: 0.2cqw dashed rgba(255, 255, 255, 0.5);
		border-radius: 1vw;
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

	.plus {
		font-size: 30cqw;
		font-weight: bold;
		color: rgba(255, 255, 255, 0.5);
	}
</style>

{#if !occupied}
	<div class="field" style="grid-column: {col + 1}; grid-row: {row + 1};" onclick={(e) => {e.stopPropagation(); onAddClick(row, col);}} onkeydown={(e) => e.stopPropagation()} role="button" tabindex="0">
		<div class="plus">+</div>
	</div>
{/if}

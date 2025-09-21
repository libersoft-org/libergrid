<script lang="ts">
	import Button from '../components/Button.svelte';
	import Window from '../components/Window.svelte';
	import { gridItems, type IGridItemType } from '../scripts/dashboard.ts';
	export let show: boolean = false;
	export let gridPosition: { row: number; col: number } | null = null;
	export let onAddComponent: (type: IGridItemType['type'], row: number, col: number) => void;
	export let onClose: () => void;

	function handleAddComponent(type: IGridItemType['type']) {
		if (gridPosition) {
			onAddComponent(type, gridPosition.row, gridPosition.col);
			onClose();
		}
	}
</script>

<style>
	.options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
</style>

<Window {show} title="Select component" {onClose} maxWidth="400px">
	<div class="options">
		{#each gridItems as widget (widget.type)}
			<Button variant="primary" onClick={() => handleAddComponent(widget.type)}>
				{#snippet children()}
					{widget.label}
				{/snippet}
			</Button>
		{/each}
	</div>
</Window>

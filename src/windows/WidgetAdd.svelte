<script lang="ts">
	import Menu from '../components/Menu.svelte';
	import MenuItem from '../components/MenuItem.svelte';
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
	.widget-add {
		display: flex;
		flex-direction: column;
	}
</style>

<Window {show} title="Select component" {onClose} maxWidth="400px">
	<Menu>
		{#each gridItems as widget (widget.type)}
			<MenuItem text={widget.label} onClick={() => handleAddComponent(widget.type)} />
		{/each}
	</Menu>
</Window>

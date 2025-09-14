<script lang="ts">
	import Button from '../components/Button.svelte';
	import Window from '../components/Window.svelte';
	import { gridItems, type IGridItemType } from '../scripts/dashboard.ts';

	export let show: boolean = false;
	export let onAddComponent: (type: IGridItemType['type']) => void;
	export let onClose: () => void;

	function handleAddComponent(type: IGridItemType['type']) {
		onAddComponent(type);
		onClose();
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
				{widget.label}
			</Button>
		{/each}
	</div>
</Window>

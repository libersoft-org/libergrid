<script lang="ts">
	import { onMount } from 'svelte';
	import { type IGridItemType, type IGridPosition, dashboardItems, dashboardAddItem, dashboardDelItem, dashboardUpdateItem, dashboardReloadItems, getGridOccupancy, createNewItem, getComponentProps, updateItemSize, updateItemPosition, showFields, getWidgetSettings } from '../scripts/dashboard.ts';
	import { getSettingsValue } from '../scripts/settings.ts';
	import Field from './DashboardField.svelte';
	import Widget from './Widget.svelte';
	import WidgetTime from '../widgets/Time.svelte';
	import WidgetDate from '../widgets/Date.svelte';
	import WidgetTemp from '../widgets/Temp.svelte';
	import WidgetWeather from '../widgets/Weather.svelte';
	import WidgetNameday from '../widgets/Nameday.svelte';
	import WidgetVideo from '../widgets/Video.svelte';
	import WidgetChart from '../widgets/Chart.svelte';
	import WidgetMap from '../widgets/Map.svelte';
	import WindowWidgetAdd from '../windows/WidgetAdd.svelte';
	let showWindowWidgetAdd: boolean = $state(false);
	let selectedGridPosition: IGridPosition | null = $state(null);
	let mouseTimeout: number;
	let gridConfig = $state(getSettingsValue('grid'));
	const gridOccupancy = $derived(getGridOccupancy(gridConfig.rows, gridConfig.cols, $dashboardItems));

	function showWindowWidgetAddDialog(row: number, col: number) {
		selectedGridPosition = { row, col };
		showWindowWidgetAdd = true;
	}

	function addComponent(type: IGridItemType['type'], row: number, col: number) {
		const newItem = createNewItem(type, row, col);
		dashboardAddItem(newItem);
	}

	function closeWindowWidgetAdd() {
		showWindowWidgetAdd = false;
		selectedGridPosition = null;
	}

	function removeComponent(id: string) {
		dashboardDelItem(id);
	}

	function toggleComponentBorder(id: string) {
		const item = $dashboardItems.find(item => item.id === id);
		if (item) {
			dashboardUpdateItem(id, { border: !item.backgroundTransparency });
		}
	}

	function updateComponentSize(id: string, newColSpan: number, newRowSpan: number, newGridRow?: number, newGridCol?: number) {
		updateItemSize(id, newColSpan, newRowSpan, $dashboardItems, gridConfig.rows, gridConfig.cols, newGridRow, newGridCol);
	}

	function updateComponentPosition(id: string, newGridRow: number, newGridCol: number) {
		updateItemPosition(id, newGridRow, newGridCol, $dashboardItems, gridConfig.rows, gridConfig.cols);
	}

	function getComponentByType(type: string, item?: any) {
		switch (type) {
			case 'time':
				return WidgetTime;
			case 'date':
				return WidgetDate;
			case 'temp':
				return WidgetTemp;
			case 'weather':
				return WidgetWeather;
			case 'nameday':
				return WidgetNameday;
			case 'video':
				return WidgetVideo;
			case 'chart':
				return WidgetChart;
			case 'map':
				return WidgetMap;
			default:
				return null;
		}
	}

	// Mouse activity handlers for Field visibility and settings button
	function handleMouseMove() {
		showFields.set(true);
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showFields.set(false);
		}, getSettingsValue('inactivityTimeout'));
	}

	function handleMouseLeave() {
		showFields.set(false);
		clearTimeout(mouseTimeout);
	}

	// Load data from localStorage on startup
	onMount(() => {
		dashboardReloadItems(); // Reload from storage
		// Add mouse event listeners for Field visibility
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseleave', handleMouseLeave);
		// Listen for settings changes
		const handleStorageChange = () => {
			gridConfig = getSettingsValue('grid');
		};
		window.addEventListener('storage', handleStorageChange);
		// Also listen for custom settings update events
		window.addEventListener('settingsUpdate', handleStorageChange);
		// Cleanup on component destroy
		return () => {
			clearTimeout(mouseTimeout);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('settingsUpdate', handleStorageChange);
		};
	});
</script>

<style>
	.dashboard {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100vh;
		width: 100vw;
		/* Transparent by default - Background component provides the background */
		background: transparent;
		color: white;
		margin: 0;
		padding: 2vw;
		box-sizing: border-box;
		overflow: hidden;
		transition: background 0.5s ease-in-out;
		user-select: none;
		display: grid;
		gap: 1vw;
		/* FIXED grid size - PROHIBITED adding new rows/columns */
		grid-auto-rows: 0;
		grid-auto-columns: 0;
	}

	/* Add overlay when video is playing */
	.dashboard.video-background {
		background: transparent;
	}

	.dashboard-item {
		position: relative;
		/* Grid positioning is now inline in HTML */
		min-height: 0; /* Allow shrinking */
		min-width: 0; /* Allow shrinking */
		overflow: hidden; /* Clip content */
	}

	.component-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 0; /* Allow shrinking */
		min-width: 0; /* Allow shrinking */
		overflow: hidden; /* Clip overflowing content */
	}
</style>

<div class="dashboard" style="grid-template-columns: repeat({gridConfig.cols}, 1fr); grid-template-rows: repeat({gridConfig.rows}, 1fr);" role="button" tabindex="0" aria-label="Dashboard">
	<!-- Generate empty grid cells -->
	{#if $showFields}
		{#each Array(gridConfig.rows) as _, row}
			{#each Array(gridConfig.cols) as _, col}
				<div class="field-wrapper" style="grid-column: {col + 1}; grid-row: {row + 1}; width: 100%; height: 100%;">
					{#if !gridOccupancy[row][col]}
						<Field onClick={() => showWindowWidgetAddDialog(row, col)} />
					{/if}
				</div>
			{/each}
		{/each}
	{/if}
	<!-- Render dashboard components -->
	{#each $dashboardItems as item (item.id)}
		{@const widgetSettings = getWidgetSettings(item.id)}
		<div
			class="dashboard-item"
			style="
				grid-column: {item.gridCol + 1} / span {item.colSpan}; 
				grid-row: {item.gridRow + 1} / span {item.rowSpan};
			"
		>
			<div class="component-wrapper">
				<Widget blur={widgetSettings.blur} blurIntensity={widgetSettings.blurIntensity} backgroundColor={widgetSettings.backgroundColor} backgroundTransparency={widgetSettings.backgroundTransparency} backgroundTransparencyIntensity={widgetSettings.backgroundTransparencyIntensity} colSpan={item.colSpan} rowSpan={item.rowSpan} widgetId={item.id} onResize={(newColSpan, newRowSpan, newGridRow, newGridCol) => updateComponentSize(item.id, newColSpan, newRowSpan, newGridRow, newGridCol)} onMove={(newGridRow, newGridCol) => updateComponentPosition(item.id, newGridRow, newGridCol)} onToggleBorder={() => toggleComponentBorder(item.id)} onRemove={() => removeComponent(item.id)}>
					{#snippet children()}
						{@const Component = getComponentByType(item.type)}
						{#if Component}
							<Component {...getComponentProps(item.type, item)} />
						{/if}
					{/snippet}
				</Widget>
			</div>
		</div>
	{/each}
</div>
<WindowWidgetAdd show={showWindowWidgetAdd} gridPosition={selectedGridPosition} onAddComponent={addComponent} onClose={closeWindowWidgetAdd} />

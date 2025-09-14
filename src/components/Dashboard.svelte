<script lang="ts">
	import { onMount } from 'svelte';
	import { type IGridItemType, dashboard } from '../scripts/dashboard.ts';
	import { getSettingsValue } from '../scripts/settings.ts';
	import Field from './DashboardField.svelte';
	import Widget from './Widget.svelte';
	import WindowWidgetAdd from '../windows/WidgetAdd.svelte';
	import WindowSettings from '../windows/Settings.svelte';
	import WidgetTime from '../widgets/Time.svelte';
	import WidgetDate from '../widgets/Date.svelte';
	import WidgetTemp from '../widgets/Temp.svelte';
	import WidgetNameday from '../widgets/Nameday.svelte';
	import WidgetWeather from '../widgets/Weather.svelte';
	import WidgetVideo from '../widgets/Video.svelte';
	import WidgetChart from '../widgets/Chart.svelte';
	// Background state - updated by listening to Background component events
	let isVideoBackground: boolean = false;
	// Dashboard components - using reactive reference to dashboard.items
	let dashboardItems = $state(dashboard.items);
	// Dialog state
	let showWindowWidgetAdd = $state(false);
	let showWindowSettings = $state(false);
	let selectedGridPosition = { row: 0, col: 0 };
	// Mouse activity tracking for Field visibility
	let showFields = $state(false);
	let showSettingsButton = $state(false);
	let mouseTimeout: number;
	// Flag to track if data has been loaded
	let dataLoaded = false;
	// Reactive grid configuration from settings
	let gridConfig = $state(getSettingsValue('grid'));

	// Reactive map of occupied cells for better performance and reactivity
	const occupiedCells = $derived(
		new Set(
			dashboardItems.flatMap(item => {
				const cells = [];
				for (let r = item.gridRow; r < item.gridRow + item.rowSpan; r++) {
					for (let c = item.gridCol; c < item.gridCol + item.colSpan; c++) {
						cells.push(`${r}-${c}`);
					}
				}
				return cells;
			})
		)
	);

	// Reactive 2D array for display in template
	const gridOccupancy = $derived(Array.from({ length: gridConfig.rows }, (_, row) => Array.from({ length: gridConfig.cols }, (_, col) => occupiedCells.has(`${row}-${col}`))));

	function isGridCellOccupied(row: number, col: number): boolean {
		return occupiedCells.has(`${row}-${col}`);
	}

	function showWindowWidgetAddDialog(row: number, col: number) {
		if (isGridCellOccupied(row, col)) return;
		selectedGridPosition = { row, col };
		showWindowWidgetAdd = true;
	}
	function addComponent(type: IGridItemType['type']) {
		const newItem = {
			id: `${type}-${Date.now()}`,
			type,
			gridRow: selectedGridPosition.row,
			gridCol: selectedGridPosition.col,
			colSpan: 1,
			rowSpan: 1,
			border: true,
		};
		dashboard.addItem(newItem);
		dashboardItems = dashboard.items; // Update local reactive reference
	}

	function closeWindowWidgetAdd() {
		showWindowWidgetAdd = false;
	}

	function openWindowSettings() {
		showWindowSettings = true;
		showSettingsButton = true; // Keep button visible while dialog is open
		clearTimeout(mouseTimeout); // Stop auto-hide timer
	}

	function closeWindowSettings() {
		showWindowSettings = false;
		// Restart auto-hide timer after dialog closes
		mouseTimeout = setTimeout(() => {
			showFields = false;
			showSettingsButton = false;
		}, getSettingsValue('inactivityTimeout'));
	}

	function removeComponent(id: string) {
		dashboard.removeItem(id);
		dashboardItems = dashboard.items; // Update local reactive reference
	}

	function toggleComponentBorder(id: string) {
		const item = dashboardItems.find(item => item.id === id);
		if (item) {
			dashboard.updateItem(id, { border: !item.border });
			dashboardItems = dashboard.items; // Update local reactive reference
		}
	}

	function updateComponentSize(id: string, newColSpan: number, newRowSpan: number, newGridRow?: number, newGridCol?: number) {
		const item = dashboardItems.find(i => i.id === id);
		if (!item) return;
		// Use new positions if specified, otherwise use original
		const targetGridRow = newGridRow !== undefined ? newGridRow : item.gridRow;
		const targetGridCol = newGridCol !== undefined ? newGridCol : item.gridCol;
		// Collision check - verify that new size and position don't collide with other widgets
		const wouldCollide = dashboardItems.some(otherItem => {
			if (otherItem.id === id) return false; // Ignore itself
			const newEndRow = targetGridRow + newRowSpan - 1;
			const newEndCol = targetGridCol + newColSpan - 1;
			const otherEndRow = otherItem.gridRow + otherItem.rowSpan - 1;
			const otherEndCol = otherItem.gridCol + otherItem.colSpan - 1;
			// Overlap check
			const rowOverlap = targetGridRow <= otherEndRow && newEndRow >= otherItem.gridRow;
			const colOverlap = targetGridCol <= otherEndCol && newEndCol >= otherItem.gridCol;
			return rowOverlap && colOverlap;
		});
		// Grid bounds check
		const exceedsBounds = targetGridCol + newColSpan > gridConfig.cols || targetGridRow + newRowSpan > gridConfig.rows || targetGridCol < 0 || targetGridRow < 0;
		// Always update for live feedback, but only if valid
		if (!wouldCollide && !exceedsBounds) {
			dashboard.updateItem(id, {
				colSpan: newColSpan,
				rowSpan: newRowSpan,
				gridRow: targetGridRow,
				gridCol: targetGridCol,
			});
			dashboardItems = dashboard.items; // Update local reactive reference
		}
	}

	function updateComponentPosition(id: string, newGridRow: number, newGridCol: number) {
		const item = dashboardItems.find(i => i.id === id);
		if (!item) return;
		// Collision check - verify that new position doesn't collide with other widgets
		const wouldCollide = dashboardItems.some(otherItem => {
			if (otherItem.id === id) return false; // Ignore itself
			const newEndRow = newGridRow + item.rowSpan - 1;
			const newEndCol = newGridCol + item.colSpan - 1;
			const otherEndRow = otherItem.gridRow + otherItem.rowSpan - 1;
			const otherEndCol = otherItem.gridCol + otherItem.colSpan - 1;
			// Overlap check
			const rowOverlap = newGridRow <= otherEndRow && newEndRow >= otherItem.gridRow;
			const colOverlap = newGridCol <= otherEndCol && newEndCol >= otherItem.gridCol;
			return rowOverlap && colOverlap;
		});
		// Grid bounds check
		const exceedsBounds = newGridCol + item.colSpan > gridConfig.cols || newGridRow + item.rowSpan > gridConfig.rows || newGridCol < 0 || newGridRow < 0;
		// Update position only if valid
		if (!wouldCollide && !exceedsBounds) {
			dashboard.updateItem(id, { gridRow: newGridRow, gridCol: newGridCol });
			dashboardItems = dashboard.items; // Update local reactive reference
		}
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
			default:
				return null;
		}
	}

	function getComponentProps(type: string, item: any): any {
		switch (type) {
			case 'temp':
				return { label: 'Indoor', temp: 24 };
			default:
				return {};
		}
	}

	// Mouse activity handlers for Field visibility and settings button
	function handleMouseMove() {
		showFields = true;
		showSettingsButton = true;
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showFields = false;
			showSettingsButton = false;
		}, getSettingsValue('inactivityTimeout'));
	}

	function handleMouseLeave() {
		showFields = false;
		showSettingsButton = false;
		clearTimeout(mouseTimeout);
	}

	// Load data from localStorage on startup
	onMount(() => {
		dashboardItems = dashboard.reload(); // Reload from storage and update reactive reference
		dataLoaded = true; // Activate automatic saving

		// Add mouse event listeners for Field visibility
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseleave', handleMouseLeave);

		// Listen for background changes from Background component
		const handleBackgroundChange = (event: Event) => {
			const customEvent = event as CustomEvent;
			isVideoBackground = customEvent.detail.isVideo;
		};

		document.addEventListener('backgroundChange', handleBackgroundChange);

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
			document.removeEventListener('backgroundChange', handleBackgroundChange);
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

	.settings-button {
		position: fixed;
		top: 2vw;
		right: 2vw;
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.7);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		color: white;
		font-size: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 1000;
		backdrop-filter: blur(10px);
		transition: all 0.2s ease;
	}

	.settings-button:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.8);
		transform: scale(1.1);
	}
</style>

<div class="dashboard {isVideoBackground ? 'video-background' : ''}" style="grid-template-columns: repeat({gridConfig.cols}, 1fr); grid-template-rows: repeat({gridConfig.rows}, 1fr);" role="button" tabindex="0" aria-label="Dashboard">
	<!-- Generate empty grid cells -->
	{#if showFields}
		{#each Array(gridConfig.rows) as _, row}
			{#each Array(gridConfig.cols) as _, col}
				<Field {row} {col} occupied={gridOccupancy[row][col]} onAddClick={showWindowWidgetAddDialog} />
			{/each}
		{/each}
	{/if}
	<!-- Render dashboard components -->
	{#each dashboardItems as item (item.id)}
		<div
			class="dashboard-item"
			style="
				grid-column: {item.gridCol + 1} / span {item.colSpan}; 
				grid-row: {item.gridRow + 1} / span {item.rowSpan};
			"
			onclick={e => e.stopPropagation()}
			onkeydown={e => (e.key === 'Enter' || e.key === ' ' ? e.stopPropagation() : null)}
			role="button"
			tabindex="0"
			aria-label="Dashboard item"
		>
			<div class="component-wrapper">
				<Widget border={item.border} colSpan={item.colSpan} rowSpan={item.rowSpan} draggable={true} onResize={(newColSpan, newRowSpan, newGridRow, newGridCol) => updateComponentSize(item.id, newColSpan, newRowSpan, newGridRow, newGridCol)} onMove={(newGridRow, newGridCol) => updateComponentPosition(item.id, newGridRow, newGridCol)} onToggleBorder={() => toggleComponentBorder(item.id)} onRemove={() => removeComponent(item.id)}>
					<svelte:component this={getComponentByType(item.type)} {...getComponentProps(item.type, item)} />
				</Widget>
			</div>
		</div>
	{/each}
	{#if showSettingsButton}
		<button class="settings-button" onclick={openWindowSettings}> ⚙️ </button>
	{/if}
</div>
<WindowWidgetAdd show={showWindowWidgetAdd} onAddComponent={addComponent} onClose={closeWindowWidgetAdd} />
<WindowSettings show={showWindowSettings} onClose={closeWindowSettings} />

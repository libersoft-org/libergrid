<script lang="ts">
	import { onMount } from 'svelte';
	import Field from './DashboardField.svelte';
	import Widget from './Widget.svelte';
	import Button from './Button.svelte';
	import WindowWidgetAdd from '../windows/WidgetAdd.svelte';
	import WidgetTime from '../widgets/Time.svelte';
	import WidgetTemp from '../widgets/Temp.svelte';
	import WidgetDate from '../widgets/Date.svelte';
	import WidgetWeather from '../widgets/Weather.svelte';
	import WidgetNameday from '../widgets/Nameday.svelte';
	import WidgetVideo from '../widgets/Video.svelte';
	import WidgetChart from '../widgets/Chart.svelte';
	import type { WidgetType, DashboardItem } from '../scripts/dashboard';
	// Props from parent
	export let onDashboardClick: () => void = () => {};
	// Background state - updated by listening to Background component events
	let isVideoBackground: boolean = false;
	const dashboardStorageKey = 'libergrid';
	const mouseTimeoutDelay = 2000; // 2 seconds
	// Grid - FIXED dimensions
	const gridCols = 10;
	const gridRows = 6;
	// Dashboard components
	let dashboardItems: DashboardItem[] = [];
	// Dialog state
	let showAddDialog = false;
	let selectedGridPosition = { row: 0, col: 0 };
	// Mouse activity tracking for Field visibility
	let showFields = false;
	let mouseTimeout: number;

	// Reactive map of occupied cells for better performance and reactivity
	$: occupiedCells = new Set(
		dashboardItems.flatMap(item => {
			const cells = [];
			for (let r = item.gridRow; r < item.gridRow + item.rowSpan; r++) {
				for (let c = item.gridCol; c < item.gridCol + item.colSpan; c++) {
					cells.push(`${r}-${c}`);
				}
			}
			return cells;
		})
	);

	// Reactive 2D array for display in template
	$: gridOccupancy = Array.from({ length: gridRows }, (_, row) => Array.from({ length: gridCols }, (_, col) => occupiedCells.has(`${row}-${col}`)));

	// Flag to track if data has been loaded
	let dataLoaded = false;

	// Automatic saving when dashboardItems change (only after data is loaded)
	$: if (dataLoaded && dashboardItems) saveDashboardToStorage();

	// Function for saving to localStorage
	function saveDashboardToStorage() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(dashboardStorageKey, JSON.stringify(dashboardItems));
			} catch (error) {
				console.error('Failed to save dashboard to localStorage:', error);
			}
		}
	}

	// Function for loading from localStorage
	function loadDashboardFromStorage() {
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(dashboardStorageKey);
				if (stored) {
					const loadedItems = JSON.parse(stored);
					// Data validation
					if (Array.isArray(loadedItems)) {
						const validItems = loadedItems.filter(item => item && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.gridRow === 'number' && typeof item.gridCol === 'number' && typeof item.colSpan === 'number' && typeof item.rowSpan === 'number' && typeof item.border === 'boolean');
						dashboardItems = validItems;
					}
				}
			} catch (error) {
				console.error('Failed to load dashboard from localStorage:', error);
			}
		}
	}

	function isGridCellOccupied(row: number, col: number): boolean {
		return occupiedCells.has(`${row}-${col}`);
	}

	function showAddComponentDialog(row: number, col: number) {
		if (isGridCellOccupied(row, col)) return;
		selectedGridPosition = { row, col };
		showAddDialog = true;
	}

	function addComponent(type: WidgetType) {
		const newItem = {
			id: `${type}-${Date.now()}`,
			type,
			gridRow: selectedGridPosition.row,
			gridCol: selectedGridPosition.col,
			colSpan: 1,
			rowSpan: 1,
			border: true,
		};
		dashboardItems = [...dashboardItems, newItem];
	}

	function closeAddDialog() {
		showAddDialog = false;
	}

	function removeComponent(id: string) {
		dashboardItems = dashboardItems.filter(item => item.id !== id);
	}

	function toggleComponentBorder(id: string) {
		dashboardItems = dashboardItems.map(item => (item.id === id ? { ...item, border: !item.border } : item));
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
		const exceedsBounds = targetGridCol + newColSpan > gridCols || targetGridRow + newRowSpan > gridRows || targetGridCol < 0 || targetGridRow < 0;
		// Always update for live feedback, but only if valid
		if (!wouldCollide && !exceedsBounds) {
			dashboardItems = dashboardItems.map(item =>
				item.id === id
					? {
							...item,
							colSpan: newColSpan,
							rowSpan: newRowSpan,
							gridRow: targetGridRow,
							gridCol: targetGridCol,
						}
					: item
			);
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
		const exceedsBounds = newGridCol + item.colSpan > gridCols || newGridRow + item.rowSpan > gridRows || newGridCol < 0 || newGridRow < 0;
		// Update position only if valid
		if (!wouldCollide && !exceedsBounds) dashboardItems = dashboardItems.map(item => (item.id === id ? { ...item, gridRow: newGridRow, gridCol: newGridCol } : item));
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

	// Mouse activity handlers for Field visibility
	function handleMouseMove() {
		showFields = true;
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showFields = false;
		}, mouseTimeoutDelay);
	}

	function handleMouseLeave() {
		showFields = false;
		clearTimeout(mouseTimeout);
	}

	function handleDashboardClick() {
		onDashboardClick();
	}

	// Load data from localStorage on startup
	onMount(() => {
		loadDashboardFromStorage();
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

		// Cleanup on component destroy
		return () => {
			clearTimeout(mouseTimeout);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
			document.removeEventListener('backgroundChange', handleBackgroundChange);
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
		cursor: pointer;
		transition: background 0.5s ease-in-out;
		user-select: none;
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		grid-template-rows: repeat(6, 1fr);
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

	.dashboard-item:hover :global(.button-remove) {
		opacity: 1;
	}
</style>

<div class="dashboard {isVideoBackground ? 'video-background' : ''}" on:click={handleDashboardClick} on:keydown={e => (e.key === 'Enter' || e.key === ' ' ? handleDashboardClick() : null)} role="button" tabindex="0" aria-label="Dashboard">
	<!-- Generate grid cells - only for empty fields -->
	{#if showFields}
		{#each Array(gridRows) as _, row}
			{#each Array(gridCols) as _, col}
				<Field {row} {col} occupied={gridOccupancy[row][col]} onAddClick={showAddComponentDialog} />
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
			on:click|stopPropagation
			on:keydown={e => (e.key === 'Enter' || e.key === ' ' ? e.stopPropagation() : null)}
			role="button"
			tabindex="0"
			aria-label="Dashboard item"
		>
			<div class="component-wrapper">
				<Button variant="remove" onClick={() => removeComponent(item.id)} ariaLabel="Remove component">×</Button>
				<Widget border={item.border} colSpan={item.colSpan} rowSpan={item.rowSpan} draggable={true} onResize={(newColSpan, newRowSpan, newGridRow, newGridCol) => updateComponentSize(item.id, newColSpan, newRowSpan, newGridRow, newGridCol)} onMove={(newGridRow, newGridCol) => updateComponentPosition(item.id, newGridRow, newGridCol)} onToggleBorder={() => toggleComponentBorder(item.id)}>
					<svelte:component this={getComponentByType(item.type)} {...getComponentProps(item.type, item)} />
				</Widget>
			</div>
		</div>
	{/each}
</div>
<!-- Widget Add Dialog Component -->
<WindowWidgetAdd show={showAddDialog} onAddComponent={addComponent} onClose={closeAddDialog} />

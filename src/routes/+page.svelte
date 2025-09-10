<script lang="ts">
	import { onMount } from 'svelte';
	import Field from '../components/Field.svelte';
	import Widget from '../components/Widget.svelte';
	import WidgetTime from '../components/Widgets/Time.svelte';
	import WidgetTemp from '../components/Widgets/Temp.svelte';
	import WidgetDate from '../components/Widgets/Date.svelte';
	import WidgetWeather from '../components/Widgets/Weather.svelte';
	import WidgetNameday from '../components/Widgets/Nameday.svelte';

	// LocalStorage key for storing dashboard
	const dashboardStorageKey = 'libergrid';
	const backgroundImages = ['https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg', 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg', 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg', 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg', 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg'];
	// Index for current background
	let currentBackgroundIndex = 0;
	// Grid - FIXED dimensions
	const gridCols = 10;
	const gridRows = 6;
	// Dashboard components
	let dashboardItems: Array<{
		id: string;
		type: 'time' | 'date' | 'temp' | 'weather' | 'nameday';
		gridRow: number;
		gridCol: number;
		colSpan: number;
		rowSpan: number;
		border: boolean;
	}> = [];
	// Dialog state
	let showAddDialog = false;
	let selectedGridPosition = { row: 0, col: 0 };

	// Mouse activity tracking for Field visibility
	let showFields = false;
	let mouseTimeout: number;
	const MOUSE_TIMEOUT_DELAY = 2000; // 2 seconds

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

	function toggleBackground() {
		currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
	}

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
				console.log('Loading from localStorage:', stored);
				if (stored) {
					const loadedItems = JSON.parse(stored);
					console.log('Parsed data:', loadedItems);
					// Data validation
					if (Array.isArray(loadedItems)) {
						const validItems = loadedItems.filter(item => item && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.gridRow === 'number' && typeof item.gridCol === 'number' && typeof item.colSpan === 'number' && typeof item.rowSpan === 'number' && typeof item.border === 'boolean');
						console.log('Valid items:', validItems);
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

	function addComponent(type: 'time' | 'date' | 'temp' | 'weather' | 'nameday') {
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

	function getComponentByType(type: string) {
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
			default:
				return null;
		}
	}

	$: currentBackground = backgroundImages[currentBackgroundIndex];

	// Mouse activity handlers for Field visibility
	function handleMouseMove() {
		showFields = true;
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showFields = false;
		}, MOUSE_TIMEOUT_DELAY);
	}

	function handleMouseLeave() {
		showFields = false;
		clearTimeout(mouseTimeout);
	}

	// Load data from localStorage on startup
	onMount(() => {
		loadDashboardFromStorage();
		dataLoaded = true; // Activate automatic saving

		// Add mouse event listeners for Field visibility
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseleave', handleMouseLeave);

		// Cleanup on component destroy
		return () => {
			clearTimeout(mouseTimeout);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
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
		background: linear-gradient(135deg, #3d1654ff 0%, #090111ff 100%);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		color: white;
		font-family: 'Ubuntu', sans-serif;
		margin: 0;
		padding: 2vw;
		box-sizing: border-box;
		overflow: hidden;
		cursor: pointer;
		transition: background-image 0.5s ease-in-out;
		user-select: none;

		display: grid;
		grid-template-columns: repeat(10, 1fr);
		grid-template-rows: repeat(6, 1fr);
		gap: 1vw;

		/* FIXED grid size - PROHIBITED adding new rows/columns */
		grid-auto-rows: 0;
		grid-auto-columns: 0;
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

	.remove-button {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 0, 0, 0.7);
		color: white;
		font-size: 16px;
		cursor: pointer;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.dashboard-item:hover .remove-button {
		opacity: 1;
	}

	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	.dialog {
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 1vw;
		padding: 2rem;
		backdrop-filter: blur(10px);
		max-width: 400px;
		width: 90%;
	}

	#dialog-title {
		margin: 0 0 1rem 0;
		text-align: center;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.component-options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.component-option {
		padding: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.5vw;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
		text-align: center;
		transition: all 0.2s ease;
		color: white;
		font-size: 16px;
		font-weight: bold;
	}

	.component-option:hover {
		border-color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.2);
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
	}
</style>

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>

<div class="dashboard" style="background-image: url('{currentBackground}')" on:click={toggleBackground} on:keydown={e => (e.key === 'Enter' || e.key === ' ' ? toggleBackground() : null)} role="button" tabindex="0" aria-label="Toggle background image">
	<!-- Generate grid cells - only for empty fields -->
	{#if showFields}
		{#each Array(gridRows) as _, row}
			{#each Array(gridCols) as _, col}
				<Field {row} {col} isOccupied={gridOccupancy[row][col]} onAddClick={showAddComponentDialog} />
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
				<button class="remove-button" on:click|stopPropagation={() => removeComponent(item.id)}>×</button>
				<Widget border={item.border} colSpan={item.colSpan} rowSpan={item.rowSpan} draggable={true} onResize={(newColSpan, newRowSpan, newGridRow, newGridCol) => updateComponentSize(item.id, newColSpan, newRowSpan, newGridRow, newGridCol)} onMove={(newGridRow, newGridCol) => updateComponentPosition(item.id, newGridRow, newGridCol)} onToggleBorder={() => toggleComponentBorder(item.id)}>
					<svelte:component this={getComponentByType(item.type)} />
				</Widget>
			</div>
		</div>
	{/each}
</div>

<!-- Dialog for adding component -->
{#if showAddDialog}
	<div class="dialog-overlay" on:click={() => (showAddDialog = false)} on:keydown={e => (e.key === 'Escape' ? (showAddDialog = false) : null)} role="dialog" tabindex="0" aria-label="Add component dialog">
		<div class="dialog" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="0" aria-labelledby="dialog-title">
			<button class="close-button" on:click={() => (showAddDialog = false)}>×</button>
			<div id="dialog-title">Select component</div>
			<div class="component-options">
				<button class="component-option" on:click={() => addComponent('time')}>Time</button>
				<button class="component-option" on:click={() => addComponent('date')}>Date</button>
				<button class="component-option" on:click={() => addComponent('temp')}>Temperature</button>
				<button class="component-option" on:click={() => addComponent('weather')}>Weather</button>
				<button class="component-option" on:click={() => addComponent('nameday')}>Name day</button>
			</div>
		</div>
	</div>
{/if}

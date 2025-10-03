<script lang="ts">
	import { onMount } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';
	import WidgetButton from './WidgetButton.svelte';
	import WidgetSettings from '../windows/WidgetSettings.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		transparency?: boolean;
		blur?: boolean;
		blurIntensity?: number;
		widgetId: string; // Required for reactive updates
		colSpan?: number;
		rowSpan?: number;
		onResize?: (newColSpan: number, newRowSpan: number, newGridRow?: number, newGridCol?: number) => void;
		onMove?: (newGridRow: number, newGridCol: number) => void;
		onToggleBorder?: () => void;
		onRemove?: () => void;
		children: Snippet;
	}
	let { transparency = false, blur = true, blurIntensity = 5, widgetId, colSpan = 1, rowSpan = 1, onResize = () => {}, onMove = () => {}, onToggleBorder = () => {}, onRemove = () => {}, children }: Props = $props();
	let showSettings = $state(false);
	// Get grid dimensions from settings
	let gridConfig = $state(getSettingsValue('grid'));
	const gridCols = $derived(gridConfig.cols);
	const gridRows = $derived(gridConfig.rows);
	let isResizing = false;
	let isDragging = $state(false);
	let resizeDirection = '';
	let startX = 0;
	let startY = 0;
	let startColSpan = colSpan;
	let startRowSpan = rowSpan;
	let startGridCol = 0;
	let startGridRow = 0;
	// Drag offset to maintain relative mouse position
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	// Mouse activity tracking for resize handles visibility
	let showResizeHandles = $state(false);
	let mouseTimeout: number;

	onMount(() => {
		// Listen for settings changes
		const handleStorageChange = () => {
			gridConfig = getSettingsValue('grid');
		};
		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('settingsUpdate', handleStorageChange);
		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('settingsUpdate', handleStorageChange);
		};
	});

	function handleResizeStart(event: MouseEvent, direction: string) {
		event.stopPropagation();
		isResizing = true;
		resizeDirection = direction;
		startX = event.clientX;
		startY = event.clientY;
		startColSpan = colSpan;
		startRowSpan = rowSpan;
		// Get current grid position from parent element
		const dashboardItem = (event.target as HTMLElement).closest('.dashboard-item') as HTMLElement;
		if (dashboardItem) {
			const style = dashboardItem.style;
			const gridColumnMatch = style.gridColumn.match(/(\d+)/);
			const gridRowMatch = style.gridRow.match(/(\d+)/);
			startGridCol = gridColumnMatch ? parseInt(gridColumnMatch[1]) - 1 : 0;
			startGridRow = gridRowMatch ? parseInt(gridRowMatch[1]) - 1 : 0;
		}
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function handleDragStart(event: MouseEvent) {
		if (isResizing) return;
		// Check if we're not clicking on resize handle or widget buttons
		const target = event.target as HTMLElement;
		if (target.classList.contains('resizer') || target.classList.contains('widget-button') || target.closest('.widget-button')) {
			return; // Don't allow drag on resize handles or widget buttons
		}
		event.stopPropagation();
		isDragging = true;
		let clientX: number, clientY: number;
		clientX = event.clientX;
		clientY = event.clientY;
		startX = clientX;
		startY = clientY;
		// Get current grid position from parent element
		const dashboardItem = (event.target as HTMLElement).closest('.dashboard-item') as HTMLElement;
		if (dashboardItem) {
			const style = dashboardItem.style;
			const gridColumnMatch = style.gridColumn.match(/(\d+)/);
			const gridRowMatch = style.gridRow.match(/(\d+)/);
			startGridCol = gridColumnMatch ? parseInt(gridColumnMatch[1]) - 1 : 0;
			startGridRow = gridRowMatch ? parseInt(gridRowMatch[1]) - 1 : 0;
			// Calculate offset from widget's top-left corner
			const dashboard = document.querySelector('.dashboard') as HTMLElement;
			if (dashboard) {
				const dashboardRect = dashboard.getBoundingClientRect();
				const paddingLeft = parseFloat(getComputedStyle(dashboard).paddingLeft);
				const paddingTop = parseFloat(getComputedStyle(dashboard).paddingTop);
				const gap = parseFloat(getComputedStyle(dashboard).gap);
				const gridCellWidth = (dashboardRect.width - 2 * paddingLeft - (gridCols - 1) * gap) / gridCols;
				const gridCellHeight = (dashboardRect.height - 2 * paddingTop - (gridRows - 1) * gap) / gridRows;
				// Calculate widget's top-left corner position
				const widgetLeft = dashboardRect.left + paddingLeft + startGridCol * (gridCellWidth + gap);
				const widgetTop = dashboardRect.top + paddingTop + startGridRow * (gridCellHeight + gap);
				// Store offset from mouse to widget's top-left corner
				dragOffsetX = clientX - widgetLeft;
				dragOffsetY = clientY - widgetTop;
			}
		}
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);
	}

	function handleResizeMove(event: MouseEvent) {
		if (!isResizing) return;
		let clientX: number, clientY: number;
		clientX = event.clientX;
		clientY = event.clientY;

		// Get dashboard element and calculate grid cell dimensions
		const dashboard = document.querySelector('.dashboard') as HTMLElement;
		if (!dashboard) return;
		const dashboardRect = dashboard.getBoundingClientRect();
		const paddingLeft = parseFloat(getComputedStyle(dashboard).paddingLeft);
		const paddingTop = parseFloat(getComputedStyle(dashboard).paddingTop);
		const gap = parseFloat(getComputedStyle(dashboard).gap);
		const gridCellWidth = (dashboardRect.width - 2 * paddingLeft - (gridCols - 1) * gap) / gridCols;
		const gridCellHeight = (dashboardRect.height - 2 * paddingTop - (gridRows - 1) * gap) / gridRows;
		// Calculate mouse position relative to grid
		const relativeX = clientX - dashboardRect.left - paddingLeft;
		const relativeY = clientY - dashboardRect.top - paddingTop;
		// Calculate which grid cell the mouse is over (accounting for gaps)
		const mouseGridCol = Math.floor((relativeX + gap / 2) / (gridCellWidth + gap));
		const mouseGridRow = Math.floor((relativeY + gap / 2) / (gridCellHeight + gap));
		let newColSpan = startColSpan;
		let newRowSpan = startRowSpan;
		let newGridRow = startGridRow;
		let newGridCol = startGridCol;
		// Calculate new dimensions based on resize direction
		if (resizeDirection.includes('right')) newColSpan = Math.max(1, Math.min(gridCols - startGridCol, mouseGridCol - startGridCol + 1));
		if (resizeDirection.includes('left')) {
			const newLeft = Math.max(0, mouseGridCol);
			newColSpan = Math.max(1, startGridCol + startColSpan - newLeft);
			newGridCol = newLeft;
		}
		if (resizeDirection.includes('bottom')) newRowSpan = Math.max(1, Math.min(gridRows - startGridRow, mouseGridRow - startGridRow + 1));
		if (resizeDirection.includes('top')) {
			const newTop = Math.max(0, mouseGridRow);
			newRowSpan = Math.max(1, startGridRow + startRowSpan - newTop);
			newGridRow = newTop;
		}
		// Update values in real-time for visual feedback
		if (newColSpan !== colSpan || newRowSpan !== rowSpan || newGridRow !== startGridRow || newGridCol !== startGridCol) {
			colSpan = newColSpan;
			rowSpan = newRowSpan;
			onResize(colSpan, rowSpan, newGridRow, newGridCol);
		}
	}

	function handleDragMove(event: MouseEvent) {
		if (!isDragging) return;
		let clientX: number, clientY: number;
		clientX = event.clientX;
		clientY = event.clientY;
		// Get dashboard element and calculate grid cell dimensions
		const dashboard = document.querySelector('.dashboard') as HTMLElement;
		if (!dashboard) return;
		const dashboardRect = dashboard.getBoundingClientRect();
		const paddingLeft = parseFloat(getComputedStyle(dashboard).paddingLeft);
		const paddingTop = parseFloat(getComputedStyle(dashboard).paddingTop);
		const gap = parseFloat(getComputedStyle(dashboard).gap);
		const gridCellWidth = (dashboardRect.width - 2 * paddingLeft - (gridCols - 1) * gap) / gridCols;
		const gridCellHeight = (dashboardRect.height - 2 * paddingTop - (gridRows - 1) * gap) / gridRows;
		// Calculate target position for widget's top-left corner (accounting for drag offset)
		const targetX = clientX - dragOffsetX;
		const targetY = clientY - dragOffsetY;
		// Calculate relative position within grid
		const relativeX = targetX - dashboardRect.left - paddingLeft;
		const relativeY = targetY - dashboardRect.top - paddingTop;
		// Calculate which grid cell the widget's top-left corner should be in
		const mouseGridCol = Math.floor((relativeX + gap / 2) / (gridCellWidth + gap));
		const mouseGridRow = Math.floor((relativeY + gap / 2) / (gridCellHeight + gap));
		// Calculate new position ensuring widget stays within grid bounds
		const newGridCol = Math.max(0, Math.min(gridCols - colSpan, mouseGridCol));
		const newGridRow = Math.max(0, Math.min(gridRows - rowSpan, mouseGridRow));
		onMove(newGridRow, newGridCol);
	}

	function handleResizeEnd() {
		if (isResizing) {
			isResizing = false;
			// Get current position from DOM
			const dashboardItem = document.querySelector('.dashboard-item') as HTMLElement;
			if (dashboardItem) {
				const style = dashboardItem.style;
				const gridColumnMatch = style.gridColumn.match(/(\d+)/);
				const gridRowMatch = style.gridRow.match(/(\d+)/);
				const currentGridCol = gridColumnMatch ? parseInt(gridColumnMatch[1]) - 1 : startGridCol;
				const currentGridRow = gridRowMatch ? parseInt(gridRowMatch[1]) - 1 : startGridRow;
				onResize(colSpan, rowSpan, currentGridRow, currentGridCol);
			} else onResize(colSpan, rowSpan);
		}
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	}

	function handleDragEnd() {
		if (isDragging) {
			isDragging = false;
		}
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);
	}

	function handleResizeKeydown(event: KeyboardEvent, direction: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			// Simulate a mouse event for resize start
			const mouseEvent = new MouseEvent('mousedown', {
				clientX: 0,
				clientY: 0,
				button: 0,
			});
			handleResizeStart(mouseEvent, direction);
		}
	}

	// Mouse activity handlers for resize handles visibility
	function handleMouseEnter() {
		showResizeHandles = true;
		clearTimeout(mouseTimeout);
	}

	function handleMouseMove() {
		showResizeHandles = true;
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showResizeHandles = false;
		}, getSettingsValue('inactivityTimeout'));
	}

	function handleMouseLeave() {
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showResizeHandles = false;
		}, 300); // Short delay when leaving to avoid flickering
	}

	function handleSettings(event: MouseEvent) {
		event.stopPropagation();
		showSettings = true;
	}

	function handleCloseSettings() {
		showSettings = false;
	}

	function handleRemove(event: MouseEvent) {
		event.stopPropagation();
		onRemove();
	}
</script>

<style>
	.widget {
		border-radius: 1vh;
		padding: 10px;
		container-type: size;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		box-sizing: border-box;
		overflow: hidden;
		height: 100%;
		width: 100%;
		position: relative;
		min-height: 0;
		min-width: 0;
		cursor: move;
		transition: opacity 0.2s ease;
	}

	.widget.dragging {
		opacity: 0.7;
		z-index: 1000;
	}

	.widget.with-border {
		background: rgba(0, 0, 0, 0.7);
		border: 0.2vh solid rgba(0, 0, 0, 0.5);
	}

	.resizer {
		z-index: 10;
		position: absolute;
		background: rgba(255, 255, 255, 0.2);
		min-width: 0.5vw;
		min-height: 0.5vw;
		transition: all 0.5s linear;
	}

	.resizer:hover {
		background: rgba(255, 255, 255, 0.8);
	}

	.resizer.top {
		top: 0;
	}

	.resizer.bottom {
		bottom: 0;
	}

	.resizer.top,
	.resizer.bottom {
		left: 0.5vw;
		right: 0.5vw;
		height: 0.5vw;
		cursor: ns-resize;
	}

	.resizer.left {
		left: 0;
	}

	.resizer.right {
		right: 0;
	}

	.resizer.left,
	.resizer.right {
		top: 0.5vw;
		bottom: 0.5vw;
		width: 0.5vw;
		cursor: ew-resize;
	}

	.resizer.ctl {
		left: 0;
		cursor: nw-resize;
	}

	.resizer.ctr {
		right: 0;
		cursor: ne-resize;
	}

	.resizer.ctl,
	.resizer.ctr {
		top: 0;
	}

	.resizer.cbl {
		left: 0;
		cursor: sw-resize;
	}

	.resizer.cbr {
		right: 0;
		cursor: se-resize;
	}

	.resizer.cbl,
	.resizer.cbr {
		bottom: 0;
	}

	.resizer.ctl,
	.resizer.ctr,
	.resizer.cbl,
	.resizer.cbr {
		width: 0.5vw;
		height: 0.5vw;
	}

	.widget:hover .resizer {
		opacity: 1;
	}

	.buttons {
		position: absolute;
		display: flex;
		gap: 0.25vw;
		top: 0.5vw;
		right: 0.5vw;
	}
</style>

<div class="widget" class:with-border={!transparency} class:dragging={isDragging} style={blur ? `backdrop-filter: blur(${blurIntensity}px)` : ''} onmousedown={handleDragStart} onmouseenter={handleMouseEnter} onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} role="button" tabindex="0">
	{@render children()}
	{#if showResizeHandles}
		<div class="buttons">
			<WidgetButton img="img/settings.svg" bgColor="#0f0" borderColor="#080" onClick={handleSettings} />
			<!--<WidgetButton img="img/power.svg" onClick={handleToggleBorder} />-->
			<WidgetButton img="img/cross.svg" bgColor="#f00" borderColor="#800" onClick={handleRemove} />
		</div>
	{/if}
	{#if showResizeHandles}
		<div class="resizer top" onmousedown={e => handleResizeStart(e, 'top')} onkeydown={e => handleResizeKeydown(e, 'top')} role="button" tabindex="0" aria-label="Resize top"></div>
		<div class="resizer right" onmousedown={e => handleResizeStart(e, 'right')} onkeydown={e => handleResizeKeydown(e, 'right')} role="button" tabindex="0" aria-label="Resize right"></div>
		<div class="resizer bottom" onmousedown={e => handleResizeStart(e, 'bottom')} onkeydown={e => handleResizeKeydown(e, 'bottom')} role="button" tabindex="0" aria-label="Resize bottom"></div>
		<div class="resizer left" onmousedown={e => handleResizeStart(e, 'left')} onkeydown={e => handleResizeKeydown(e, 'left')} role="button" tabindex="0" aria-label="Resize left"></div>
		<div class="resizer ctl" onmousedown={e => handleResizeStart(e, 'top-left')} onkeydown={e => handleResizeKeydown(e, 'top-left')} role="button" tabindex="0" aria-label="Resize top-left corner"></div>
		<div class="resizer ctr" onmousedown={e => handleResizeStart(e, 'top-right')} onkeydown={e => handleResizeKeydown(e, 'top-right')} role="button" tabindex="0" aria-label="Resize top-right corner"></div>
		<div class="resizer cbl" onmousedown={e => handleResizeStart(e, 'bottom-left')} onkeydown={e => handleResizeKeydown(e, 'bottom-left')} role="button" tabindex="0" aria-label="Resize bottom-left corner"></div>
		<div class="resizer cbr" onmousedown={e => handleResizeStart(e, 'bottom-right')} onkeydown={e => handleResizeKeydown(e, 'bottom-right')} role="button" tabindex="0" aria-label="Resize bottom-right corner"></div>
	{/if}
</div>
<WidgetSettings show={showSettings} bind:transparency bind:blur bind:blurIntensity {widgetId} onClose={handleCloseSettings} />

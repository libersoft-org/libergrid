<script lang="ts">
	import { onMount } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';
	interface Props {
		border?: boolean;
		colSpan?: number;
		rowSpan?: number;
		resizable?: boolean;
		draggable?: boolean;
		onResize?: (newColSpan: number, newRowSpan: number, newGridRow?: number, newGridCol?: number) => void;
		onMove?: (newGridRow: number, newGridCol: number) => void;
		onToggleBorder?: () => void;
		onRemove?: () => void;
		onResizeStart?: () => void;
		onResizeEnd?: () => void;
		onMoveStart?: () => void;
		onMoveEnd?: () => void;
	}
	let { border = true, colSpan = 1, rowSpan = 1, resizable = true, draggable = true, onResize = () => {}, onMove = () => {}, onToggleBorder = () => {}, onRemove = () => {}, onResizeStart = () => {}, onResizeEnd = () => {}, onMoveStart = () => {}, onMoveEnd = () => {} }: Props = $props();

	// Get grid dimensions from settings
	let gridConfig = $state(getSettingsValue('grid'));
	const gridCols = $derived(gridConfig.cols);
	const gridRows = $derived(gridConfig.rows);
	let isResizing = false;
	let isDragging = false;
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
	const mouseTimeoutDelay = 2000; // 2 seconds
	let isTouchDevice = false;

	onMount(() => {
		detectTouchDevice();

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
	}); // Detect touch device
	function detectTouchDevice() {
		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}

	function handleResizeStart(event: MouseEvent | TouchEvent, direction: string) {
		if (!resizable) return;
		event.stopPropagation();
		isResizing = true;
		resizeDirection = direction;
		// Handle both mouse and touch events
		if (event instanceof TouchEvent) {
			startX = event.touches[0].clientX;
			startY = event.touches[0].clientY;
		} else {
			startX = event.clientX;
			startY = event.clientY;
		}
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
		onResizeStart();
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		document.addEventListener('touchmove', handleResizeMove);
		document.addEventListener('touchend', handleResizeEnd);
	}

	function handleDragStart(event: MouseEvent | TouchEvent) {
		if (!draggable || isResizing) return;
		// Check if we're not clicking on resize handle
		const target = event.target as HTMLElement;
		if (target.classList.contains('resize-handle') || target.classList.contains('remove-button') || target.classList.contains('border-toggle')) {
			return; // Don't allow drag on resize handles, remove button or border toggle
		}
		event.stopPropagation();
		isDragging = true;
		// Handle both mouse and touch events
		let clientX: number, clientY: number;
		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}
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
		onMoveStart();
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchmove', handleDragMove);
		document.addEventListener('touchend', handleDragEnd);
	}

	function handleResizeMove(event: MouseEvent | TouchEvent) {
		if (!isResizing) return;
		// Prevent scrolling on touch devices
		if (event instanceof TouchEvent) event.preventDefault();
		// Handle both mouse and touch events
		let clientX: number, clientY: number;
		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}

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
		if (resizeDirection.includes('right')) {
			newColSpan = Math.max(1, Math.min(gridCols - startGridCol, mouseGridCol - startGridCol + 1));
		}
		if (resizeDirection.includes('left')) {
			const newLeft = Math.max(0, mouseGridCol);
			newColSpan = Math.max(1, startGridCol + startColSpan - newLeft);
			newGridCol = newLeft;
		}
		if (resizeDirection.includes('bottom')) {
			newRowSpan = Math.max(1, Math.min(gridRows - startGridRow, mouseGridRow - startGridRow + 1));
		}
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

	function handleDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		// Prevent scrolling on touch devices
		if (event instanceof TouchEvent) event.preventDefault();
		// Handle both mouse and touch events
		let clientX: number, clientY: number;
		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}
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
			} else {
				onResize(colSpan, rowSpan);
			}
			onResizeEnd();
		}
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
		document.removeEventListener('touchmove', handleResizeMove);
		document.removeEventListener('touchend', handleResizeEnd);
	}

	function handleDragEnd() {
		if (isDragging) {
			isDragging = false;
			onMoveEnd();
		}
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);
		document.removeEventListener('touchmove', handleDragMove);
		document.removeEventListener('touchend', handleDragEnd);
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
		}, mouseTimeoutDelay);
	}

	function handleMouseLeave() {
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showResizeHandles = false;
		}, 300); // Short delay when leaving to avoid flickering
	}

	// Touch handlers for resize handles visibility
	function handleTouchStart() {
		detectTouchDevice();
		if (isTouchDevice) {
			showResizeHandles = true;
			clearTimeout(mouseTimeout);
			mouseTimeout = setTimeout(() => {
				showResizeHandles = false;
			}, 3000); // Show longer on touch devices
		}
	}

	function handleTouchEnd() {
		if (isTouchDevice && !isResizing && !isDragging) {
			clearTimeout(mouseTimeout);
			mouseTimeout = setTimeout(() => {
				showResizeHandles = false;
			}, 1000);
		}
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
		overflow: hidden; /* Ořízne přetékající obsah */
		height: 100%;
		width: 100%;
		position: relative;
		min-height: 0; /* Umožní zmenšení */
		min-width: 0; /* Umožní zmenšení */
		cursor: move; /* Indikuje, že je možné přesouvat */
		transition: opacity 0.2s ease;
		/* Odstraníme grid positioning - to řeší parent */
	}

	.widget.dragging {
		opacity: 0.7;
		z-index: 1000;
	}

	.widget.with-border {
		background: rgba(0, 0, 0, 0.7);
		border: 0.2vh solid rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	.resize-handle {
		position: absolute;
		background: rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
		z-index: 10;
		cursor: default; /* Override parent cursor */
		/* Make resize handles larger on touch devices */
		min-width: 20px;
		min-height: 20px;
	}

	.resize-handle:hover {
		background: rgba(255, 255, 255, 0.8);
	}

	/* Strany */
	.resize-top {
		top: 0;
		left: 10px;
		right: 10px;
		height: 12px;
		cursor: ns-resize;
		border-radius: 1vh 1vh 0 0;
	}

	.resize-right {
		right: 0;
		top: 10px;
		bottom: 10px;
		width: 12px;
		cursor: ew-resize;
		border-radius: 0 1vh 1vh 0;
	}

	.resize-bottom {
		bottom: 0;
		left: 10px;
		right: 10px;
		height: 12px;
		cursor: ns-resize;
		border-radius: 0 0 1vh 1vh;
	}

	.resize-left {
		left: 0;
		top: 10px;
		bottom: 10px;
		width: 12px;
		cursor: ew-resize;
		border-radius: 1vh 0 0 1vh;
	}

	/* Rohy - make them larger for touch */
	.resize-corner-tl {
		top: 0;
		left: 0;
		width: 24px;
		height: 24px;
		cursor: nw-resize;
		border-radius: 1vh 0 0 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-tr {
		top: 0;
		right: 0;
		width: 24px;
		height: 24px;
		cursor: ne-resize;
		border-radius: 0 1vh 0 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-bl {
		bottom: 0;
		left: 0;
		width: 24px;
		height: 24px;
		cursor: sw-resize;
		border-radius: 0 0 0 1vh;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-br {
		bottom: 0;
		right: 0;
		width: 24px;
		height: 24px;
		cursor: se-resize;
		border-radius: 0 0 1vh 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-tl:hover,
	.resize-corner-tr:hover,
	.resize-corner-bl:hover,
	.resize-corner-br:hover {
		background: rgba(255, 255, 255, 0.9);
	}

	.widget:hover .resize-handle {
		opacity: 1;
	}

	.resize-handle {
		opacity: 0;
		transition:
			opacity 0.2s ease,
			background 0.2s ease;
	}

	/* Show resize handles on touch devices when widget is touched */
	@media (hover: none) and (pointer: coarse) {
		.resize-handle {
			opacity: 0.6;
		}

		.widget:active .resize-handle {
			opacity: 1;
		}
	}

	.border-toggle {
		position: absolute;
		top: 5px;
		right: 35px;
		width: 24px;
		height: 24px;
		background: rgba(0, 0, 0, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		color: white;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 15;
		backdrop-filter: blur(5px);
	}

	.border-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.8);
	}

	.remove-button {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 24px;
		height: 24px;
		background: rgba(255, 0, 0, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		color: white;
		font-size: 14px;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 15;
		backdrop-filter: blur(5px);
	}

	.remove-button:hover {
		background: rgba(255, 0, 0, 0.9);
		border-color: rgba(255, 255, 255, 0.8);
	}
</style>

<div class="widget" class:with-border={border} class:dragging={isDragging} on:mousedown={handleDragStart} on:touchstart={handleDragStart} on:mouseenter={handleMouseEnter} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave} on:touchend={handleTouchEnd} role="button" tabindex="0" aria-label="Draggable widget">
	<slot />
	{#if showResizeHandles}
		<!-- Remove button -->
		<button class="remove-button" on:click|stopPropagation={onRemove} title="Remove widget"> × </button>
		<!-- Border toggle button -->
		<button class="border-toggle" on:click|stopPropagation={onToggleBorder} title={border ? 'Turn off border' : 'Turn on border'}>
			{border ? '🔲' : '⬜'}
		</button>
	{/if}
	{#if resizable && showResizeHandles}
		<!-- Sides -->
		<div class="resize-handle resize-top" on:mousedown={e => handleResizeStart(e, 'top')} on:touchstart={e => handleResizeStart(e, 'top')} on:keydown={e => handleResizeKeydown(e, 'top')} role="button" tabindex="0" aria-label="Resize top"></div>
		<div class="resize-handle resize-right" on:mousedown={e => handleResizeStart(e, 'right')} on:touchstart={e => handleResizeStart(e, 'right')} on:keydown={e => handleResizeKeydown(e, 'right')} role="button" tabindex="0" aria-label="Resize right"></div>
		<div class="resize-handle resize-bottom" on:mousedown={e => handleResizeStart(e, 'bottom')} on:touchstart={e => handleResizeStart(e, 'bottom')} on:keydown={e => handleResizeKeydown(e, 'bottom')} role="button" tabindex="0" aria-label="Resize bottom"></div>
		<div class="resize-handle resize-left" on:mousedown={e => handleResizeStart(e, 'left')} on:touchstart={e => handleResizeStart(e, 'left')} on:keydown={e => handleResizeKeydown(e, 'left')} role="button" tabindex="0" aria-label="Resize left"></div>
		<!-- Corners -->
		<div class="resize-handle resize-corner-tl" on:mousedown={e => handleResizeStart(e, 'top-left')} on:touchstart={e => handleResizeStart(e, 'top-left')} on:keydown={e => handleResizeKeydown(e, 'top-left')} role="button" tabindex="0" aria-label="Resize top-left corner"></div>
		<div class="resize-handle resize-corner-tr" on:mousedown={e => handleResizeStart(e, 'top-right')} on:touchstart={e => handleResizeStart(e, 'top-right')} on:keydown={e => handleResizeKeydown(e, 'top-right')} role="button" tabindex="0" aria-label="Resize top-right corner"></div>
		<div class="resize-handle resize-corner-bl" on:mousedown={e => handleResizeStart(e, 'bottom-left')} on:touchstart={e => handleResizeStart(e, 'bottom-left')} on:keydown={e => handleResizeKeydown(e, 'bottom-left')} role="button" tabindex="0" aria-label="Resize bottom-left corner"></div>
		<div class="resize-handle resize-corner-br" on:mousedown={e => handleResizeStart(e, 'bottom-right')} on:touchstart={e => handleResizeStart(e, 'bottom-right')} on:keydown={e => handleResizeKeydown(e, 'bottom-right')} role="button" tabindex="0" aria-label="Resize bottom-right corner"></div>
	{/if}
</div>

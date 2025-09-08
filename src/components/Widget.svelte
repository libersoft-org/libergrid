<script lang="ts">
	export let border: boolean = true;
	export let colSpan: number = 1; // Number of columns the section occupies (out of 10)
	export let rowSpan: number = 1; // Number of rows the section occupies
	export let resizable: boolean = true; // Allows resizing
	export let draggable: boolean = true; // Allows moving
	export let onResize: (newColSpan: number, newRowSpan: number, newGridRow?: number, newGridCol?: number) => void = () => {};
	export let onMove: (newGridRow: number, newGridCol: number) => void = () => {};
	export let onToggleBorder: () => void = () => {};
	export let onResizeStart: () => void = () => {};
	export let onResizeEnd: () => void = () => {};
	export let onMoveStart: () => void = () => {};
	export let onMoveEnd: () => void = () => {};

	let isResizing = false;
	let isDragging = false;
	let resizeDirection = '';
	let startX = 0;
	let startY = 0;
	let startColSpan = colSpan;
	let startRowSpan = rowSpan;
	let startGridCol = 0;
	let startGridRow = 0;

	// Mouse activity tracking for resize handles visibility
	let showResizeHandles = false;
	let mouseTimeout: number;
	const MOUSE_TIMEOUT_DELAY = 2000; // 2 seconds

	function handleResizeStart(event: MouseEvent, direction: string) {
		if (!resizable) return;

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

		onResizeStart();

		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function handleDragStart(event: MouseEvent) {
		if (!draggable || isResizing) return;

		// Check if we're not clicking on resize handle
		const target = event.target as HTMLElement;
		if (target.classList.contains('resize-handle') || target.classList.contains('remove-button') || target.classList.contains('border-toggle')) {
			return; // Don't allow drag on resize handles, remove button or border toggle
		}

		event.stopPropagation();
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;

		// Get current grid position from parent element
		const dashboardItem = (event.target as HTMLElement).closest('.dashboard-item') as HTMLElement;
		if (dashboardItem) {
			const style = dashboardItem.style;
			const gridColumnMatch = style.gridColumn.match(/(\d+)/);
			const gridRowMatch = style.gridRow.match(/(\d+)/);
			startGridCol = gridColumnMatch ? parseInt(gridColumnMatch[1]) - 1 : 0;
			startGridRow = gridRowMatch ? parseInt(gridRowMatch[1]) - 1 : 0;
		}

		onMoveStart();

		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);
	}

	function handleResizeMove(event: MouseEvent) {
		if (!isResizing) return;

		const deltaX = event.clientX - startX;
		const deltaY = event.clientY - startY;

		// Calculation based on actual grid size
		const dashboard = document.querySelector('.dashboard') as HTMLElement;
		if (!dashboard) return;

		const dashboardRect = dashboard.getBoundingClientRect();
		const gridCellWidth = (dashboardRect.width - 2 * parseFloat(getComputedStyle(dashboard).paddingLeft) - 9 * parseFloat(getComputedStyle(dashboard).gap)) / 10;
		const gridCellHeight = (dashboardRect.height - 2 * parseFloat(getComputedStyle(dashboard).paddingTop) - 5 * parseFloat(getComputedStyle(dashboard).gap)) / 6;

		let newColSpan = startColSpan;
		let newRowSpan = startRowSpan;
		let newGridRow = startGridRow;
		let newGridCol = startGridCol;

		// Horizontal changes
		if (resizeDirection.includes('right')) {
			const colChange = Math.round(deltaX / gridCellWidth);
			newColSpan = Math.max(1, Math.min(10 - startGridCol, startColSpan + colChange));
		}
		if (resizeDirection.includes('left')) {
			const colChange = Math.round(-deltaX / gridCellWidth);
			const maxColChange = Math.min(colChange, startGridCol); // Can't go beyond left edge
			newColSpan = Math.max(1, startColSpan + maxColChange);
			newGridCol = startGridCol - (newColSpan - startColSpan);
		}

		// Vertical changes
		if (resizeDirection.includes('bottom')) {
			const rowChange = Math.round(deltaY / gridCellHeight);
			newRowSpan = Math.max(1, Math.min(6 - startGridRow, startRowSpan + rowChange));
		}
		if (resizeDirection.includes('top')) {
			const rowChange = Math.round(-deltaY / gridCellHeight);
			const maxRowChange = Math.min(rowChange, startGridRow); // Can't go beyond top edge
			newRowSpan = Math.max(1, startRowSpan + maxRowChange);
			newGridRow = startGridRow - (newRowSpan - startRowSpan);
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

		const deltaX = event.clientX - startX;
		const deltaY = event.clientY - startY;

		// Calculation based on actual grid size
		const dashboard = document.querySelector('.dashboard') as HTMLElement;
		if (!dashboard) return;

		const dashboardRect = dashboard.getBoundingClientRect();
		const gridCellWidth = (dashboardRect.width - 2 * parseFloat(getComputedStyle(dashboard).paddingLeft) - 9 * parseFloat(getComputedStyle(dashboard).gap)) / 10;
		const gridCellHeight = (dashboardRect.height - 2 * parseFloat(getComputedStyle(dashboard).paddingTop) - 5 * parseFloat(getComputedStyle(dashboard).gap)) / 6;

		const colChange = Math.round(deltaX / gridCellWidth);
		const rowChange = Math.round(deltaY / gridCellHeight);

		const newGridCol = Math.max(0, Math.min(10 - colSpan, startGridCol + colChange));
		const newGridRow = Math.max(0, Math.min(6 - rowSpan, startGridRow + rowChange));

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
	}

	function handleDragEnd() {
		if (isDragging) {
			isDragging = false;
			onMoveEnd();
		}
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('mouseup', handleDragEnd);
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
		}, MOUSE_TIMEOUT_DELAY);
	}

	function handleMouseLeave() {
		clearTimeout(mouseTimeout);
		mouseTimeout = setTimeout(() => {
			showResizeHandles = false;
		}, 300); // Short delay when leaving to avoid flickering
	}
</script>

<style>
	.section {
		border-radius: 1vw;
		padding: 10px;
		container-type: inline-size;
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

	.section.dragging {
		opacity: 0.7;
		z-index: 1000;
	}

	.section.with-border {
		background: rgba(0, 0, 0, 0.7);
		border: 0.2vw solid rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	.resize-handle {
		position: absolute;
		background: rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
		z-index: 10;
		cursor: default; /* Override parent cursor */
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
		border-radius: 1vw 1vw 0 0;
	}

	.resize-right {
		right: 0;
		top: 10px;
		bottom: 10px;
		width: 12px;
		cursor: ew-resize;
		border-radius: 0 1vw 1vw 0;
	}

	.resize-bottom {
		bottom: 0;
		left: 10px;
		right: 10px;
		height: 12px;
		cursor: ns-resize;
		border-radius: 0 0 1vw 1vw;
	}

	.resize-left {
		left: 0;
		top: 10px;
		bottom: 10px;
		width: 12px;
		cursor: ew-resize;
		border-radius: 1vw 0 0 1vw;
	}

	/* Rohy */
	.resize-corner-tl {
		top: 0;
		left: 0;
		width: 16px;
		height: 16px;
		cursor: nw-resize;
		border-radius: 1vw 0 0 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-tr {
		top: 0;
		right: 0;
		width: 16px;
		height: 16px;
		cursor: ne-resize;
		border-radius: 0 1vw 0 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-bl {
		bottom: 0;
		left: 0;
		width: 16px;
		height: 16px;
		cursor: sw-resize;
		border-radius: 0 0 0 1vw;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-br {
		bottom: 0;
		right: 0;
		width: 16px;
		height: 16px;
		cursor: se-resize;
		border-radius: 0 0 1vw 0;
		background: rgba(255, 255, 255, 0.4);
	}

	.resize-corner-tl:hover,
	.resize-corner-tr:hover,
	.resize-corner-bl:hover,
	.resize-corner-br:hover {
		background: rgba(255, 255, 255, 0.9);
	}

	.section:hover .resize-handle {
		opacity: 1;
	}

	.resize-handle {
		opacity: 0;
		transition:
			opacity 0.2s ease,
			background 0.2s ease;
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
		opacity: 0;
		transition: all 0.2s ease;
		z-index: 15;
		backdrop-filter: blur(5px);
	}

	.border-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.8);
	}

	.section:hover .border-toggle {
		opacity: 1;
	}
</style>

<div class="section" class:with-border={border} class:dragging={isDragging} on:mousedown={handleDragStart} on:mouseenter={handleMouseEnter} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
	<slot />

	<!-- Border toggle button -->
	<button class="border-toggle" on:click|stopPropagation={onToggleBorder} title={border ? 'Turn off border' : 'Turn on border'}>
		{border ? '🔲' : '⬜'}
	</button>

	{#if resizable && showResizeHandles}
		<!-- Sides -->
		<div class="resize-handle resize-top" on:mousedown={e => handleResizeStart(e, 'top')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-right" on:mousedown={e => handleResizeStart(e, 'right')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-bottom" on:mousedown={e => handleResizeStart(e, 'bottom')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-left" on:mousedown={e => handleResizeStart(e, 'left')} role="button" tabindex="0"></div>

		<!-- Corners -->
		<div class="resize-handle resize-corner-tl" on:mousedown={e => handleResizeStart(e, 'top-left')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-corner-tr" on:mousedown={e => handleResizeStart(e, 'top-right')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-corner-bl" on:mousedown={e => handleResizeStart(e, 'bottom-left')} role="button" tabindex="0"></div>
		<div class="resize-handle resize-corner-br" on:mousedown={e => handleResizeStart(e, 'bottom-right')} role="button" tabindex="0"></div>
	{/if}
</div>

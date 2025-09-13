<script lang="ts">
	import { onMount } from 'svelte';
	let panelElement: HTMLDivElement;
	let isDragging = false;
	let isExpanded = false;
	let startY = 0;
	let currentY = 0;
	let panelHeight = 0;
	let maxHeight = 400; // Maximum panel height in pixels

	onMount(() => {
		// Add global event listeners
		document.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
		document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
		document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
		document.addEventListener('mousedown', handleGlobalMouseDown);
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
		return () => {
			// Cleanup listeners
			document.removeEventListener('touchstart', handleGlobalTouchStart);
			document.removeEventListener('touchmove', handleGlobalTouchMove);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
			document.removeEventListener('mousedown', handleGlobalMouseDown);
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});

	$: translateY = isExpanded ? 0 : -panelHeight + 20; // Show 20px when collapsed

	// Global mouse/touch handlers for detecting swipe from top
	function handleGlobalTouchStart(e: TouchEvent) {
		const touchY = e.touches[0].clientY;
		// Start drag if touch is in top area (when collapsed) OR anywhere on expanded panel
		if ((touchY < 100 && !isExpanded) || (isExpanded && touchY < panelHeight + 20)) {
			isDragging = true;
			startY = touchY;
			if (panelElement) {
				panelElement.style.transition = 'none';
			}
		}
	}

	function handleGlobalTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		currentY = e.touches[0].clientY;
		const deltaY = currentY - startY;
		if (panelElement) {
			if (isExpanded) {
				// Panel is expanded - allow pulling up to close
				const newTranslateY = Math.max(-panelHeight + 20, Math.min(0, deltaY));
				panelElement.style.transform = `translateY(${newTranslateY}px)`;
			} else {
				// Panel is collapsed - allow pulling down to open
				if (deltaY > 0) {
					const newTranslateY = Math.min(0, -panelHeight + 20 + deltaY);
					panelElement.style.transform = `translateY(${newTranslateY}px)`;
				}
			}
		}
	}

	function handleGlobalTouchEnd() {
		if (!isDragging) return;
		isDragging = false;
		const deltaY = currentY - startY;
		if (panelElement) {
			panelElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
			// Determine if we should expand or collapse based on drag distance and direction
			if (Math.abs(deltaY) > 50) {
				if (deltaY > 0 && !isExpanded) {
					// Pulled down while collapsed - expand
					isExpanded = true;
				} else if (deltaY < 0 && isExpanded) {
					// Pulled up while expanded - collapse
					isExpanded = false;
				}
			}
			// Reset to proper position
			panelElement.style.transform = `translateY(${translateY}px)`;
		}
	}

	// Mouse events for desktop
	function handleGlobalMouseDown(e: MouseEvent) {
		const mouseY = e.clientY;
		// Start drag if mouse is in top area (when collapsed) OR anywhere on expanded panel
		if ((mouseY < 100 && !isExpanded) || (isExpanded && mouseY < panelHeight + 20)) {
			isDragging = true;
			startY = mouseY;
			if (panelElement) panelElement.style.transition = 'none';
		}
	}

	function handleGlobalMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		currentY = e.clientY;
		const deltaY = currentY - startY;
		if (panelElement) {
			if (isExpanded) {
				// Panel is expanded - allow pulling up to close
				const newTranslateY = Math.max(-panelHeight + 20, Math.min(0, deltaY));
				panelElement.style.transform = `translateY(${newTranslateY}px)`;
			} else {
				// Panel is collapsed - allow pulling down to open
				if (deltaY > 0) {
					const newTranslateY = Math.min(0, -panelHeight + 20 + deltaY);
					panelElement.style.transform = `translateY(${newTranslateY}px)`;
				}
			}
		}
	}

	function handleGlobalMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		const deltaY = currentY - startY;
		if (panelElement) {
			panelElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
			if (Math.abs(deltaY) > 50) {
				if (deltaY > 0 && !isExpanded) isExpanded = true;
				else if (deltaY < 0 && isExpanded) isExpanded = false;
			}
			panelElement.style.transform = `translateY(${translateY}px)`;
		}
	}

	// Set panel height after component mounts
	$: if (panelElement) {
		panelHeight = panelElement.offsetHeight || maxHeight;
	}
</script>

<style>
	.panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 400px;
		background: linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%);
		backdrop-filter: blur(20px);
		border-radius: 0 0 20px 20px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		transform: translateY(-350px);
		transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		user-select: none;
		overflow: hidden;
	}

	.panel-content {
		padding: 20px;
		height: 100%;
		overflow-y: auto;
		color: white;
	}

	/* Invisible drag area at the top of screen */
	.drag-area {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 20px;
		z-index: 999;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.drag-area.show {
		opacity: 1;
	}
</style>

<!-- Drag hint area at top of screen -->
<div class="drag-area" class:show={!isExpanded}></div>

<div bind:this={panelElement} class="panel" style="transform: translateY({translateY}px)">
	<div class="panel-content">
		<!-- Custom content will go here -->
	</div>
</div>

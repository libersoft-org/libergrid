<script lang="ts">
	import { onMount } from 'svelte';
	import { backgroundStore, backgroundMedia, type BackgroundItem } from '../scripts/background.ts';
	import { getSettingsValue } from '../scripts/settings.js';
	let panelElement: HTMLDivElement;
	let currentBackground: BackgroundItem = backgroundStore.current;
	let isDragging = false;
	let isExpanded = false;
	let startY = 0;
	let currentY = 0;
	let panelHeight = 0;
	let maxHeight = 400;
	let panelHidden = false;
	let inactivityTimeout: number | null = null; // Auto-hide functionality

	onMount(() => {
		// Subscribe to background changes
		const unsubscribeBackground = backgroundStore.subscribe(background => {
			currentBackground = background;
		});
		// Add global event listeners
		document.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
		document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
		document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
		document.addEventListener('mousedown', handleGlobalMouseDown);
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
		// Add activity listeners for auto-hide functionality (only for non-expanded panel)
		document.addEventListener('mousemove', handleMouseActivity, { passive: true });
		document.addEventListener('click', handleClickActivity, { passive: true });
		document.addEventListener('keydown', handleClickActivity, { passive: true });
		return () => {
			// Cleanup listeners
			unsubscribeBackground();
			clearInactivityTimer();
			document.removeEventListener('touchstart', handleGlobalTouchStart);
			document.removeEventListener('touchmove', handleGlobalTouchMove);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
			document.removeEventListener('mousedown', handleGlobalMouseDown);
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('mousemove', handleMouseActivity);
			document.removeEventListener('click', handleClickActivity);
			document.removeEventListener('keydown', handleClickActivity);
		};
	});

	$: translateY = isExpanded ? 0 : -panelHeight + 40; // Show 20px when collapsed

	// Watch for panel expansion changes
	$: if (isExpanded) {
		// When panel expands, stop auto-hide timer
		clearInactivityTimer();
	} else {
		// When panel collapses, start auto-hide timer
		resetInactivityTimer();
	}

	// Set panel height after component mounts
	$: if (panelElement) {
		panelHeight = panelElement.offsetHeight || maxHeight;
	}

	// Reset the inactivity timer - only for non-expanded panel
	function resetInactivityTimer() {
		clearInactivityTimer();
		// Only start timer if panel is NOT expanded (minimized state should auto-hide)
		if (!isExpanded) {
			inactivityTimeout = setTimeout(() => {
				if (!isExpanded && !isDragging) panelHidden = true;
			}, getSettingsValue('inactivityTimeout'));
		}
	}

	// Clear the inactivity timer
	function clearInactivityTimer() {
		if (inactivityTimeout) {
			clearTimeout(inactivityTimeout);
			inactivityTimeout = null;
		}
	}

	// Handle mouse activity to reset timer
	function handleMouseActivity() {
		panelHidden = false; // Show panel on activity
		resetInactivityTimer();
	}

	// Handle click activity to reset timer
	function handleClickActivity() {
		panelHidden = false; // Show panel on activity
		resetInactivityTimer();
	}

	// Global mouse/touch handlers for detecting swipe from top
	function handleGlobalTouchStart(e: TouchEvent) {
		const touchY = e.touches[0].clientY;
		// Start drag if touch is in top area (when collapsed) OR anywhere on expanded panel
		if ((touchY < 100 && !isExpanded) || (isExpanded && touchY < panelHeight + 20)) {
			isDragging = true;
			startY = touchY;
			// Clear inactivity timer while dragging
			clearInactivityTimer();
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
			// Clear inactivity timer while dragging
			clearInactivityTimer();
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

	function handleBackgroundSelect(index: number) {
		backgroundStore.setBackground(index);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleBackgroundSelect(index);
		}
	}
</script>

<style>
	.panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 400px;
		background-color: #112;
		border-radius: 0 0 20px 20px;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
		z-index: 1000;
		transition: transform 0.2s linear;
		user-select: none;
		overflow: hidden;
	}

	.panel.hidden {
		display: none;
	}

	.panel-content {
		padding: 20px;
		height: 100%;
		overflow-y: auto;
		color: white;
	}

	.panel-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.9);
		z-index: 999;
		cursor: pointer;
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

	.background {
		margin-bottom: 20px;
	}

	.background h3 {
		margin-bottom: 10px;
		font-size: 16px;
		font-weight: bold;
	}

	.background .grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 8px;
	}

	.background .grid .item {
		position: relative;
		aspect-ratio: 16/9;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	.background .grid .item.active {
		border-color: #007acc;
	}

	.background .grid .item:hover {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.background .grid .item:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3);
	}

	.background .grid .item .thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-size: cover;
		background-position: center;
	}

	.background .grid .item .name {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		color: white;
		font-size: 10px;
		padding: 8px 4px 4px;
		text-align: center;
	}
</style>

<!-- Drag hint area at top of screen -->
<div class="drag-area" class:show={!isExpanded}></div>
{#if isExpanded}
	<div class="panel-overlay" onclick={() => (isExpanded = false)}></div>
{/if}
<div bind:this={panelElement} class="panel" class:hidden={panelHidden} style="transform: translateY({translateY}px)">
	<div class="panel-content">
		<div class="background">
			<h3>Background Selection</h3>
			<div class="grid">
				{#each backgroundMedia as background, index (background.url)}
					<div class="item" class:active={currentBackground.url === background.url} role="button" tabindex="0" aria-label="Select {background.name} background" onclick={() => handleBackgroundSelect(index)} onkeydown={e => handleKeydown(e, index)}>
						{#if background.type === 'image'}
							<div class="thumbnail" style="background-image: url('{background.url}')"></div>
						{:else}
							<div class="thumbnail" style="background: linear-gradient(45deg, #333, #666); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">▶ Video</div>
						{/if}
						<div class="name">{background.name}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

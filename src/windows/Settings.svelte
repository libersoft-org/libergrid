<script lang="ts">
	import { onMount } from 'svelte';
	import Window from '../components/Window.svelte';
	import { backgroundStore, backgroundMedia, type BackgroundItem } from '../scripts/background.ts';
	import { getSettingsValue, setSettingsValue } from '../scripts/settings.ts';
	import { validateGridResize, dashboardItems, gridLimits } from '../scripts/dashboard.ts';
	interface Props {
		show?: boolean;
		onClose?: () => void;
	}
	let { show = false, onClose = () => {} }: Props = $props();
	let currentBackground: BackgroundItem = $state(backgroundStore.current);
	let inactivityTimeout: number = $state(getSettingsValue('inactivityTimeout') / 1000); // Convert to seconds
	let grid = $state(getSettingsValue('grid'));

	$effect(() => {
		console.log('Settings component, show prop:', show);
	});

	onMount(() => {
		// Subscribe to background changes
		const unsubscribeBackground = backgroundStore.subscribe(background => {
			currentBackground = background;
		});
		return () => {
			unsubscribeBackground();
		};
	});

	function handleBackgroundSelect(index: number) {
		backgroundStore.setBackground(index);
	}

	function handleInactivityTimeoutChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const seconds = parseInt(target.value, 10);
		if (seconds > 0) {
			inactivityTimeout = seconds;
			setSettingsValue('inactivityTimeout', seconds * 1000); // Convert to milliseconds
		}
	}

	function handleGridColsChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const cols = parseInt(target.value, 10);
		if (cols >= gridLimits.minCols && cols <= gridLimits.maxCols) {
			// Get current grid state to ensure we have latest values
			const currentGrid = getSettingsValue('grid');
			const dashboardItems = getSettingsValue('dashboardItems');
			// Validate if resize is possible without losing widgets
			if (validateGridResize(cols, currentGrid.rows, dashboard.items)) {
				grid = { ...grid, cols };
				setSettingsValue('grid', grid);
			} else {
				// Reset input to current value if validation failed
				setTimeout(() => {
					target.value = grid.cols.toString();
				}, 0);
				alert('Nelze zmenšit mřížku - některé widgety by se dostaly mimo rozsah!');
			}
		} else {
			// Reset to valid range if outside bounds
			setTimeout(() => {
				target.value = grid.cols.toString();
			}, 0);
		}
	}

	function handleGridRowsChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const rows = parseInt(target.value, 10);
		if (rows >= gridLimits.minRows && rows <= gridLimits.maxRows) {
			// Get current grid state to ensure we have latest values
			const currentGrid = getSettingsValue('grid');
			const dashboardItems = getSettingsValue('dashboardItems');
			// Validate if resize is possible without losing widgets
			if (validateGridResize(currentGrid.cols, rows, dashboard.items)) {
				grid = { ...grid, rows };
				setSettingsValue('grid', grid);
			} else {
				// Reset input to current value if validation failed
				setTimeout(() => {
					target.value = grid.rows.toString();
				}, 0);
				alert('Nelze zmenšit mřížku - některé widgety by se dostaly mimo rozsah!');
			}
		} else {
			// Reset to valid range if outside bounds
			setTimeout(() => {
				target.value = grid.rows.toString();
			}, 0);
		}
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleBackgroundSelect(index);
		}
	}
</script>

<style>
	.background-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 8px;
	}

	.background-item {
		position: relative;
		aspect-ratio: 16/9;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	.background-item.active {
		border-color: #007acc;
	}

	.background-item:hover {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.background-item:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3);
	}

	.background-thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-size: cover;
		background-position: center;
	}

	.background-name {
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

	.settings-section {
		margin-bottom: 20px;
	}

	.settings-section h3 {
		margin-bottom: 10px;
		font-size: 16px;
		font-weight: bold;
		color: white;
	}

	.settings-field {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.settings-field label {
		color: white;
		font-size: 14px;
		min-width: 150px;
	}

	.settings-field input {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 6px 10px;
		color: white;
		font-size: 14px;
		width: 80px;
	}

	.settings-field input:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3);
	}

	.settings-field span {
		color: rgba(255, 255, 255, 0.7);
		font-size: 12px;
	}
</style>

<Window {show} title="Settings" {onClose} maxWidth="600px">
	<div class="settings-section">
		<h3>Interface settings</h3>
		<div class="settings-field">
			<label for="inactivity-timeout">Auto-hide timeout:</label>
			<input id="inactivity-timeout" type="number" min="1" max="15" bind:value={inactivityTimeout} onchange={handleInactivityTimeoutChange} />
			<span>seconds</span>
		</div>
		<div class="settings-field">
			<label for="grid-cols">Grid columns:</label>
			<input id="grid-cols" type="number" min={gridLimits.minCols} max={gridLimits.maxCols} value={grid.cols} onchange={handleGridColsChange} />
			<span>columns</span>
		</div>
		<div class="settings-field">
			<label for="grid-rows">Grid rows:</label>
			<input id="grid-rows" type="number" min={gridLimits.minRows} max={gridLimits.maxRows} value={grid.rows} onchange={handleGridRowsChange} />
			<span>rows</span>
		</div>
	</div>
	<div class="settings-section">
		<h3>Background selection</h3>
		<div class="background-grid">
			{#each backgroundMedia as background, index (background.url)}
				<div class="background-item" class:active={currentBackground.url === background.url} role="button" tabindex="0" aria-label="Select {background.name} background" onclick={() => handleBackgroundSelect(index)} onkeydown={e => handleKeydown(e, index)}>
					{#if background.type === 'image'}
						<div class="background-thumbnail" style="background-image: url('{background.url}')"></div>
					{:else}
						<div class="background-thumbnail" style="background: linear-gradient(45deg, #333, #666); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">▶ Video</div>
					{/if}
					<div class="background-name">{background.name}</div>
				</div>
			{/each}
		</div>
	</div>
</Window>

<script lang="ts">
	import { get } from 'svelte/store';
	import Window from '../components/Window.svelte';
	import Select from '../components/Select.svelte';
	import Option from '../components/SelectOption.svelte';
	import WindowTitle from '../components/WindowTitle.svelte';
	import Switch from '../components/Switch.svelte';
	import Range from '../components/Range.svelte';
	import { currentIndex, setBackground, setBackgroundType, backgroundType, backgroundImages, backgroundVideos, backgroundColors } from '../scripts/background.ts';
	import { getSettingsValue, setSettingsValue } from '../scripts/settings.ts';
	import { validateGridResize, dashboardItems, gridLimits } from '../scripts/dashboard.ts';
	interface Props {
		show?: boolean;
		onClose?: () => void;
	}
	let { show = false, onClose = () => {} }: Props = $props();
	let inactivityTimeout: number = $state(getSettingsValue('inactivityTimeout') / 1000); // Convert to seconds
	let grid = $state(getSettingsValue('grid'));
	let sheepEnabled = $state(getSettingsValue('sheepEnabled'));
	let sheepCount = $state(getSettingsValue('sheepCount'));
	let sheepSize = $state(getSettingsValue('sheepSize'));

	// Derive current background items from background type reactively
	const currentBackgroundItems = $derived.by(() => {
		const type = $backgroundType;
		switch (type) {
			case 'image':
				return backgroundImages;
			case 'video':
				return backgroundVideos;
			case 'color':
				return backgroundColors;
			default:
				return backgroundImages;
		}
	});

	function handleBackgroundSelect(index: number) {
		setBackground(index);
	}

	function handleBackgroundTypeChange(type: 'image' | 'video' | 'color') {
		setBackgroundType(type);
	}

	function handleBackgroundTypeSelect(event: Event) {
		const target = event.target as HTMLSelectElement;
		const type = target.value as 'image' | 'video' | 'color';
		handleBackgroundTypeChange(type);
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
			// Validate if resize is possible without losing widgets
			if (validateGridResize(cols, currentGrid.rows, get(dashboardItems))) {
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
			// Validate if resize is possible without losing widgets
			if (validateGridResize(currentGrid.cols, rows, get(dashboardItems))) {
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

	function handleVideoHover(event: Event, isHovering: boolean) {
		const videoElement = event.target as HTMLVideoElement;
		if (videoElement && videoElement.tagName === 'VIDEO') {
			if (isHovering) {
				videoElement.play().catch(console.error);
			} else {
				videoElement.pause();
				videoElement.currentTime = 0;
			}
		}
	}

	function toggleSheep(newValue: boolean) {
		sheepEnabled = newValue;
		setSettingsValue('sheepEnabled', newValue);
	}

	function handleSheepCountChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const count = parseInt(target.value, 10);
		if (count >= 0 && count <= 50) {
			sheepCount = count;
			setSettingsValue('sheepCount', count);
		}
	}

	function handleSheepSizeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const size = parseFloat(target.value);
		if (size >= 0.25 && size <= 5) {
			sheepSize = size;
			setSettingsValue('sheepSize', size);
		}
	}
</script>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 1vw;
	}

	.background-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-auto-rows: 12vh;
		gap: 0.2vw;
		max-height: 20vh;
		overflow-y: auto;
	}

	.background-item {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 0.5vw;
		overflow: hidden;
		cursor: pointer;
		border: 0.2vw solid transparent;
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
		font-size: 0.7vw;
	}

	.video-thumbnail {
		object-fit: cover;
		cursor: pointer;
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
		font-size: 1vw;
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

<Window {show} title="Settings" {onClose} maxWidth="50vw">
	<div class="settings">
		<WindowTitle text="Interface settings" />
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
		<div class="settings-field">
			<label for="sheep-toggle">Sheep:</label>
			<Switch bind:checked={sheepEnabled} onChange={toggleSheep} />
		</div>
		<div class="settings-field">
			<label for="sheep-count">Sheep count:</label>
			<Range id="sheep-count" min="1" max="50" step="1" bind:value={sheepCount} onchange={handleSheepCountChange} />
			<span>{sheepCount}</span>
		</div>
		<div class="settings-field">
			<label for="sheep-size">Sheep size:</label>
			<Range id="sheep-size" min="0.5" max="5.0" step="0.1" bind:value={sheepSize} onchange={handleSheepSizeChange} />
			<span>{sheepSize.toFixed(1)}x</span>
		</div>
		<WindowTitle text="Background type" />
		<Select value={$backgroundType} onchange={handleBackgroundTypeSelect}>
			<Option value="image" text="Image" selected={$backgroundType === 'image'} />
			<Option value="video" text="Video" selected={$backgroundType === 'video'} />
			<Option value="color" text="Color" selected={$backgroundType === 'color'} />
		</Select>
		<WindowTitle text="Background selection" />
		<div class="background-grid">
			{#each currentBackgroundItems as background, index}
				{@const isCurrentSelected = $currentIndex === index}
				<div class="background-item" class:active={isCurrentSelected} role="button" tabindex="0" aria-label="Select background" onclick={() => handleBackgroundSelect(index)} onkeydown={e => handleKeydown(e, index)}>
					{#if $backgroundType === 'video' && 'url' in background}
						<video class="background-thumbnail video-thumbnail" src={background.url} muted loop onmouseenter={e => handleVideoHover(e, true)} onmouseleave={e => handleVideoHover(e, false)}> Your browser does not support video. </video>
					{:else if $backgroundType === 'color'}
						<div class="background-thumbnail" style="background-color: {'color' in background ? background.color : '#222'}; display: flex; align-items: center; justify-content: center; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">{'color' in background ? background.color : ''}</div>
					{:else}
						<div class="background-thumbnail" style="background-image: url('{'url' in background ? background.url : ''}')"></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</Window>

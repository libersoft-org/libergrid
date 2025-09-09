<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../../scripts/font';
	// Here will be autonomous data - hardcoded for now, later we can add API calls
	let insideTemp: number = 24;
	let outsideTemp: number = 17;
	// Elements for font management
	let indoorLabelElement: HTMLElement;
	let indoorTempElement: HTMLElement;
	let outdoorLabelElement: HTMLElement;
	let outdoorTempElement: HTMLElement;
	// Cleanup functions
	let cleanupFunctions: (() => void)[] = [];

	function setupFontManagers() {
		// Clear existing cleanups
		cleanupFunctions.forEach(cleanup => cleanup());
		cleanupFunctions = [];
		// Setup font managers for different elements
		if (indoorLabelElement) cleanupFunctions.push(autoFont(indoorLabelElement, 90, 20));
		if (indoorTempElement) cleanupFunctions.push(autoFont(indoorTempElement, 90, 35));
		if (outdoorLabelElement) cleanupFunctions.push(autoFont(outdoorLabelElement, 90, 20));
		if (outdoorTempElement) cleanupFunctions.push(autoFont(outdoorTempElement, 90, 35));
	}

	onMount(() => {
		// Setup font managers after component mount
		setTimeout(setupFontManagers, 0);
		return () => {
			cleanupFunctions.forEach(cleanup => cleanup());
		};
	});
	// TODO: Add real-time temperature loading from API or sensors
</script>

<style>
	.temp-label {
		margin-bottom: 5px;
	}

	.temp-item {
		font-weight: bold;
	}
</style>

<div class="temp-label" bind:this={indoorLabelElement}>Indoor temperature</div>
<div class="temp-item" bind:this={indoorTempElement}>{insideTemp}°C</div>
<div class="temp-label" bind:this={outdoorLabelElement}>Outdoor temperature</div>
<div class="temp-item" bind:this={outdoorTempElement}>{outsideTemp}°C</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	import { getAPI } from '../scripts/api';
	const apiURL = 'http://127.0.0.1:80/sensor-internal';
	const refresh = 10000; // 10 seconds
	interface Props {
		label?: string;
		celsius?: boolean;
	}
	let { label, celsius = true }: Props = $props();
	let temp = $state<number | undefined>();
	let humidity = $state<number | undefined>();
	let pressure = $state<number | undefined>();
	let elLabel: HTMLElement | undefined = $state();
	let elTemp: HTMLElement | undefined = $state();
	let elHumidity: HTMLElement | undefined = $state();
	let elPressure: HTMLElement | undefined = $state();
	let cleanupFunctions: (() => void)[] = [];
	let refreshTimer: number | undefined;

	function setupFontManagers() {
		cleanupFunctions.forEach(cleanup => cleanup());
		cleanupFunctions = [];
		if (elLabel) cleanupFunctions.push(autoFont(elLabel, 90, 20));
		if (elTemp) cleanupFunctions.push(autoFont(elTemp, 90, 20));
		if (elHumidity) cleanupFunctions.push(autoFont(elHumidity, 90, 20));
		if (elPressure) cleanupFunctions.push(autoFont(elPressure, 90, 20));
	}

	async function loadSensorData() {
		try {
			const data = await getAPI(apiURL);
			if (data.temperature_C !== undefined) {
				temp = celsius ? data.temperature_C : (data.temperature_C * 9) / 5 + 32;
				humidity = data.humidity;
				pressure = data.pressure_hPa;
			}
		} catch (error) {
			console.error('Failed to load temperature data:', error);
		}
	}

	onMount(() => {
		setTimeout(setupFontManagers, 0);
		loadSensorData();
		refreshTimer = setInterval(loadSensorData, refresh) as unknown as number;
		return () => {
			cleanupFunctions.forEach(cleanup => cleanup());
			if (refreshTimer) clearInterval(refreshTimer);
		};
	});
</script>

<style>
	.temp-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		gap: 5px;
	}

	.label {
		margin-bottom: 5px;
		opacity: 0.8;
		-webkit-text-stroke: 0.02em black;
	}

	.value {
		font-weight: bold;
		-webkit-text-stroke: 0.02em black;
	}

	.secondary {
		opacity: 0.9;
		-webkit-text-stroke: 0.01em black;
	}
</style>

<div class="temp-container">
	{#if label}
		<div class="label" bind:this={elLabel}>{label}</div>
	{/if}
	{#if temp === undefined || humidity === undefined || pressure === undefined}
		<div class="value" bind:this={elTemp}>--</div>
	{/if}
	{#if temp !== undefined}
		<div class="value" bind:this={elTemp}>T: {temp.toFixed(2)}°{celsius ? 'C' : 'F'}</div>
	{/if}
	{#if humidity !== undefined}
		<div class="value" bind:this={elHumidity}>H: {humidity.toFixed(2)}%</div>
	{/if}
	{#if pressure !== undefined}
		<div class="value" bind:this={elPressure}>P: {pressure.toFixed(2)} hPa</div>
	{/if}
</div>

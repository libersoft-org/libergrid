<script lang="ts">
    import { onMount } from 'svelte';
    import { autoFont } from '../../scripts/font';
    interface Props {
	label?: string;
	temp?: number;
	celsius?: boolean;
    }
    let { label, temp, celsius = true }: Props = $props();
    let elLabel: HTMLElement | undefined = $state();
    let elTemp: HTMLElement | undefined = $state();
    // Cleanup functions
    let cleanupFunctions: (() => void)[] = [];

    function setupFontManagers() {
	// Clear existing cleanups
	cleanupFunctions.forEach(cleanup => cleanup());
	cleanupFunctions = [];
	// Setup font managers for different elements
	if (elLabel) cleanupFunctions.push(autoFont(elLabel, 90, 20));
	if (elTemp) cleanupFunctions.push(autoFont(elTemp, 90, 60));
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
    .temp-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
    }

    .label {
	margin-bottom: 5px;
	opacity: 0.8;
    }

    .temp {
	font-weight: bold;
    }
</style>

<div class="temp-container">
    {#if label}
	<div class="label" bind:this={elLabel}>{label}</div>
    {/if}
    <div class="temp" bind:this={elTemp}>
	{temp}°{celsius ? 'C' : 'F'}
    </div>
</div>

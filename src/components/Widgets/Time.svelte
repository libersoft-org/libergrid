<script lang="ts">
	import { onMount } from 'svelte';
	import { adjustFontToFit, createFontResizeObserver } from '../../scripts/fontUtils';
	let currentTime = new Date();
	let timeElement: HTMLDivElement;

	function adjustTimeElement() {
		// Apply 90% width and 80% height to time element
		adjustFontToFit(timeElement, 90, 80);
	}

	// Update time every second
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
			setTimeout(adjustTimeElement, 0); // Adjust after DOM update
		}, 1000);

		// Initial adjustment
		setTimeout(adjustTimeElement, 100);

		// Create resize observer using utility function
		const resizeObserver = createFontResizeObserver(timeElement, 90, 80);

		return () => {
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	// Time formatting
	function formatTime(date: Date): string {
		return date.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}
</script>

<style>
	.time {
		font-weight: bold;
		text-align: center;
		font-family: 'Monospace', monospace;
		white-space: nowrap;
		line-height: 1;
		/* font-size will be set by JavaScript */
	}
</style>

<div class="time" bind:this={timeElement}>{formatTime(currentTime)}</div>

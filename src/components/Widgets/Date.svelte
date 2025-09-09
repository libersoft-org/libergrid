<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { adjustFontToFit, createFontResizeObserver } from '../../scripts/font.ts';
	let currentTime = new Date();
	let dayElement: HTMLElement;
	let dateElement: HTMLElement;

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
			updateFontSizes();
		}, 1000);
		const dayResizeObserver = createFontResizeObserver(dayElement, 80, 30);
		const dateResizeObserver = createFontResizeObserver(dateElement, 80, 30);
		updateFontSizes();
		return () => {
			clearInterval(interval);
			dayResizeObserver.disconnect();
			dateResizeObserver.disconnect();
		};
	});

	async function updateFontSizes() {
		await tick();
		adjustFontToFit(dayElement, 80, 30);
		adjustFontToFit(dateElement, 80, 30);
	}

	// Day name according to locale
	function getDayName(date: Date): string {
		const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
		return dayName.charAt(0).toUpperCase() + dayName.slice(1);
	}

	// Date formatting
	function formatDate(date: Date): string {
		return date.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
		});
	}
</script>

<style>
	.name {
		font-weight: bold;
	}
</style>

<div class="name" bind:this={dayElement}>{getDayName(currentTime)}</div>
<div class="date" bind:this={dateElement}>{formatDate(currentTime)}</div>

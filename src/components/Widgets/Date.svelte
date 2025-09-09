<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { createFontManager } from '../../scripts/font';
	let currentTime = new Date();
	let dayElement: HTMLElement;
	let dateElement: HTMLElement;
	let dayManager: ReturnType<typeof createFontManager>;
	let dateManager: ReturnType<typeof createFontManager>;

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
			updateFontSizes();
		}, 1000);
		dayManager = createFontManager(dayElement, 90, 30);
		dateManager = createFontManager(dateElement, 90, 30);
		updateFontSizes();
		return () => {
			clearInterval(interval);
			dayManager.disconnect();
			dateManager.disconnect();
		};
	});

	async function updateFontSizes() {
		await tick();
		if (dayManager && dateManager) {
			dayManager.adjust();
			dateManager.adjust();
		}
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

<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	let currentTime = new Date();
	let dayElement: HTMLElement;
	let dateElement: HTMLElement;

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		const cleanup = autoFont([dayElement, dateElement], 90, 30);
		return () => {
			clearInterval(interval);
			cleanup();
		};
	});

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

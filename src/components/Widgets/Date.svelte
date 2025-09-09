<script lang="ts">
	import { onMount } from 'svelte';
 let currentTime = new Date();

	onMount(() => {
		const interval = setInterval(() => currentTime = new Date(), 1000);
		return () => clearInterval(interval);
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
	.day-name {
		font-size: 28cqmin;
		font-weight: bold;
		margin-bottom: 0.5rem;
		line-height: 1;
	}

	.date {
		font-size: 16cqmin;
		line-height: 1;
	}
</style>

<div class="day-name">
	{getDayName(currentTime)}
</div>
<div class="date">
	{formatDate(currentTime)}
</div>

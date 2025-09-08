<script lang="ts">
	import { onMount } from 'svelte';

	let currentTime = new Date();

	// Update time every second
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

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
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.day-name {
		font-size: 24cqw;
		font-weight: bold;
		margin-bottom: 0.5rem;
		line-height: 1;
	}

	.date {
		font-size: 16cqw;
		line-height: 1;
	}
</style>

<div class="container">
	<div class="day-name">
		{getDayName(currentTime)}
	</div>
	<div class="date">
		{formatDate(currentTime)}
	</div>
</div>

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

	// Time formatting
	function formatTime(date: Date): string {
		return date.toLocaleTimeString('cs-CZ', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}
</script>

<style>
	.current-time {
		font-size: 24cqw;
		font-weight: bold;
		width: 100%;
		text-align: center;
		font-family: 'Ubuntu Mono', monospace;
		white-space: nowrap;
		line-height: 1;
		-webkit-text-stroke: 0.3cqw black;
	}
</style>

<div class="current-time">
	{formatTime(currentTime)}
</div>

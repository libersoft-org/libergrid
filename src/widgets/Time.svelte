<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	let timeElement: HTMLElement;

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		const cleanup = autoFont(timeElement, 90, 90);
		return () => {
			clearInterval(interval);
			cleanup();
		};
	});

	function updateTime() {
		if (timeElement) timeElement.innerHTML = formatTime(new Date());
	}

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
		font-family: 'Ubuntu Mono', monospace;
		white-space: nowrap;
		line-height: 1;
		color: white;
		-webkit-text-stroke: 0.02em black;
	}
</style>

<div class="time" bind:this={timeElement}></div>

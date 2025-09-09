<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { adjustFontToFit, createFontResizeObserver } from '../../scripts/font.ts';
	let timeElement: HTMLElement;

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		const resizeObserver = createFontResizeObserver(timeElement, 90, 80);
		return () => {
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	function updateTime() {
		updateText(timeElement, formatTime(new Date()));
	}

	async function updateText(element: HTMLElement, newText: string) {
		element.innerHTML = newText;
		await tick();
		adjustFontToFit(element, 90, 90);
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
	}
</style>

<div class="time" bind:this={timeElement}></div>

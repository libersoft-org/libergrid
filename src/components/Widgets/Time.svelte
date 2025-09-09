<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { createFontManager } from '../../scripts/font';
	let timeElement: HTMLElement;
	let timeManager: ReturnType<typeof createFontManager>;

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		timeManager = createFontManager(timeElement, 90, 90);
		return () => {
			clearInterval(interval);
			timeManager.disconnect();
		};
	});

	function updateTime() {
		updateText(timeElement, formatTime(new Date()));
	}

	async function updateText(element: HTMLElement, newText: string) {
		element.innerHTML = newText;
		await tick();
		if (timeManager) {
			timeManager.adjust();
		}
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

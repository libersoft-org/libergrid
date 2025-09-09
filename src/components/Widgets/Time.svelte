<script lang="ts">
	import { onMount } from 'svelte';
	let currentTime = new Date();
	let timeElement: HTMLDivElement;

	// Update time every second
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
			setTimeout(adjustFontToFit, 0); // Adjust after DOM update
		}, 1000);

		// Initial adjustment
		setTimeout(adjustFontToFit, 100);

		// Adjust on resize
		const resizeObserver = new ResizeObserver(adjustFontToFit);
		if (timeElement?.parentElement) {
			resizeObserver.observe(timeElement.parentElement);
		}

		return () => {
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	function adjustFontToFit() {
		if (!timeElement?.parentElement) return;

		const container = timeElement.parentElement;
		const maxWidth = container.clientWidth * 1.0; // 100% šířky
		const maxHeight = container.clientHeight * 0.3; // 100% výšky

		console.log('Container size:', container.clientWidth, 'x', container.clientHeight);
		console.log('Max allowed:', maxWidth, 'x', maxHeight);

		// Začneme s malou velikostí a zvyšujeme
		let fontSize = 10;
		let lastValidSize = 10;

		while (fontSize < 1000) {
			timeElement.style.fontSize = `${fontSize}px`;

			// Force reflow
			timeElement.offsetHeight;

			const rect = timeElement.getBoundingClientRect();
			console.log(`Font ${fontSize}px: ${rect.width}x${rect.height} (max: ${maxWidth}x${maxHeight})`);

			if (rect.width <= maxWidth && rect.height <= maxHeight) {
				lastValidSize = fontSize;
				fontSize += 5; // Zvyšujeme po 5px
			} else {
				// Přesáhli jsme - použijeme poslední platnou velikost
				break;
			}
		}

		timeElement.style.fontSize = `${lastValidSize}px`;
		console.log('Final font size:', lastValidSize);
	}

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
		/* font-size bude nastaveno JavaScriptem */
	}
</style>

<div class="time" bind:this={timeElement}>{formatTime(currentTime)}</div>

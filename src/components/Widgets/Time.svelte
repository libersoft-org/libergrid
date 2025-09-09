<script lang="ts">
	import { onMount } from 'svelte';
	let currentTime = new Date();
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	// Update time every second
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		drawTime();
		const interval = setInterval(() => {
			currentTime = new Date();
			drawTime();
		}, 1000);
		// Redraw on resize
		const resizeObserver = new ResizeObserver(drawTime);
		resizeObserver.observe(canvas);
		return () => {
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	function drawTime() {
		if (!ctx || !canvas) return;
		const timeString = formatTime(currentTime);
		const containerWidth = canvas.clientWidth;
		const containerHeight = canvas.clientHeight;
		// Set canvas size to match container
		canvas.width = containerWidth;
		canvas.height = containerHeight;
		// Clear canvas
		ctx.clearRect(0, 0, containerWidth, containerHeight);
		// Find optimal font size
		let fontSize = 10;
		ctx.font = `bold ${fontSize}px 'Ubuntu Mono', monospace`;
		// Increase font size until text doesn't fit
		while (fontSize < 1000) {
			ctx.font = `bold ${fontSize}px 'Ubuntu Mono', monospace`;
			const metrics = ctx.measureText(timeString);
			const textWidth = metrics.width;
			const textHeight = fontSize; // approximation
			if (textWidth > containerWidth * 0.95 || textHeight > containerHeight * 0.95) {
				fontSize -= 1;
				break;
			}
			fontSize += 1;
		}
		// Set final font and draw
		ctx.font = `bold ${fontSize}px 'Ubuntu Mono', monospace`;
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		// Add text stroke
		ctx.strokeStyle = 'black';
		ctx.lineWidth = Math.max(1, fontSize / 50);
		const x = containerWidth / 2;
		const y = containerHeight / 2;
		ctx.strokeText(timeString, x, y);
		ctx.fillText(timeString, x, y);
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
	canvas {
		width: 100%;
		height: 100%;
	}
</style>

<canvas bind:this={canvas}></canvas>

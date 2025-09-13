<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	import { getAPI } from '../scripts/api';
	// Chart data
	export let price: number = 0;
	export let change24h: number = 0;
	export let isLoading: boolean = true;
	export let error: string = '';
	// Chart data
	let chartData: number[] = [];
	let chartContainer: HTMLElement;
	let priceElement: HTMLElement;
	let changeElement: HTMLElement;
	// Cleanup functions
	let cleanupFunctions: (() => void)[] = [];

	// Load Bitcoin price data
	async function loadChartData() {
		try {
			isLoading = true;
			error = '';
			// Get current price from CoinGecko API
			const priceData = await getAPI('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
			if (priceData.bitcoin) {
				price = priceData.bitcoin.usd;
				change24h = priceData.bitcoin.usd_24h_change || 0;
			}
			// Get 7-day price history for chart
			const historyData = await getAPI('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily');
			if (historyData.prices) chartData = historyData.prices.map((item: [number, number]) => item[1]);
			isLoading = false;
			// Setup font managers after data load
			setTimeout(setupFontManagers, 0);
		} catch (err) {
			console.error('Error loading Bitcoin data:', err);
			error = 'Failed to load Bitcoin data';
			isLoading = false;
			setTimeout(setupFontManagers, 0);
		}
	}

	function setupFontManagers() {
		// Clear existing cleanup functions
		cleanupFunctions.forEach(cleanup => cleanup());
		cleanupFunctions = [];
		if (priceElement && !isLoading && !error) cleanupFunctions.push(autoFont(priceElement, 90, 30));
		if (changeElement && !isLoading && !error) cleanupFunctions.push(autoFont(changeElement, 90, 12));
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	}

	function formatChange(change: number): string {
		const sign = change >= 0 ? '+' : '';
		return `${sign}${change.toFixed(2)}%`;
	}

	function drawChart() {
		if (!chartContainer || chartData.length === 0) return;
		const canvas = chartContainer.querySelector('canvas') as HTMLCanvasElement;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		// Set canvas size
		const rect = chartContainer.getBoundingClientRect();
		canvas.width = rect.width * devicePixelRatio;
		canvas.height = rect.height * devicePixelRatio;
		canvas.style.width = rect.width + 'px';
		canvas.style.height = rect.height + 'px';
		ctx.scale(devicePixelRatio, devicePixelRatio);
		const width = rect.width;
		const height = rect.height;
		const padding = 10;
		// Clear canvas
		ctx.clearRect(0, 0, width, height);
		if (chartData.length < 2) return;
		// Find min and max values for scaling
		const minPrice = Math.min(...chartData);
		const maxPrice = Math.max(...chartData);
		const priceRange = maxPrice - minPrice;
		if (priceRange === 0) return;
		// Draw chart line
		ctx.beginPath();
		ctx.strokeStyle = change24h >= 0 ? '#10b981' : '#ef4444';
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		chartData.forEach((price, index) => {
			const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
			const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
			if (index === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();
		// Fill area under the curve
		ctx.lineTo(width - padding, height - padding);
		ctx.lineTo(padding, height - padding);
		ctx.closePath();
		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, change24h >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
		gradient.addColorStop(1, change24h >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)');
		ctx.fillStyle = gradient;
		ctx.fill();
	}

	onMount(() => {
		loadChartData();
		// Update data every 5 minutes
		const interval = setInterval(loadChartData, 5 * 60 * 1000);
		// Draw chart when data is available
		const chartInterval = setInterval(() => {
			if (chartData.length > 0 && chartContainer) drawChart();
		}, 100);
		return () => {
			clearInterval(interval);
			clearInterval(chartInterval);
			cleanupFunctions.forEach(cleanup => cleanup());
		};
	});

	// Redraw chart when container is resized or data changes
	$: if (chartData.length > 0 && chartContainer) {
		setTimeout(drawChart, 0);
	}
</script>

<style>
	.chart-widget {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		color: var(--color-text);
		padding: 15px;
		box-sizing: border-box;
		position: relative;
	}

	.price {
		font-weight: bold;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		width: 100%;
		color: #f7931a;
	}

	.change {
		font-weight: 600;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		width: 100%;
		font-size: 0.9em;
	}

	.change.positive {
		color: #10b981;
	}

	.change.negative {
		color: #ef4444;
	}

	.chart {
		flex: 1;
		width: 100%;
		min-height: 60px;
		position: relative;
	}

	.chart canvas {
		width: 100%;
		height: 100%;
		display: block;
	}

	.loading,
	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		text-align: center;
		opacity: 0.7;
		font-style: italic;
	}

	.error {
		color: #ef4444;
		font-size: 0.9em;
	}
</style>

<div class="chart-widget">
	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="title">Bitcoin (BTC)</div>
		<div class="price" bind:this={priceElement}>
			{formatPrice(price)}
		</div>
		<div class="change {change24h >= 0 ? 'positive' : 'negative'}" bind:this={changeElement}>
			{formatChange(change24h)}
		</div>
		<div class="chart" bind:this={chartContainer}>
			<canvas></canvas>
		</div>
	{/if}
</div>

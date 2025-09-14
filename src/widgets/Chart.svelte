<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	import { getAPI } from '../scripts/api';
	import { Chart, registerables } from 'chart.js';
	// Register Chart.js components
	Chart.register(...registerables);
	// Chart data
	export let price: number = 0;
	export let change24h: number = 0;
	export let isLoading: boolean = true;
	export let error: string = '';
	// Chart data and elements
	let chartData: number[] = [];
	let chartLabels: string[] = [];
	let chartContainer: HTMLElement;
	let priceElement: HTMLElement;
	let changeElement: HTMLElement;
	let chartInstance: Chart | null = null;
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
			if (historyData.prices) {
				chartData = historyData.prices.map((item: [number, number]) => item[1]);
				// Create labels for the last 7 days
				chartLabels = historyData.prices.map((item: [number, number]) => {
					const date = new Date(item[0]);
					return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
				});
			}
			isLoading = false;
			// Setup font managers and chart after data load
			setTimeout(() => {
				setupFontManagers();
				createChart();
			}, 0);
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

	// Create Chart.js chart
	function createChart() {
		if (!chartContainer || chartData.length === 0) return;
		const canvas = chartContainer.querySelector('canvas') as HTMLCanvasElement;
		if (!canvas) return;
		// Destroy existing chart
		if (chartInstance) chartInstance.destroy();
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const color = change24h >= 0 ? '#10b981' : '#ef4444';
		const gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradientFill.addColorStop(0, change24h >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
		gradientFill.addColorStop(1, change24h >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)');
		chartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: [
					{
						data: chartData,
						borderColor: color,
						backgroundColor: gradientFill,
						borderWidth: 2,
						fill: true,
						tension: 0.3,
						pointRadius: 0,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: color,
						pointHoverBorderColor: '#ffffff',
						pointHoverBorderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: '#ffffff',
						bodyColor: '#ffffff',
						borderColor: color,
						borderWidth: 1,
						callbacks: {
							label: function (context) {
								return `$${context.parsed.y.toLocaleString()}`;
							},
						},
					},
				},
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
					},
				},
				elements: {
					point: {
						radius: 0,
					},
				},
				interaction: {
					intersect: false,
					mode: 'index',
				},
			},
		});
	}

	onMount(() => {
		// Load chart data
		loadChartData();
		// Update data every 5 minutes
		const interval = setInterval(loadChartData, 5 * 60 * 1000);
		return () => {
			clearInterval(interval);
			if (chartInstance) {
				chartInstance.destroy();
			}
			cleanupFunctions.forEach(cleanup => cleanup());
		};
	});

	// Update chart when data changes
	$: if (chartData.length > 0 && chartContainer) {
		setTimeout(createChart, 100);
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

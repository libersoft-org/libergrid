<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	export let weatherForecast: Array<{ day: string; temp: string; icon: string }> = [];
	export let weatherError: boolean = false;
	// Elements for font management
	let titleElement: HTMLElement;
	let errorElement: HTMLElement;
	let dayNameElements: HTMLElement[] = [];
	let iconElements: HTMLElement[] = [];
	let tempElements: HTMLElement[] = [];
	// Cleanup functions
	let cleanupFunctions: (() => void)[] = [];

	// Load weather forecast from Open-Meteo API
	async function loadWeatherForecast() {
		try {
			// Prague coordinates
			const latitude = 50.0755;
			const longitude = 14.4378;
			const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weather_code&timezone=Europe%2FBerlin&forecast_days=7`);
			const data = await response.json();
			if (data.daily) {
				weatherForecast = data.daily.temperature_2m_max.map((temp: number, index: number) => {
					const date = new Date(data.daily.time[index]);
					const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
					const weatherCode = data.daily.weather_code[index];
					return {
						day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
						temp: `${Math.round(temp)}°C`,
						icon: getWeatherIcon(weatherCode),
					};
				});
				weatherError = false;
				// Setup font managers after data load
				setTimeout(setupFontManagers, 0);
			}
		} catch (error) {
			console.error('Error loading weather:', error);
			weatherError = true;
			weatherForecast = [];
			// Setup font managers after error state
			setTimeout(setupFontManagers, 0);
		}
	}

	// Convert weather code to SVG icon URL
	function getWeatherIcon(code: number): string {
		const baseUrl = 'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/';

		// WMO weather codes mapping to appropriate SVG icons
		if (code === 0) return baseUrl + 'clear-day.svg'; // Clear sky
		if (code === 1) return baseUrl + 'partly-cloudy-day.svg'; // Mainly clear
		if (code === 2) return baseUrl + 'cloudy.svg'; // Partly cloudy
		if (code === 3) return baseUrl + 'overcast.svg'; // Overcast
		if (code >= 45 && code <= 48) return baseUrl + 'fog.svg'; // Fog
		if (code >= 51 && code <= 57) return baseUrl + 'drizzle.svg'; // Drizzle
		if (code >= 61 && code <= 67) return baseUrl + 'rain.svg'; // Rain
		if (code >= 71 && code <= 77) return baseUrl + 'snow.svg'; // Snow
		if (code >= 80 && code <= 82) return baseUrl + 'partly-cloudy-day-rain.svg'; // Rain showers
		if (code >= 85 && code <= 86) return baseUrl + 'partly-cloudy-day-snow.svg'; // Snow showers
		if (code >= 95 && code <= 99) return baseUrl + 'thunderstorms.svg'; // Thunderstorm
		return baseUrl + 'clear-day.svg'; // Default
	}

	function setupFontManagers() {
		// Clear existing cleanups
		cleanupFunctions.forEach(cleanup => cleanup());
		cleanupFunctions = [];
		// Setup font managers for different elements
		if (titleElement) cleanupFunctions.push(autoFont(titleElement, 90, 10));
		if (errorElement) cleanupFunctions.push(autoFont(errorElement, 90, 10));
		// Setup font managers for day elements - individual span elements
		dayNameElements.forEach(element => {
			if (element) cleanupFunctions.push(autoFont(element, 25, 90));
		});
		// DON'T apply autoFont to iconElements - they contain SVG, not text
		tempElements.forEach(element => {
			if (element) cleanupFunctions.push(autoFont(element, 25, 90));
		});
	}

	onMount(() => {
		loadWeatherForecast();
		// Automatic refresh every 30 minutes
		const interval = setInterval(() => loadWeatherForecast(), 1800000);
		return () => {
			clearInterval(interval);
			cleanupFunctions.forEach(cleanup => cleanup());
		};
	});
</script>

<style>
	.title {
		margin-bottom: 10px;
		font-weight: bold;
		text-align: center;
	}

	.days {
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 100%;
	}

	.days .day {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1cqh solid rgba(255, 255, 255, 0.2);
		font-weight: bold;
		height: calc(100% / 7);
		box-sizing: border-box;
		padding: 0 10px;
	}

	.days .day > div {
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto; /* Don't grow or shrink, use natural size */
		min-width: 0;
		max-width: 30%; /* Respect the 30% width limit */
		overflow: hidden;
	}

	.days .day > div:has(.weather-icon) {
		height: 100%;
		aspect-ratio: 1;
		max-width: none;
	}

	.days .day:last-child {
		border-bottom: none;
	}

	.error {
		text-align: center;
		font-style: italic;
		padding: 20px 0;
	}

	.weather-icon {
		height: 100%;
		aspect-ratio: 1;
	}
</style>

{#if !weatherError}
	<div class="title" bind:this={titleElement}>Praha</div>
	<div class="days">
		{#each weatherForecast as forecast, i}
			<div class="day">
				<div bind:this={dayNameElements[i]}>{forecast.day}</div>
				<div bind:this={iconElements[i]}>
					<img src={forecast.icon} alt="Weather icon" class="weather-icon" />
				</div>
				<div bind:this={tempElements[i]}>{forecast.temp}</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="error" bind:this={errorElement}>Data cannot be loaded from internet</div>
{/if}

<script lang="ts">
	import { onMount } from 'svelte';

	export let weatherForecast: Array<{ day: string; temp: string; icon: string }> = [];
	export let weatherError: boolean = false;

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
			}
		} catch (error) {
			console.error('Error loading weather:', error);
			weatherError = true;
			weatherForecast = [];
		}
	}

	// Convert weather code to emoji icon
	function getWeatherIcon(code: number): string {
		// WMO weather codes
		if (code === 0) return '☀️'; // Clear sky
		if (code <= 3) return '⛅'; // Partly cloudy
		if (code <= 48) return '🌫️'; // Fog
		if (code <= 67) return '🌧️'; // Rain
		if (code <= 77) return '🌨️'; // Snow
		if (code <= 82) return '🌦️'; // Rain showers
		if (code <= 86) return '🌨️'; // Snow showers
		if (code <= 99) return '⛈️'; // Thunderstorm
		return '☀️'; // Default
	}

	onMount(() => {
		// Load weather forecast on startup
		loadWeatherForecast();
		// Automatic refresh every 30 minutes (1,800,000 ms)
		const interval = setInterval(() => {
			loadWeatherForecast();
		}, 1800000);
		return () => clearInterval(interval);
	});
</script>

<style>
	.weather-forecast {
		width: 100%;
	}

	.weather-title {
		margin-bottom: 10px;
		font-size: 12cqw;
		font-weight: bold;
		text-align: center;
	}

	.forecast-day {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 10cqw;
		font-weight: bold;
	}

	.forecast-day:last-child {
		border-bottom: none;
	}

	.forecast-icon {
		font-size: 10cqw;
	}

	.forecast-temp {
		font-weight: bold;
	}

	.weather-error {
		text-align: center;
		font-size: 10cqw;
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		padding: 20px 0;
	}
</style>

<div class="weather-title">Praha</div>
<div class="weather-forecast">
	{#if weatherError}
		<div class="weather-error">Data cannot be loaded from internet</div>
	{:else}
		{#each weatherForecast as forecast}
			<div class="forecast-day">
				<span>{forecast.day}</span>
				<span class="forecast-icon">{forecast.icon}</span>
				<span class="forecast-temp">{forecast.temp}</span>
			</div>
		{/each}
	{/if}
</div>

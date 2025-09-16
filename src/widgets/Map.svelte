<script lang="ts">
	import { onMount } from 'svelte';
	import L from 'leaflet';

	interface Props {
		city?: string;
		zoom?: number;
		showLegend?: boolean;
	}

	let { city = 'Prague', zoom = 10, showLegend = true }: Props = $props();

	let mapContainer: HTMLElement;
	let map: L.Map;
	let heatLayer: any;

	// Mock data for temperature map - in real application would be loaded from API
	const generateMockTemperatureData = (centerLat: number, centerLng: number) => {
		const data = [];
		const numPoints = 50;

		for (let i = 0; i < numPoints; i++) {
			// Generate random positions around center
			const lat = centerLat + (Math.random() - 0.5) * 0.1;
			const lng = centerLng + (Math.random() - 0.5) * 0.1;
			// Generate random temperature between -10 to 35°C
			const temp = Math.random() * 45 - 10;
			// Intensity for heat map (0-1)
			const intensity = (temp + 10) / 45; // Normalize to 0-1

			data.push([lat, lng, intensity, temp]);
		}

		return data;
	};

	const cityCoordinates: Record<string, [number, number]> = {
		Prague: [50.0755, 14.4378],
		Brno: [49.1951, 16.6068],
		Ostrava: [49.8209, 18.2625],
		Plzen: [49.7384, 13.3736],
		Liberec: [50.7663, 15.0568],
	};

	const initializeMap = () => {
		if (!mapContainer) return;

		const coords = cityCoordinates[city] || cityCoordinates['Prague'];

		// Create map
		map = L.map(mapContainer, {
			center: coords,
			zoom: zoom,
			zoomControl: false,
			attributionControl: false,
		});

		// Add base tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			opacity: 0.6,
		}).addTo(map);

		// Generate mock data
		const temperatureData = generateMockTemperatureData(coords[0], coords[1]);

		// Create heat layer (using simple circle marker approach)
		const markers: L.CircleMarker[] = [];

		temperatureData.forEach(([lat, lng, intensity, temp]) => {
			const color = getTemperatureColor(temp);
			const marker = L.circleMarker([lat, lng], {
				radius: 8,
				fillColor: color,
				color: color,
				weight: 1,
				opacity: 0.8,
				fillOpacity: 0.6,
			}).addTo(map);

			marker.bindTooltip(`${temp.toFixed(1)}°C`, {
				permanent: false,
				direction: 'top',
			});

			markers.push(marker);
		});

		// Add legend
		if (showLegend) {
			addLegend();
		}
	};

	const getTemperatureColor = (temp: number): string => {
		// Color scale from blue (cold) to red (hot)
		if (temp < 0) return '#0000ff'; // Blue
		if (temp < 5) return '#0080ff'; // Light blue
		if (temp < 10) return '#00ffff'; // Cyan
		if (temp < 15) return '#00ff80'; // Light green
		if (temp < 20) return '#80ff00'; // Yellow-green
		if (temp < 25) return '#ffff00'; // Yellow
		if (temp < 30) return '#ff8000'; // Orange
		return '#ff0000'; // Red
	};

	const addLegend = () => {
		const legend = L.control({ position: 'bottomright' });

		legend.onAdd = () => {
			const div = L.DomUtil.create('div', 'legend');
			const temperatures = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35];

			div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size: 12px;">Temperature (°C)</h4>';

			temperatures.forEach(temp => {
				const color = getTemperatureColor(temp);
				div.innerHTML += `<div style="display: flex; align-items: center; margin: 2px 0;">
						<div style="width: 15px; height: 15px; background: ${color}; margin-right: 5px; border: 1px solid #ccc;"></div>
						<span style="font-size: 11px;">${temp}°C</span>
					</div>`;
			});

			return div;
		};

		legend.addTo(map);
	};

	onMount(() => {
		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		// Wait for CSS to load then initialize map
		link.onload = () => {
			setTimeout(initializeMap, 100);
		};

		return () => {
			if (map) {
				map.remove();
			}
		};
	});
</script>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: 8px;
		overflow: hidden;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	:global(.legend) {
		background: rgba(255, 255, 255, 0.9);
		padding: 8px;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		font-family: Arial, sans-serif;
	}

	:global(.leaflet-container) {
		background: transparent !important;
	}

	:global(.leaflet-tooltip) {
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 11px;
		padding: 4px 6px;
	}
</style>

<div class="map-container">
	<div class="map" bind:this={mapContainer}></div>
</div>

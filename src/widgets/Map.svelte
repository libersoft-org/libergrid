<script lang="ts">
	import { onMount } from 'svelte';
	import L from 'leaflet';
	interface Props {
		latitude?: number;
		longitude?: number;
		zoom?: number;
	}
	let { latitude = 50.0755, longitude = 14.4378, zoom = 10 }: Props = $props();
	let mapContainer: HTMLElement;
	let map: L.Map;
	const initializeMap = () => {
		if (!mapContainer) return;
		// Create map
		map = L.map(mapContainer, {
			center: [latitude, longitude],
			zoom: zoom,
			zoomControl: true,
			attributionControl: true,
		});
		// Add base tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			opacity: 1,
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);
		// Force map to recalculate size
		setTimeout(() => {
			if (map) map.invalidateSize();
		}, 200);
	};

	onMount(() => {
		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);
		// Fix Leaflet default markers
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
			iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
		});
		// Wait for CSS to load then initialize map
		link.onload = () => setTimeout(initializeMap, 100);
		return () => {
			if (map) map.remove();
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
		min-height: 200px;
	}

	.map {
		width: 100%;
		height: 100%;
		min-height: 200px;
	}

	:global(.leaflet-container) {
		background: #f0f0f0 !important;
		font-family: inherit;
	}

	:global(.leaflet-control-container) {
		font-size: 12px;
	}
</style>

<div class="map-container">
	<div class="map" bind:this={mapContainer}></div>
</div>

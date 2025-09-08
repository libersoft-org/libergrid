<script lang="ts">
	// Here will be autonomous data - hardcoded for now, later we can add API calls
	let insideTemp: number = 24;
	let outsideTemp: number = 17;

	// TODO: Add real-time temperature loading from API or sensors
</script>

<style>
	.temp-label {
		font-size: 8cqw;
		margin-bottom: 5px;
	}

	.temp-item {
		font-size: 24cqw;
		font-weight: bold;
	}
</style>

<div class="temp-label">Indoor temperature</div>
<div class="temp-item">{insideTemp}°C</div>
<div class="temp-label">Outdoor temperature</div>
<div class="temp-item">{outsideTemp}°C</div>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	interface MoonPhase {
		phase: number;
		name: string;
	}
	function getMoonPhase8(when: Date = new Date()): MoonPhase {
		// Helper function: Julian Day
		function toJulianDayUTC(d: Date): number {
			const year = d.getUTCFullYear();
			let month = d.getUTCMonth() + 1;
			const day = d.getUTCDate() + (d.getUTCHours() + (d.getUTCMinutes() + d.getUTCSeconds() / 60) / 60) / 24;
			let Y = year;
			let M = month;
			if (M <= 2) {
				Y -= 1;
				M += 12;
			}
			const A = Math.floor(Y / 100);
			const B = 2 - A + Math.floor(A / 4);
			return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5;
		}
		const SYNODIC_MONTH = 29.53058867;
		const JD = toJulianDayUTC(when);
		// Reference new moon: 2000-01-06 18:14 UT (JD = 2451550.1)
		const daysSinceNew = JD - 2451550.1;
		const lunations = daysSinceNew / SYNODIC_MONTH;
		// Phase in range 0..1
		const phase = ((lunations % 1) + 1) % 1;
		// Split into 8 parts (each 1/8 of the cycle)
		const index = Math.floor(phase * 8) % 8;
		// Map to 1..8 according to the required list
		const phaseNumber = index + 1;
		const phaseNames = ['New moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
		return {
			phase: phaseNumber,
			name: phaseNames[phaseNumber - 1],
		};
	}
	let moonPhase = getMoonPhase8(new Date());
	let currentDay = new Date().getDate();
	let intervalId: number;

	onMount(() => {
		// Check every second if it's a new day
		intervalId = setInterval(() => {
			const now = new Date();
			const day = now.getDate();
			if (day !== currentDay) {
				currentDay = day;
				moonPhase = getMoonPhase8(now);
			}
		}, 1000);
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<style>
	.moon-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.moon-container img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>

<div class="moon-container">
	<img src={'img/moon/' + moonPhase.phase + '.jpg'} alt={moonPhase.name} />
</div>

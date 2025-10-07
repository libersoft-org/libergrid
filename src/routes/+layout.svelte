<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Sheep from '../components/Sheep.svelte';
	import { getSettingsValue } from '../scripts/settings.ts';
	let sheepEnabled = $state(getSettingsValue('sheepEnabled'));

	onMount(() => {
		// Listen for settings changes
		const handleSettingsUpdate = (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail.key === 'sheepEnabled') {
				sheepEnabled = customEvent.detail.value;
			}
		};

		window.addEventListener('settingsUpdate', handleSettingsUpdate);

		return () => {
			window.removeEventListener('settingsUpdate', handleSettingsUpdate);
		};
	});
</script>

{#if sheepEnabled}
	<Sheep />
{/if}
<slot />

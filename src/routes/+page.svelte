<script lang="ts">
	import { onMount } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';
	import Background from '../components/Background.svelte';
	import Dashboard from '../components/Dashboard.svelte';
	import Panel from '../components/Panel.svelte';
	import Sheep from '../components/Sheep.svelte';
	let sheepEnabled = $state(getSettingsValue('sheepEnabled'));
	let sheepCount = $state(getSettingsValue('sheepCount'));
	let sheepSize = $state(getSettingsValue('sheepSize'));

	onMount(() => {
		// Listen for settings changes
		const handleSettingsUpdate = (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail.key === 'sheepEnabled') {
				sheepEnabled = customEvent.detail.value;
			}
			if (customEvent.detail.key === 'sheepCount') {
				sheepCount = customEvent.detail.value;
			}
			if (customEvent.detail.key === 'sheepSize') {
				sheepSize = customEvent.detail.value;
			}
		};

		window.addEventListener('settingsUpdate', handleSettingsUpdate);

		return () => {
			window.removeEventListener('settingsUpdate', handleSettingsUpdate);
		};
	});
</script>

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>
<Background />
<Dashboard />
<Panel />
{#if sheepEnabled && sheepCount > 0}
	{#each Array(sheepCount) as _, i (i)}
		<Sheep />
	{/each}
{/if}

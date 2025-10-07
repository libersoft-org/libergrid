<script lang="ts">
	import { onMount } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';
	import Background from '../components/Background.svelte';
	import Dashboard from '../components/Dashboard.svelte';
	import Panel from '../components/Panel.svelte';
	import Sheep from '../components/Sheep.svelte';

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

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>
<Background />
<Dashboard />
<Panel />
{#if sheepEnabled}
	<Sheep />
{/if}

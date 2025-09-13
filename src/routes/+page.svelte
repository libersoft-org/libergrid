<script lang="ts">
	import Background from '../components/Background.svelte';
	import Dashboard from '../components/Dashboard.svelte';
	import Panel from '../components/Panel.svelte';

	let backgroundComponent: Background;
</script>

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>
<Background bind:this={backgroundComponent} />
<Dashboard onDashboardClick={() => backgroundComponent?.handleDashboardClick()} />
<Panel />

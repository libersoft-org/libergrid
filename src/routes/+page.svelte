<script lang="ts">
	import Dashboard from '../components/Dashboard.svelte';
	import Background from '../components/Background.svelte';

	let backgroundComponent: Background;
</script>

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>

<Background bind:this={backgroundComponent} />
<Dashboard onDashboardClick={() => backgroundComponent?.handleDashboardClick()} />

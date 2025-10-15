<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	import { getAPILocal } from '../scripts/api.ts';
	import Spinner from '../components/Spinner.svelte';
	let publicIP = $state<string | null>(null);
	let privateIP = $state<string | null>(null);
	let publicLabelElement: HTMLElement | undefined = $state();
	let publicIPElement: HTMLElement | undefined = $state();
	let privateLabelElement: HTMLElement | undefined = $state();
	let privateIPElement: HTMLElement | undefined = $state();
	let cleanupFunctions: (() => void)[] = [];
	let refreshTimer: number | undefined;
	const refresh = 60000; // 60 seconds

	async function getPrivateIP(): Promise<string> {
		try {
			const data = await getAPILocal('ip-private');
			return data?.ip || 'N/A';
		} catch (error) {
			console.error('Failed to load private IP from API:', error);
			return 'N/A';
		}
	}

	async function getPublicIP(): Promise<string> {
		try {
			const data = await getAPILocal('ip-public');
			return data?.ip || 'N/A';
		} catch (error) {
			console.error('Failed to load public IP from API:', error);
			return 'N/A';
		}
	}

	async function loadIPData() {
		try {
			privateIP = await getPrivateIP();
		} catch (error) {
			console.error('Failed to load private IP:', error);
			privateIP = 'N/A';
		}
		try {
			publicIP = await getPublicIP();
		} catch (error) {
			console.error('Failed to load public IP:', error);
			publicIP = 'N/A';
		}
		// Setup font managers after data loads
		setTimeout(setupFontManagers, 0);
	}

	function setupFontManagers() {
		// Clear existing cleanups
		cleanupFunctions.forEach(cleanup => cleanup());
		cleanupFunctions = [];
		// Setup font managers with individual settings
		const elements = [
			{ element: publicLabelElement, width: 80, height: 20 },
			{ element: publicIPElement, width: 80, height: 40 },
			{ element: privateLabelElement, width: 80, height: 20 },
			{ element: privateIPElement, width: 80, height: 40 },
		];
		elements.forEach(({ element, width, height }) => {
			if (element) {
				cleanupFunctions.push(autoFont(element, width, height));
			}
		});
	}

	onMount(() => {
		loadIPData();
		refreshTimer = setInterval(loadIPData, refresh) as unknown as number;
		return () => {
			if (refreshTimer) clearInterval(refreshTimer);
			cleanupFunctions.forEach(cleanup => cleanup());
		};
	});
</script>

<style>
	.ip-item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1vw;
		width: 100%;
		height: 50%;
	}

	.ip-item .label {
		color: #888;
	}

	.ip-item .value {
		font-weight: bold;
		line-height: 1.2;
	}

	.divider {
		width: 90%;
		height: 1cqmin;
		background-color: #888;
		min-height: 1px;
		border-radius: 0.5cqmin;
	}
</style>

<div class="ip-item">
	<div class="label" bind:this={publicLabelElement}>Public IP</div>
	{#if publicIP === null}
		<Spinner color="#888" />
	{:else}
		<div class="value" bind:this={publicIPElement}>{publicIP}</div>
	{/if}
</div>
<div class="divider"></div>
<div class="ip-item">
	<div class="label" bind:this={privateLabelElement}>Private IP</div>
	{#if privateIP === null}
		<Spinner color="#888" />
	{:else}
		<div class="value" bind:this={privateIPElement}>{privateIP}</div>
	{/if}
</div>

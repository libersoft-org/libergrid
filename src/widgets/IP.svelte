<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../scripts/font';
	import { getAPI } from '../scripts/api';

	interface IPData {
		publicIP: string | null;
		privateIP: string | null;
	}

	let ipData: IPData = $state({
		publicIP: null,
		privateIP: null,
	});

	// Elements for font management
	let publicLabelElement: HTMLElement;
	let publicIPElement: HTMLElement;
	let privateLabelElement: HTMLElement;
	let privateIPElement: HTMLElement;

	// Cleanup functions
	let cleanupFunctions: (() => void)[] = [];
	let refreshTimer: number | undefined;

	const refresh = 60000; // 60 seconds

	async function getPrivateIP(): Promise<string> {
		try {
			const data = await getAPI('http://127.0.0.1/ip-private');
			return data?.ip || 'N/A';
		} catch (error) {
			console.error('Failed to load private IP from API:', error);
			return 'N/A';
		}
	}

	async function getPublicIP(): Promise<string> {
		try {
			const data = await getAPI('http://127.0.0.1/ip-public');
			return data?.ip || 'N/A';
		} catch (error) {
			console.error('Failed to load public IP from API:', error);
			// Fallback to external service
			try {
				const response = await fetch('https://api.ipify.org?format=json');
				const fallbackData = await response.json();
				return fallbackData.ip || 'N/A';
			} catch (fallbackError) {
				console.error('Failed to load public IP from fallback:', fallbackError);
				return 'N/A';
			}
		}
	}

	async function loadIPData() {
		try {
			ipData.privateIP = await getPrivateIP();
		} catch (error) {
			console.error('Failed to load private IP:', error);
			ipData.privateIP = 'N/A';
		}

		try {
			ipData.publicIP = await getPublicIP();
		} catch (error) {
			console.error('Failed to load public IP:', error);
			ipData.publicIP = 'N/A';
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

{#if ipData.publicIP !== null && ipData.privateIP !== null}
	<div class="ip-item">
		<div class="label" bind:this={publicLabelElement}>Public IP</div>
		<div class="value" bind:this={publicIPElement}>{ipData.publicIP}</div>
	</div>
	<div class="divider"></div>
	<div class="ip-item">
		<div class="label" bind:this={privateLabelElement}>Private IP</div>
		<div class="value" bind:this={privateIPElement}>{ipData.privateIP}</div>
	</div>
{/if}

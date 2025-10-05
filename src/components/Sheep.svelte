<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';

	let sheepInstance: any = null;
	let sheepEnabled = $state(getSettingsValue('sheepEnabled'));

	function updateSheepStatus() {
		const enabled = getSettingsValue('sheepEnabled');
		sheepEnabled = enabled;

		if (typeof window !== 'undefined' && (window as any).eSheep) {
			if (enabled && !sheepInstance) {
				// Start sheep
				sheepInstance = new (window as any).eSheep();
				sheepInstance.Start();
			} else if (!enabled && sheepInstance) {
				// Stop sheep
				try {
					sheepInstance.Stop();
				} catch (e) {
					console.warn('Failed to stop sheep:', e);
				}
				sheepInstance = null;
			}
		}
	}

	function handleSettingsUpdate(event: CustomEvent) {
		if (event.detail.key === 'sheepEnabled') {
			updateSheepStatus();
		}
	}

	onMount(() => {
		// Listen for settings changes
		window.addEventListener('settingsUpdate', handleSettingsUpdate as EventListener);

		// Initialize sheep if enabled
		updateSheepStatus();
	});

	onDestroy(() => {
		window.removeEventListener('settingsUpdate', handleSettingsUpdate as EventListener);

		// Clean up sheep instance
		if (sheepInstance) {
			try {
				sheepInstance.Stop();
			} catch (e) {
				console.warn('Failed to stop sheep on destroy:', e);
			}
			sheepInstance = null;
		}
	});
</script>

<!-- Sheep is initialized via script, no template needed -->

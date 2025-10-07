<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let sheepInstance: any = null;

	onMount(() => {
		// Start sheep when component mounts
		if (typeof window !== 'undefined' && (window as any).eSheep) {
			try {
				sheepInstance = new (window as any).eSheep();
				sheepInstance.Start();
			} catch (e) {
				console.warn('Failed to start sheep:', e);
			}
		}
	});

	onDestroy(() => {
		// Stop and remove sheep when component is destroyed
		if (sheepInstance && typeof sheepInstance.remove === 'function') {
			try {
				sheepInstance.remove();
			} catch (e) {
				console.warn('Failed to remove sheep:', e);
			}
			sheepInstance = null;
		}
	});
</script>

<!-- Sheep is initialized via script, no template needed -->

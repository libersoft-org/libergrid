<script lang="ts">
	import Window from '../components/Window.svelte';
	import Menu from '../components/Menu.svelte';
	import MenuItem from '../components/MenuItem.svelte';
	import { getAPI } from '../scripts/api.ts';
	interface Props {
		show?: boolean;
		onClose?: () => void;
	}
	let { show = false, onClose = () => {} }: Props = $props();

	async function handleShutdown() {
		try {
			await getAPI('http://127.0.0.1/api/poweroff');
		} catch (error) {
			console.error('Failed to shutdown:', error);
			alert('Failed to shutdown the system');
		}
	}

	async function handleRestart() {
		try {
			await getAPI('http://127.0.0.1/api/restart');
		} catch (error) {
			console.error('Failed to restart:', error);
			alert('Failed to restart the system');
		}
	}
</script>

<Window {show} title="Power settings" {onClose} maxWidth="50vw">
	<Menu>
		<MenuItem text="Shut down" onClick={handleShutdown} />
		<MenuItem text="Restart" onClick={handleRestart} />
	</Menu>
</Window>

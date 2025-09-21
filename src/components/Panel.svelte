<script lang="ts">
	import { showFields } from '../scripts/dashboard.ts';
	import Icon from './Icon.svelte';
	import WindowSettings from '../windows/Settings.svelte';
	let showWindowSettings: boolean = $state(false);
	let isHovered: boolean = $state(false);

	function openWindowSettings() {
		showWindowSettings = true;
	}

	function closeWindowSettings() {
		showWindowSettings = false;
	}
</script>

<style>
	.panel {
		z-index: 1000;
		position: fixed;
		width: 100%;
		height: 4vh;
		background-color: rgba(255, 255, 255, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(3px);
		transition: all 0.5s ease;
	}

	.panel:hover {
		height: 10vh;
		background-color: rgba(255, 255, 255, 0.5);
		border-color: rgba(255, 255, 255, 0.8);
	}
</style>

{#if $showFields}
	<div class="panel">
		<Icon img="img/settings.svg" alt="Settings" size="0.8cqh" padding="10px" onClick={openWindowSettings} />
	</div>
{/if}
<WindowSettings show={showWindowSettings} onClose={closeWindowSettings} />

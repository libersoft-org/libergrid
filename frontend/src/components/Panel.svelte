<script lang="ts">
	import { showFields } from '../scripts/dashboard.ts';
	import Icon from './Icon.svelte';
	import WindowSettings from '../windows/Settings.svelte';
	import WindowPower from '../windows/Power.svelte';
	let showWindowSettings: boolean = $state(false);
	let showWindowPower: boolean = $state(false);

	function openWindowSettings() {
		showWindowSettings = true;
	}

	function closeWindowSettings() {
		showWindowSettings = false;
	}

	function openWindowPower() {
		showWindowPower = true;
	}

	function closeWindowPower() {
		showWindowPower = false;
	}
</script>

<style>
	.panel {
		z-index: 1000;
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 4vh;
		background-color: rgba(255, 255, 255, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(3px);
		transition: all 0.5s ease;
		--icon-size: 2vh;
	}

	.panel:hover {
		height: 10vh;
		background-color: rgba(255, 255, 255, 0.5);
		border-color: rgba(255, 255, 255, 0.8);
		--icon-size: 8vh;
	}

	.panel :global(.icon img) {
		width: var(--icon-size) !important;
		height: var(--icon-size) !important;
		min-width: var(--icon-size) !important;
		max-width: var(--icon-size) !important;
		min-height: var(--icon-size) !important;
		max-height: var(--icon-size) !important;
		transition: all 0.5s ease;
	}
</style>

{#if $showFields}
	<div class="panel">
		<Icon img="img/settings.svg" alt="Settings" padding="10px" onClick={openWindowSettings} />
		<Icon img="img/power.svg" alt="Power" padding="10px" onClick={openWindowPower} />
	</div>
{/if}
<WindowSettings show={showWindowSettings} onClose={closeWindowSettings} />
<WindowPower show={showWindowPower} onClose={closeWindowPower} />

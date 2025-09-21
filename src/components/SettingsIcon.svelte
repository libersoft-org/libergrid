<script lang="ts">
	import { showFields } from '../scripts/dashboard.ts';
	import Icon from '../components/Icon.svelte';
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
	.settings-icon {
		z-index: 1000;
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0;
		right: 0;
		width: 2vw;
		height: 2vw;
		background: rgba(255, 255, 255, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-radius: 0.5vw;
		cursor: pointer;
		backdrop-filter: blur(3px);
		transition: all 0.5s ease;
	}

	.settings-icon:hover {
		width: 5vw;
		height: 5vw;
		border-radius: 1vw;
		background: rgba(255, 255, 255, 0.5);
		border-color: rgba(255, 255, 255, 0.8);
	}
</style>

{#if $showFields}
	<div class="settings-icon" onmouseenter={() => (isHovered = true)} onmouseleave={() => (isHovered = false)}>
		<Icon img="img/settings.svg" alt="Settings" size={isHovered ? '3cqw' : '1cqw'} padding="10px" onClick={openWindowSettings} />
	</div>
{/if}
<WindowSettings show={showWindowSettings} onClose={closeWindowSettings} />

<script lang="ts">
	import Window from '../components/Window.svelte';
	import Switch from '../components/Switch.svelte';

	interface Props {
		show?: boolean;
		transparency?: boolean;
		onClose?: () => void;
		onTransparencyChange?: (newTransparency: boolean) => void;
	}

	let { show = false, transparency = $bindable(true), onClose = () => {}, onTransparencyChange = () => {} }: Props = $props();
</script>

<style>
	.settings-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.settings-row:last-child {
		border-bottom: none;
	}

	.setting-label {
		color: white;
		font-size: 16px;
		font-weight: 500;
	}

	.setting-description {
		color: rgba(255, 255, 255, 0.7);
		font-size: 14px;
		margin-top: 4px;
	}
</style>

<Window {show} title="Widget Settings" {onClose} maxWidth="500px">
	<div class="settings-row">
		<div>
			<div class="setting-label">Transparency</div>
			<div class="setting-description">Enable transparent background with blur effect</div>
			<div style="font-size: 12px; color: #999;">Current value: {transparency}</div>
		</div>
		<Switch bind:checked={transparency} onChange={onTransparencyChange} />
	</div>
</Window>

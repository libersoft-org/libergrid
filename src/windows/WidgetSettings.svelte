<script lang="ts">
	import Window from '../components/Window.svelte';
	import WindowTitle from '../components/WindowTitle.svelte';
	import Switch from '../components/Switch.svelte';
	import Range from '../components/Range.svelte';
	import { updateWidgetSetting } from '../scripts/dashboard.ts';

	interface Props {
		show?: boolean;
		transparency?: boolean;
		blur?: boolean;
		blurIntensity?: number;
		widgetId: string; // Required for reactive updates
		onClose?: () => void;
	}
	let { show = false, transparency = $bindable(false), blur = $bindable(false), blurIntensity = $bindable(5), widgetId, onClose = () => {} }: Props = $props();

	// Reactive functions that update the store instead of calling callbacks
	function handleTransparencyChange(newTransparency: boolean) {
		updateWidgetSetting(widgetId, 'transparency', newTransparency);
	}

	function handleBlurChange(newBlur: boolean) {
		updateWidgetSetting(widgetId, 'blur', newBlur);
	}

	function handleBlurIntensityChange() {
		updateWidgetSetting(widgetId, 'blurIntensity', blurIntensity);
	}
</script>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 0.5vw;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.text {
		font-size: 0.6vw;
	}
</style>

<Window {show} title="Widget Settings" {onClose} maxWidth="500px">
	<div class="settings">
		<WindowTitle text="Widget background" />
		<div class="row">
			<div class="text">Transparency:</div>
			<Switch bind:checked={transparency} onChange={handleTransparencyChange} />
		</div>
		<div class="row">
			<div class="text">Blur:</div>
			<Switch bind:checked={blur} onChange={handleBlurChange} />
		</div>
		<div class="row">
			<div class="text">Blur intensity:</div>
			<div style="width: 100px;">
				<Range min="0" max="30" step="1" bind:value={blurIntensity} onchange={handleBlurIntensityChange} />
			</div>
			<div class="text" style="min-width: 30px; text-align: right;">{blurIntensity}px</div>
		</div>
	</div>
</Window>

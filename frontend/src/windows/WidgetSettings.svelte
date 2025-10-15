<script lang="ts">
	import Window from '../components/Window.svelte';
	import WindowTitle from '../components/WindowTitle.svelte';
	import Input from '../components/Input.svelte';
	import Switch from '../components/Switch.svelte';
	import Range from '../components/Range.svelte';
	import { updateWidgetSetting } from '../scripts/dashboard.ts';
	interface Props {
		show?: boolean;
		blur?: boolean;
		blurIntensity?: number;
		backgroundColor?: string;
		backgroundTransparency?: boolean;
		backgroundTransparencyIntensity?: number;
		widgetId: string; // Required for reactive updates
		onClose?: () => void;
	}
	let { show = false, blur = $bindable(false), blurIntensity = $bindable(5), backgroundColor = $bindable('#000000'), backgroundTransparency = $bindable(false), backgroundTransparencyIntensity = $bindable(70), widgetId, onClose = () => {} }: Props = $props();

	function handleBlurChange(newBlur: boolean) {
		updateWidgetSetting(widgetId, 'blur', newBlur);
	}

	function handleBlurIntensityChange() {
		updateWidgetSetting(widgetId, 'blurIntensity', blurIntensity);
	}

	function handleBackgroundTransparencyChange(newBackgroundTransparency: boolean) {
		updateWidgetSetting(widgetId, 'backgroundTransparency', newBackgroundTransparency);
	}

	function handleBackgroundColorChange(event: Event) {
		const target = event.target as HTMLInputElement;
		backgroundColor = target.value;
		updateWidgetSetting(widgetId, 'backgroundColor', backgroundColor);
	}

	function handleBackgroundTransparencyIntensityChange() {
		updateWidgetSetting(widgetId, 'backgroundTransparencyIntensity', backgroundTransparencyIntensity);
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

	.color-input {
		width: 40px;
		height: 30px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>

<Window {show} title="Widget Settings" {onClose} maxWidth="500px">
	<div class="settings">
		<WindowTitle text="Widget background" />
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
		<div class="row">
			<div class="text">Background color:</div>
			<Input type="color" class="color-input" bind:value={backgroundColor} onChange={handleBackgroundColorChange} disabled={backgroundTransparency} />
		</div>
		<div class="row">
			<div class="text">Background transparency:</div>
			<Switch bind:checked={backgroundTransparency} onChange={handleBackgroundTransparencyChange} />
		</div>
		<div class="row">
			<div class="text">Background transparency intensity:</div>
			<div style="width: 100px;">
				<Range min="0" max="100" step="1" bind:value={backgroundTransparencyIntensity} onchange={handleBackgroundTransparencyIntensityChange} />
			</div>
			<div class="text" style="min-width: 30px; text-align: right;">{backgroundTransparencyIntensity}%</div>
		</div>
	</div>
</Window>

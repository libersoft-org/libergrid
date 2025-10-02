<script lang="ts">
	import Window from '../components/Window.svelte';
	import WindowTitle from '../components/WindowTitle.svelte';
	import Switch from '../components/Switch.svelte';
	import Range from '../components/Range.svelte';
	interface Props {
		show?: boolean;
		transparency?: boolean;
		blur?: boolean;
		blurIntensity?: number;
		onClose?: () => void;
		onTransparencyChange?: (newTransparency: boolean) => void;
		onBlurChange?: (newBlur: boolean) => void;
		onBlurIntensityChange?: (newBlurIntensity: number) => void;
	}
	let { show = false, transparency = $bindable(false), blur = $bindable(false), blurIntensity = $bindable(5), onClose = () => {}, onTransparencyChange = () => {}, onBlurChange = () => {}, onBlurIntensityChange = () => {} }: Props = $props();
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
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
			<Switch bind:checked={transparency} onChange={onTransparencyChange} />
		</div>
		<div class="row">
			<div class="text">Blur:</div>
			<Switch bind:checked={blur} onChange={onBlurChange} />
		</div>
		<div class="row">
			<div class="text">Blur intensity:</div>
			<div style="width: 100px;">
				<Range min="0" max="30" step="1" bind:value={blurIntensity} onchange={() => onBlurIntensityChange(blurIntensity)} />
			</div>
			<div class="text" style="min-width: 30px; text-align: right;">{blurIntensity}px</div>
		</div>
	</div>
</Window>

<script lang="ts">
	interface Props {
		size?: number;
		checked?: boolean;
		'data-testid'?: string;
	}
	let { size = 3, checked = $bindable(), ...restProps }: Props = $props();
	let inputId = Math.random().toString(36);
	const switchWidth = size + 'vw';
	const switchHeight = size * 0.6 + 'vw';
	const borderWidth = size * 0.04 + 'vw';
	const sliderSize = size * 0.4 + 'vw';
	const sliderOffset = size * 0.06 + 'vw';
	const sliderTranslate = size * 0.4 + 'vw';

	function keyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			checked = !checked;
		}
	}
</script>

<style>
	.switch {
		display: flex;
		align-items: center;
		gap: 10px;
		width: fit-content;
	}

	.switch-wrapper {
		position: relative;
		display: inline-block;
	}

	.switch input {
		position: absolute;
		opacity: 0.001;
		cursor: pointer;
	}

	.switch .slider {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #800;
		border: solid #fff;
		cursor: pointer;
		pointer-events: none;
		transition: background-color 0.4s ease;
	}

	.switch .slider:before {
		transition: transform 0.4s ease;
	}

	.switch .slider:before {
		position: absolute;
		content: '';
		height: var(--slider-size);
		width: var(--slider-size);
		left: var(--slider-offset);
		bottom: var(--slider-offset);
		background-color: #fff;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: #080;
	}

	input:checked + .slider:before {
		transform: translateX(var(--slider-translate));
	}

	.switch input:focus-visible + .slider {
		outline: auto;
	}
</style>

<div class="switch">
	<div class="switch-wrapper" style:width={switchWidth} style:height={switchHeight}>
		<input {...restProps} id={inputId} type="checkbox" bind:checked onkeydown={keyPress} style:width={switchWidth} style:height={switchHeight} />
		<span class="slider" style:border-radius={switchHeight} style:border-width={borderWidth} style:--slider-size={sliderSize} style:--slider-offset={sliderOffset} style:--slider-translate={sliderTranslate}></span>
	</div>
</div>

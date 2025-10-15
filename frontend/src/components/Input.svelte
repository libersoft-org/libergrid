<script lang="ts">
	import Icon from './Icon.svelte';
	interface Props {
		type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'color';
		placeholder?: string;
		value?: string | number;
		enabled?: boolean;
		displayValue?: string | number;
		expand?: boolean;
		minWidth?: string;
		maxWidth?: string;
		onKeydown?: (e: KeyboardEvent) => void;
		onFocus?: (e: FocusEvent) => void;
		onBlur?: (e: FocusEvent) => void;
		onClick?: (e: MouseEvent) => void;
		min?: number;
		max?: number;
		step?: number;
		icon?: {
			img: string;
			alt: string;
			onClick?: (e: Event) => void;
			colorVariable?: string;
		};
		inputRef?: HTMLInputElement;
		'data-testid'?: string;
		onChange?: (e: Event) => void;
	}
	let { type = 'text', placeholder = '', value = $bindable(), enabled = true, displayValue, expand = true, minWidth, maxWidth, onKeydown, onFocus, onBlur, onClick, min, max, step, icon, inputRef = $bindable(), 'data-testid': testId, onChange }: Props = $props();

	function handleKeydown(e) {
		if (onKeydown) onKeydown(e);
	}

	function handleFocus(e) {
		if (onFocus) onFocus(e);
	}

	function handleBlur(e) {
		if (onBlur) onBlur(e);
	}

	function handleClick(e) {
		if (onClick) onClick(e);
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		setValue(target.value);
		if (onChange) onChange(e);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		setValue(target.value);
	}

	function setValue(newValue: string | number) {
		value = type === 'number' ? Number(newValue) : newValue;
	}

	export function focus() {
		inputRef?.focus();
	}
</script>

<style>
	input {
		box-sizing: border-box;
		padding: 0.5vw;
		border-radius: 0.5vw;
		font-family: inherit;
		font-size: 1vw;
		background-color: #fff;
		color: #000;
	}

	.no-button {
		border: 0.1vw solid #000;
	}

	.button {
		width: 100%;
		border: 0;
		outline: none;
	}

	input:focus {
		outline: none;
	}

	input:disabled {
		border: 0.1vw solid #ccc;
		background-color: #f5f5f5;
		color: #ccc;
	}

	input.expand {
		width: 100%;
	}

	input[type='number'] {
		padding-right: 0.5vw;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		opacity: 1;
		transform: scale(2);
		cursor: pointer;
	}

	.input-button-wrapper {
		display: flex;
		box-sizing: border-box;
		align-items: center;
		border: 0.1vw solid #000;
		border-radius: 0.5vw;
		background-color: #fff;
	}

	.input-button-wrapper:focus-within {
		outline: 0.2vw solid #000;
	}
</style>

{#if icon}
	<div class="input-button-wrapper" style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth}>
		<input class="button" class:expand {type} {placeholder} bind:this={inputRef} value={displayValue !== undefined ? displayValue : value} onkeydown={e => handleKeydown(e)} onchange={handleChange} oninput={handleInput} onfocus={handleFocus} onblur={handleBlur} onclick={handleClick} {min} {max} {step} />
		<Icon img={icon.img} alt={icon.alt} size="1vw" padding="1vw" onClick={icon.onClick} />
	</div>
{:else}
	<input class="no-button" data-testid={testId} value={displayValue !== undefined ? displayValue : value} disabled={!enabled} onchange={handleChange} oninput={handleInput} class:expand style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth} {type} {placeholder} {min} {max} {step} bind:this={inputRef} onkeydown={e => handleKeydown(e)} onfocus={handleFocus} onblur={handleBlur} onclick={handleClick} />
{/if}

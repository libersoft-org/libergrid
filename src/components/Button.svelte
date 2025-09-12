<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'close' | 'remove' = 'primary';
	export let onClick: () => void = () => {};
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
	export let ariaLabel: string = '';

	function handleClick(event: MouseEvent) {
		// Stop propagation for remove buttons to prevent dashboard background actions
		if (variant === 'remove') {
			event.stopPropagation();
		}
		onClick();
	}
</script>

<style>
	.button {
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		background: none;
		color: white;
		font-weight: bold;
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.button-primary {
		padding: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.5vw;
		background: rgba(255, 255, 255, 0.1);
		text-align: center;
		font-size: 16px;
	}

	.button-primary:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.2);
	}

	.button-secondary {
		padding: 0.5rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.25vw;
		background: rgba(255, 255, 255, 0.05);
		font-size: 14px;
	}

	.button-secondary:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.1);
	}

	.button-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-size: 24px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 0, 0, 0.1);
	}

	.button-close:hover:not(:disabled) {
		background: rgba(255, 0, 0, 0.3);
	}

	.button-remove {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(255, 0, 0, 0.7);
		font-size: 16px;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.button-remove:hover:not(:disabled) {
		background: rgba(255, 0, 0, 0.9);
	}
</style>

<button class="button button-{variant}" {type} {disabled} on:click={handleClick} aria-label={ariaLabel}>
	<slot />
</button>

<script lang="ts">
	import Button from './Button.svelte';
	interface Props {
		show?: boolean;
		title?: string;
		onClose?: () => void;
		maxWidth?: string;
	}
	let { show = false, title = '', onClose = () => {}, maxWidth = '400px' }: Props = $props();

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') onClose();
	}

	function handleOverlayClick(): void {
		onClose();
	}
</script>

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	.window {
		background-color: rgba(0, 0, 0, 0.9);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 1vw;
		padding: 2rem;
		backdrop-filter: blur(10px);
		width: 90%;
		position: relative;
	}

	.title {
		margin: 0 0 1rem 0;
		text-align: center;
		font-size: 24px;
		font-weight: bold;
		color: #fff;
	}
</style>

{#if show}
	<div class="overlay" on:click={handleOverlayClick} on:keydown={handleKeydown} role="dialog" tabindex="0" aria-modal="true" aria-label="Dialog window">
		<div class="window" style="max-width: {maxWidth}" on:click={e => e.stopPropagation()} on:keydown={e => e.stopPropagation()} role="dialog" tabindex="0" aria-labelledby="title">
			<Button variant="close" onClick={onClose} ariaLabel="Close window">×</Button>
			{#if title}
				<div class="title" id="title">{title}</div>
			{/if}
			<slot />
		</div>
	</div>
{/if}

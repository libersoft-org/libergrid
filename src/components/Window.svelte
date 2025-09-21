<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		show?: boolean;
		title?: string;
		onClose?: () => void;
		maxWidth?: string;
		children?: Snippet;
	}
	let { show = false, title = '', onClose = () => {}, maxWidth = '400px', children }: Props = $props();

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
		backdrop-filter: blur(10px);
		width: 90%;
		position: relative;
	}

	.window .title-bar {
		display: flex;
	}

	.window .title-bar .title {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 1;
		text-align: center;
		font-size: 24px;
		font-weight: bold;
		color: #fff;
	}

	.window .title-bar .close {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.window .body {
		padding: 1vw;
	}
</style>

{#if show}
	<div class="overlay" onclick={handleOverlayClick} onkeydown={handleKeydown} role="dialog" tabindex="0" aria-modal="true" aria-label="Dialog window">
		<div class="window" style="max-width: {maxWidth}" onclick={e => e.stopPropagation()} onkeydown={e => e.stopPropagation()} role="dialog" tabindex="0" aria-labelledby="title">
			<div class="title-bar">
				<div class="title">{title}</div>
				<Icon img="img/cross.svg" alt="Close" padding="10px" onClick={onClose} />
			</div>
			<div class="body">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}

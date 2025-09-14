<script lang="ts">
	import Button from '../components/Button.svelte';
	import { widgets, type IWidget } from '../scripts/dashboard.ts';
	export let show: boolean = false;
	export let onAddComponent: (type: IWidget['type']) => void;
	export let onClose: () => void;

	function handleAddComponent(type: IWidget['type']) {
		onAddComponent(type);
		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}

	function handleOverlayClick() {
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
		max-width: 400px;
		width: 90%;
	}

	.window .title {
		margin: 0 0 1rem 0;
		text-align: center;
		font-size: 24px;
		font-weight: bold;
		color: #fff;
	}

	.options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
</style>

{#if show}
	<div class="overlay" onclick={handleOverlayClick} onkeydown={handleKeydown} role="dialog" tabindex="0" aria-modal="true" aria-label="Add component window">
		<div class="window" onclick={e => e.stopPropagation()} onkeydown={e => e.stopPropagation()} role="dialog" tabindex="0" aria-labelledby="title">
			<Button variant="close" onClick={onClose} ariaLabel="Close window">×</Button>
			<div class="title">Select component</div>
			<div class="options">
				{#each widgets as widget (widget.type)}
					<Button variant="primary" onClick={() => handleAddComponent(widget.type)}>
						{widget.label}
					</Button>
				{/each}
			</div>
		</div>
	</div>
{/if}

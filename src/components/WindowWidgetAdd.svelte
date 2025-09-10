<script lang="ts">
	import Button from './Button.svelte';
	export let show: boolean = false;
	export let onAddComponent: (type: 'time' | 'date' | 'temp' | 'weather' | 'nameday') => void;
	export let onClose: () => void;

	function handleAddComponent(type: 'time' | 'date' | 'temp' | 'weather' | 'nameday') {
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
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	.window {
		background: rgba(0, 0, 0, 0.9);
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
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
</style>

{#if show}
	<div class="overlay" on:click={handleOverlayClick} on:keydown={handleKeydown} role="window" tabindex="0" aria-label="Add component window">
		<div class="window" on:click|stopPropagation on:keydown|stopPropagation role="window" tabindex="0" aria-labelledby="title">
			<Button variant="close" onClick={onClose} ariaLabel="Close window">×</Button>
			<div class="title">Select component</div>
			<div class="options">
				<Button variant="primary" onClick={() => handleAddComponent('time')}>Time</Button>
				<Button variant="primary" onClick={() => handleAddComponent('date')}>Date</Button>
				<Button variant="primary" onClick={() => handleAddComponent('temp')}>Temperature</Button>
				<Button variant="primary" onClick={() => handleAddComponent('weather')}>Weather</Button>
				<Button variant="primary" onClick={() => handleAddComponent('nameday')}>Name day</Button>
			</div>
		</div>
	</div>
{/if}

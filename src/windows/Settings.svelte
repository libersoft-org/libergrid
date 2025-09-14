<script lang="ts">
	import { onMount } from 'svelte';
	import Window from '../components/Window.svelte';
	import { backgroundStore, backgroundMedia, type BackgroundItem } from '../scripts/background';

	interface Props {
		show?: boolean;
		onClose?: () => void;
	}

	let { show = false, onClose = () => {} }: Props = $props();
	let currentBackground: BackgroundItem = backgroundStore.current;

	$: console.log('Settings component, show prop:', show);

	onMount(() => {
		// Subscribe to background changes
		const unsubscribeBackground = backgroundStore.subscribe(background => {
			currentBackground = background;
		});

		return () => {
			unsubscribeBackground();
		};
	});

	function handleBackgroundSelect(index: number) {
		backgroundStore.setBackground(index);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleBackgroundSelect(index);
		}
	}
</script>

<style>
	.background-selector {
		margin-bottom: 20px;
	}

	.background-selector h3 {
		margin-bottom: 10px;
		font-size: 16px;
		font-weight: bold;
		color: white;
	}

	.background-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 8px;
	}

	.background-item {
		position: relative;
		aspect-ratio: 16/9;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	.background-item.active {
		border-color: #007acc;
	}

	.background-item:hover {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.background-item:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3);
	}

	.background-thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-size: cover;
		background-position: center;
	}

	.background-name {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		color: white;
		font-size: 10px;
		padding: 8px 4px 4px;
		text-align: center;
	}
</style>

<Window {show} title="Settings" {onClose} maxWidth="600px">
	<div class="background-selector">
		<h3>Background Selection</h3>
		<div class="background-grid">
			{#each backgroundMedia as background, index (background.url)}
				<div class="background-item" class:active={currentBackground.url === background.url} role="button" tabindex="0" aria-label="Select {background.name} background" on:click={() => handleBackgroundSelect(index)} on:keydown={e => handleKeydown(e, index)}>
					{#if background.type === 'image'}
						<div class="background-thumbnail" style="background-image: url('{background.url}')"></div>
					{:else}
						<div class="background-thumbnail" style="background: linear-gradient(45deg, #333, #666); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">▶ Video</div>
					{/if}
					<div class="background-name">{background.name}</div>
				</div>
			{/each}
		</div>
	</div>
</Window>

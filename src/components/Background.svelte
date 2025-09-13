<script lang="ts">
	import { onMount } from 'svelte';
	import { backgroundStore, backgroundMedia } from '../scripts/background';
	import type { BackgroundItem } from '../scripts/background';

	let backgroundVideoElement: HTMLVideoElement;
	let currentBackground: BackgroundItem = backgroundStore.current;

	onMount(() => {
		const unsubscribe = backgroundStore.subscribe(background => {
			currentBackground = background;

			if (backgroundVideoElement && background.type === 'video') {
				backgroundVideoElement.src = background.url;
				backgroundVideoElement.load();
				setTimeout(() => {
					backgroundVideoElement.play().catch(() => {
						// Video autoplay blocked
					});
				}, 200);
			}
		});

		const savedVideoUrl = localStorage.getItem('libergrid-video-url');
		if (savedVideoUrl) {
			backgroundMedia[backgroundMedia.length - 1].url = savedVideoUrl;
		}

		return unsubscribe;
	});
</script>

<style>
	.background-video {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		z-index: -1;
		pointer-events: none;
	}

	.background-image {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-size: cover;
		background-position: center;
		z-index: -1;
		pointer-events: none;
	}
</style>

{#if currentBackground.type === 'video'}
	<video bind:this={backgroundVideoElement} class="background-video" src={currentBackground.url} autoplay loop muted playsinline> Your browser does not support video. </video>
{:else}
	<div class="background-image" style="background-image: url('{currentBackground.url}')"></div>
{/if}

<script lang="ts">
	import { backgroundType, currentBackground } from '../scripts/background.ts';
</script>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}

	.background.video {
		object-fit: cover;
	}

	.background.image,
	.background.color {
		background-size: cover;
		background-position: center;
	}
</style>

{#if $backgroundType === 'video' && $currentBackground && 'url' in $currentBackground}
	<video class="background video" src={$currentBackground.url} autoplay loop muted playsinline>Your browser does not support video.</video>
{:else if $backgroundType === 'color' && $currentBackground && 'color' in $currentBackground}
	<div class="background color" style:background-color={$currentBackground.color}></div>
{:else if $backgroundType === 'image' && $currentBackground && 'url' in $currentBackground}
	<div class="background image" style:background-image="url('{$currentBackground.url}')"></div>
{/if}

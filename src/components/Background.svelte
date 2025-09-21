<script lang="ts">
	import { backgroundItems, currentIndex } from '../scripts/background.ts';
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

	.background.image {
		background-size: cover;
		background-position: center;
	}
</style>

{#if backgroundItems[$currentIndex].isVideo}
	<video class="background video" src={backgroundItems[$currentIndex].url} autoplay loop muted playsinline>Your browser does not support video.</video>
{:else}
	<div class="background image" style:background-image="url('{backgroundItems[$currentIndex].url}')"></div>
{/if}

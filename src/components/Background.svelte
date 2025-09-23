<script lang="ts">
	import { getCurrentBackground } from '../scripts/background.ts';
	import { getSettingsValue } from '../scripts/settings.ts';

	let backgroundType = $state(getSettingsValue('backgroundType'));
	let currentBackground = $state(getCurrentBackground());

	// Update background when index or type changes
	$effect(() => {
		backgroundType = getSettingsValue('backgroundType');
		currentBackground = getCurrentBackground();
	});
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

	.background.color {
		background-size: cover;
		background-position: center;
	}
</style>

{#if backgroundType === 'video' && 'url' in currentBackground}
	<video class="background video" src={currentBackground.url} autoplay loop muted playsinline>Your browser does not support video.</video>
{:else if backgroundType === 'color' && 'color' in currentBackground}
	<div class="background color" style:background-color={currentBackground.color}></div>
{:else if backgroundType === 'image' && 'url' in currentBackground}
	<div class="background image" style:background-image="url('{currentBackground.url}')"></div>
{/if}

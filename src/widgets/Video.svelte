<script lang="ts">
	let videoElement: HTMLVideoElement;
	let videoUrl: string = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4';
	let hasError: boolean = false;
	let errorMessage: string = '';

	function handleVideoError() {
		hasError = true;
		errorMessage = 'Failed to load video: ' + videoUrl;
	}
</script>

<style>
	.video-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.video {
		width: 100%;
		height: 100%;
		object-fit: contain; /* TODO: add cover option too */
		border-radius: 0.5vh;
	}

	.error {
		text-align: center;
	}
</style>

<div class="video-container">
	{#if hasError}
		<div class="error">
			Failed to load video: {errorMessage}
		</div>
	{:else}
		<video class="video" bind:this={videoElement} src={videoUrl} autoplay loop muted playsinline on:error={handleVideoError}> Your browser does not support the video tag. </video>
	{/if}
</div>

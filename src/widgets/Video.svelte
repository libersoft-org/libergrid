<script lang="ts">
	let videoElement: HTMLVideoElement;
	let videoUrl: string = 'https://file-examples.com/storage/fef94d4ca968c5b73a200b5/2017/04/file_example_MP4_1920_18MG.mp4';
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

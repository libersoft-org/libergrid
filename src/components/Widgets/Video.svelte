<script lang="ts">
	import { onMount } from 'svelte';
	import { autoFont } from '../../scripts/font';

	let videoElement: HTMLVideoElement;
	let containerElement: HTMLElement;
	let videoUrl: string = 'https://file-examples.com/storage/feb23bcbd368c1ded9d9b0e/2017/04/file_example_MP4_480_1_5MG.mp4';
	let isEditing: boolean = false;
	let tempUrl: string = '';

	onMount(() => {
		// Load saved video URL from localStorage
		const savedUrl = localStorage.getItem('libergrid-video-url');
		if (savedUrl) videoUrl = savedUrl;
		// Auto-resize functionality (for potential text overlay)
		if (containerElement) {
			const cleanup = autoFont(containerElement, 90, 90);
			return cleanup;
		}
	});

	function handleVideoClick() {
		if (!videoUrl) startEditing();
	}

	function startEditing() {
		isEditing = true;
		tempUrl = videoUrl;
	}

	function saveVideoUrl() {
		if (tempUrl.trim()) {
			videoUrl = tempUrl.trim();
			localStorage.setItem('libergrid-video-url', videoUrl);
		}
		isEditing = false;
	}

	function cancelEditing() {
		isEditing = false;
		tempUrl = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveVideoUrl();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelEditing();
		}
	}

	function handleVideoError() {
		console.error('Video failed to load:', videoUrl);
	}
</script>

<style>
	.video-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.video-element {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 0.5vh;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border: 2px dashed rgba(255, 255, 255, 0.3);
		border-radius: 0.5vh;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
		padding: 10px;
		transition: all 0.3s ease;
	}

	.placeholder:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.placeholder-icon {
		font-size: 2em;
		margin-bottom: 10px;
	}

	.placeholder-text {
		font-size: 0.9em;
		line-height: 1.3;
	}

	.edit-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border-radius: 0.5vh;
	}

	.edit-input {
		width: 100%;
		padding: 8px;
		margin-bottom: 10px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		color: white;
		font-size: 12px;
	}

	.edit-input:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.15);
	}

	.edit-buttons {
		display: flex;
		gap: 5px;
	}

	.edit-button {
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		color: white;
		cursor: pointer;
		font-size: 11px;
		transition: all 0.2s ease;
	}

	.edit-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.edit-button.primary {
		background: rgba(0, 120, 212, 0.7);
		border-color: rgba(0, 120, 212, 0.8);
	}

	.edit-button.primary:hover {
		background: rgba(0, 120, 212, 0.9);
	}

	.settings-button {
		position: absolute;
		top: 5px;
		left: 5px;
		width: 20px;
		height: 20px;
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		opacity: 0;
		transition: all 0.2s ease;
	}

	.video-container:hover .settings-button {
		opacity: 1;
	}

	.settings-button:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>

<div class="video-container" bind:this={containerElement}>
	{#if isEditing}
		<div class="edit-overlay">
			<input class="edit-input" type="text" placeholder="Enter video URL (mp4, webm, or direct video link)" bind:value={tempUrl} on:keydown={handleKeydown} autofocus />
			<div class="edit-buttons">
				<button class="edit-button primary" on:click={saveVideoUrl}>Save</button>
				<button class="edit-button" on:click={cancelEditing}>Cancel</button>
			</div>
		</div>
	{:else if videoUrl}
		<button class="settings-button" on:click={startEditing} title="Change video URL"> ⚙️ </button>
		<!-- svelte-ignore a11y-media-has-caption -->
		<video class="video-element" bind:this={videoElement} src={videoUrl} autoplay loop muted playsinline on:error={handleVideoError}> Your browser does not support the video tag. </video>
	{:else}
		<div class="placeholder" on:click={handleVideoClick} on:keydown={e => e.key === 'Enter' && handleVideoClick()} role="button" tabindex="0">
			<div class="placeholder-icon">🎬</div>
			<div class="placeholder-text">
				Click to add<br />
				video URL
			</div>
		</div>
	{/if}
</div>

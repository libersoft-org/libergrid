<script lang="ts">
	import { onMount } from 'svelte';
	import Dashboard from '../components/Dashboard.svelte';

	const backgroundMedia = [
		{ type: 'image', url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg' },
		{ type: 'image', url: 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg' },
		{ type: 'image', url: 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg' },
		{ type: 'image', url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg' },
		{ type: 'image', url: 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg' },
		{ type: 'video', url: 'https://file-examples.com/storage/feb23bcbd368c1ded9d9b0e/2017/04/file_example_MP4_480_1_5MG.mp4' },
	];
	let currentBackgroundIndex = 0;
	let backgroundVideoElement: HTMLVideoElement;

	$: currentBackground = backgroundMedia[currentBackgroundIndex];

	// Keep background video synchronized with widget video URL
	$: if (typeof window !== 'undefined') {
		const savedVideoUrl = localStorage.getItem('libergrid-video-url');
		if (savedVideoUrl && backgroundMedia[backgroundMedia.length - 1].url !== savedVideoUrl) {
			backgroundMedia[backgroundMedia.length - 1].url = savedVideoUrl;
		}
	}

	// Handle video background changes
	$: if (backgroundVideoElement && currentBackground.type === 'video') {
		backgroundVideoElement.src = currentBackground.url;
		backgroundVideoElement.load();
		setTimeout(() => {
			backgroundVideoElement.play().catch(() => {
				// Video autoplay blocked - normal browser behavior
			});
		}, 200);
	}

	function toggleBackground() {
		currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundMedia.length;

		// Try to play video if switching to video background
		if (backgroundMedia[currentBackgroundIndex].type === 'video' && backgroundVideoElement) {
			setTimeout(() => {
				backgroundVideoElement.play().catch(() => {
					// Video autoplay blocked - normal behavior
				});
			}, 300);
		}

		// Also try to play video if current background is already video
		if (currentBackground.type === 'video' && backgroundVideoElement) {
			backgroundVideoElement.play().catch(() => {
				// Video autoplay blocked - normal behavior
			});
		}
	}

	onMount(() => {
		// Add the video widget URL to backgrounds if it exists
		const savedVideoUrl = localStorage.getItem('libergrid-video-url');
		if (savedVideoUrl && savedVideoUrl !== backgroundMedia[backgroundMedia.length - 1].url) {
			// Update the video background with the widget's video URL
			backgroundMedia[backgroundMedia.length - 1].url = savedVideoUrl;
		}

		// Add user interaction listeners to enable video autoplay
		const enableVideoPlayback = () => {
			if (backgroundVideoElement && currentBackground.type === 'video') {
				backgroundVideoElement.play().catch(() => {
					// Video autoplay still blocked
				});
			}
		};

		// Add click listener specifically to dashboard
		const dashboardElement = document.querySelector('.dashboard');
		if (dashboardElement) {
			dashboardElement.addEventListener('click', enableVideoPlayback);
		}

		document.addEventListener('keydown', enableVideoPlayback);

		// Handle initial video background if it's a video
		if (currentBackground.type === 'video') {
			setTimeout(() => {
				if (backgroundVideoElement) {
					backgroundVideoElement.play().catch(() => {
						// Video autoplay blocked - normal for many browsers
					});
				}
			}, 500);
		}

		// Cleanup on component destroy
		return () => {
			document.removeEventListener('keydown', enableVideoPlayback);
			if (dashboardElement) {
				dashboardElement.removeEventListener('click', enableVideoPlayback);
			}
		};
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
</style>

<svelte:head>
	<title>LiberGrid</title>
</svelte:head>
{#if currentBackground.type === 'video'}
	<video bind:this={backgroundVideoElement} class="background-video" src={currentBackground.url} autoplay loop muted playsinline preload="auto"> Your browser does not support the video tag. </video>
{/if}
<Dashboard isVideoBackground={currentBackground.type === 'video'} onDashboardClick={toggleBackground} backgroundStyle={currentBackground.type === 'image' ? `background-image: url('${currentBackground.url}')` : ''} />

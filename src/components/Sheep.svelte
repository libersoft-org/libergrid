<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { getSettingsValue } from '../scripts/settings.ts';

	let sheepInstance: any = null;

	onMount(async () => {
		// Start sheep when component mounts
		if (typeof window !== 'undefined' && (window as any).eSheep) {
			try {
				sheepInstance = new (window as any).eSheep();
				sheepInstance.Start();

				// Wait for DOMdiv to be created
				const waitForDOMdiv = () => {
					return new Promise<void>((resolve) => {
						const checkDOMdiv = () => {
							if (sheepInstance && sheepInstance.DOMdiv) {
								resolve();
							} else {
								requestAnimationFrame(checkDOMdiv);
							}
						};
						checkDOMdiv();
					});
				};

				await waitForDOMdiv();

				// Apply scale to sheep div after it's created
				if (sheepInstance && sheepInstance.DOMdiv) {
					// Read size directly to ensure fresh value
					let currentSize: number;
					try {
						const stored = localStorage.getItem('libergrid-settings');
						if (stored) {
							const settings = JSON.parse(stored);
							currentSize = settings.sheepSize ?? 1;
						} else {
							currentSize = 1;
						}
					} catch (e) {
						currentSize = 1;
					}
					
					console.log('Applying sheep size on mount:', currentSize);
					
					// Set initial transform
					sheepInstance.DOMdiv.style.transformOrigin = 'bottom center';
					
					// Use MutationObserver to reapply scale whenever eSheep changes the transform
					const observer = new MutationObserver((mutations) => {
						mutations.forEach((mutation) => {
							if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
								const currentTransform = sheepInstance.DOMdiv.style.transform;
								const currentScale = sheepInstance._currentScale || currentSize;
								
								// Only update if scale is missing or different
								if (!currentTransform.includes(`scale(${currentScale})`)) {
									// Remove any existing scale from transform
									const baseTransform = currentTransform.replace(/scale\([^)]+\)/g, '').trim();
									
									// Don't modify top position, just apply scale
									// The issue is that scale happens from center, so we need transform-origin
									sheepInstance.DOMdiv.style.transformOrigin = 'center bottom';
									
									// Add scale at the end
									sheepInstance.DOMdiv.style.transform = baseTransform 
										? `${baseTransform} scale(${currentScale})` 
										: `scale(${currentScale})`;
								}
							}
						});
					});
					
					// Start observing
					observer.observe(sheepInstance.DOMdiv, {
						attributes: true,
						attributeFilter: ['style']
					});
					
					// Apply initial scale
					sheepInstance.DOMdiv.style.transform = `scale(${currentSize})`;
					
					// Store observer for cleanup
					sheepInstance._scaleObserver = observer;
					sheepInstance._currentScale = currentSize;
				}
			} catch (e) {
				console.warn('Failed to start sheep:', e);
			}
		}

		// Listen for size changes
		const handleSettingsUpdate = (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail.key === 'sheepSize' && sheepInstance && sheepInstance.DOMdiv) {
				const newSize = customEvent.detail.value;
				sheepInstance._currentScale = newSize;
				sheepInstance.DOMdiv.style.transformOrigin = 'bottom center';
				
				// Update transform with new scale - add after existing transforms
				const currentTransform = sheepInstance.DOMdiv.style.transform;
				const baseTransform = currentTransform.replace(/scale\([^)]+\)/g, '').trim();
				
				sheepInstance.DOMdiv.style.transform = baseTransform 
					? `${baseTransform} scale(${newSize})` 
					: `scale(${newSize})`;
			}
		};

		window.addEventListener('settingsUpdate', handleSettingsUpdate);

		return () => {
			window.removeEventListener('settingsUpdate', handleSettingsUpdate);
		};
	});

	onDestroy(() => {
		// Stop and remove sheep when component is destroyed
		if (sheepInstance) {
			// Disconnect observer if it exists
			if (sheepInstance._scaleObserver) {
				sheepInstance._scaleObserver.disconnect();
			}
			
			if (typeof sheepInstance.remove === 'function') {
				try {
					sheepInstance.remove();
				} catch (e) {
					console.warn('Failed to remove sheep:', e);
				}
			}
			sheepInstance = null;
		}
	});
</script>

<!-- Sheep is initialized via script, no template needed -->

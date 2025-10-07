<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	let sheepInstance: any = null;

	function applyScale(scale: number) {
		if (!sheepInstance?.DOMdiv) return;
		const currentTransform = sheepInstance.DOMdiv.style.transform;
		const baseTransform = currentTransform.replace(/scale\([^)]+\)/g, '').trim();
		sheepInstance.DOMdiv.style.transformOrigin = 'center bottom';
		sheepInstance.DOMdiv.style.transform = baseTransform ? `${baseTransform} scale(${scale})` : `scale(${scale})`;
	}

	function getSheepSize(): number {
		try {
			const stored = localStorage.getItem('libergrid-settings');
			const settings = stored ? JSON.parse(stored) : {};
			return settings.sheepSize ?? 1;
		} catch {
			return 1;
		}
	}

	onMount(async () => {
		if (typeof window === 'undefined' || !(window as any).eSheep) return;
		try {
			sheepInstance = new (window as any).eSheep();
			sheepInstance.Start();
			await new Promise<void>(resolve => {
				const check = () => {
					if (sheepInstance?.DOMdiv) resolve();
					else requestAnimationFrame(check);
				};
				check();
			});
			const currentSize = getSheepSize();
			sheepInstance._currentScale = currentSize;
			const observer = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
						const scale = sheepInstance._currentScale || currentSize;
						if (!sheepInstance.DOMdiv.style.transform.includes(`scale(${scale})`)) applyScale(scale);
					}
				});
			});
			observer.observe(sheepInstance.DOMdiv, {
				attributes: true,
				attributeFilter: ['style'],
			});
			applyScale(currentSize);
			sheepInstance._scaleObserver = observer;
		} catch (e) {
			console.warn('Failed to start sheep:', e);
		}
		const handleSettingsUpdate = (event: Event) => {
			const { key, value } = (event as CustomEvent).detail;
			if (key === 'sheepSize' && sheepInstance?.DOMdiv) {
				sheepInstance._currentScale = value;
				applyScale(value);
			}
		};
		window.addEventListener('settingsUpdate', handleSettingsUpdate);
		return () => window.removeEventListener('settingsUpdate', handleSettingsUpdate);
	});

	onDestroy(() => {
		if (!sheepInstance) return;
		sheepInstance._scaleObserver?.disconnect();
		try {
			sheepInstance.remove?.();
		} catch (e) {
			console.warn('Failed to remove sheep:', e);
		}
		sheepInstance = null;
	});
</script>

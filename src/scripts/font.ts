/**
 * Adjusts font size of an element to fit within specified percentage of its parent container
 * @param element - The HTML element to adjust
 * @param widthPercent - Maximum width percentage (0-100)
 * @param heightPercent - Maximum height percentage (0-100)
 * @param minFontSize - Minimum font size in pixels (default: 1)
 * @param step - Font size increment step (default: 1)
 */
export function adjustFontToFit(element: HTMLElement, widthPercent: number, heightPercent: number, minFontSize: number = 1, step: number = 1): void {
	if (!element?.parentElement) return;
	// Handle empty text - if element is empty, set minimum font and return
	const textContent = element.textContent?.trim();
	if (!textContent) {
		element.style.fontSize = `${minFontSize}px`;
		return;
	}
	const container = element.parentElement;
	const maxWidth = container.clientWidth * (widthPercent / 100);
	const maxHeight = container.clientHeight * (heightPercent / 100);

	// Use binary search for efficient font size finding
	let minSize = minFontSize;
	let maxSize = Math.min(maxWidth, maxHeight); // Start with reasonable upper bound
	let bestSize = minFontSize;
	let iterations = 0;
	const maxIterations = 50; // Much fewer iterations needed with binary search

	while (minSize <= maxSize && iterations < maxIterations) {
		const currentSize = Math.floor((minSize + maxSize) / 2);
		element.style.fontSize = `${currentSize}px`;

		// Force reflow
		element.offsetHeight;
		const rect = element.getBoundingClientRect();

		if (rect.width <= maxWidth && rect.height <= maxHeight) {
			// Size fits - try larger
			bestSize = currentSize;
			minSize = currentSize + 1;
		} else {
			// Size too big - try smaller
			maxSize = currentSize - 1;
		}
		iterations++;
	}

	element.style.fontSize = `${bestSize}px`;
}

/**
 * Creates a ResizeObserver that adjusts font size when container resizes
 * @param element - The element to observe
 * @param widthPercent - Maximum width percentage
 * @param heightPercent - Maximum height percentage
 * @param options - Optional parameters for font adjustment
 */
export function createFontResizeObserver(element: HTMLElement, widthPercent: number, heightPercent: number, options?: { minFontSize?: number; step?: number }): ResizeObserver {
	const observer = new ResizeObserver(() => {
		adjustFontToFit(element, widthPercent, heightPercent, options?.minFontSize, options?.step);
	});
	if (element.parentElement) observer.observe(element.parentElement);
	return observer;
}

/**
 * Creates a font manager that handles both initial adjustment and resize observing
 * @param element - The element to manage OR array of elements
 * @param widthPercent - Maximum width percentage
 * @param heightPercent - Maximum height percentage
 * @param options - Optional parameters for font adjustment
 * @returns Object with adjust function and ResizeObserver
 */
export function createFontManager(element: HTMLElement | HTMLElement[], widthPercent: number, heightPercent: number, options?: { minFontSize?: number; step?: number }) {
	const elements = Array.isArray(element) ? element : [element];
	const adjust = () => {
		elements.forEach(el => {
			if (el) adjustFontToFit(el, widthPercent, heightPercent, options?.minFontSize, options?.step);
		});
	};

	// Create observer for the first element's parent (assuming all elements share same parent)
	const firstElement = elements[0];
	const observer = firstElement ? createFontResizeObserver(firstElement, widthPercent, heightPercent, options) : null;
	return {
		adjust,
		observer,
		disconnect: () => observer?.disconnect(),
	};
}

/**
 * Simple auto font setup - just call this in onMount and it handles everything
 * @param elements - Single element or array of elements to manage
 * @param widthPercent - Maximum width percentage
 * @param heightPercent - Maximum height percentage
 * @param options - Optional parameters
 * @returns Cleanup function to call in onDestroy
 */
export function autoFont(elements: HTMLElement | HTMLElement[], widthPercent: number = 90, heightPercent: number = 90, options?: { minFontSize?: number; step?: number }): () => void {
	const elementsArray = Array.isArray(elements) ? elements : [elements];
	const managers: ReturnType<typeof createFontManager>[] = [];
	// Filter out null/undefined elements and create managers
	elementsArray.filter(Boolean).forEach(element => {
		const manager = createFontManager(element, widthPercent, heightPercent, options);
		managers.push(manager);
	});
	// Return cleanup function
	return () => {
		managers.forEach(manager => manager.disconnect());
	};
}

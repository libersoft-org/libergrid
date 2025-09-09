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

	console.log(`Adjusting ${element.className}: Container ${container.clientWidth}x${container.clientHeight}, Max ${maxWidth}x${maxHeight}`);

	let fontSize = minFontSize;
	let lastValidSize = minFontSize;
	let iterations = 0;
	const maxIterations = 1000; // Safety guard against infinite loops

	while (iterations < maxIterations) {
		element.style.fontSize = `${fontSize}px`;

		// Force reflow
		element.offsetHeight;

		const rect = element.getBoundingClientRect();

		if (rect.width <= maxWidth && rect.height <= maxHeight) {
			lastValidSize = fontSize;
			fontSize += step;
		} else {
			// We exceeded - use last valid size
			break;
		}
		iterations++;
	}

	element.style.fontSize = `${lastValidSize}px`;
	console.log(`Final font size for ${element.className}:`, lastValidSize);
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

	if (element.parentElement) {
		observer.observe(element.parentElement);
	}

	return observer;
}

/**
 * Creates a font manager that handles both initial adjustment and resize observing
 * @param element - The element to manage
 * @param widthPercent - Maximum width percentage
 * @param heightPercent - Maximum height percentage
 * @param options - Optional parameters for font adjustment
 * @returns Object with adjust function and ResizeObserver
 */
export function createFontManager(element: HTMLElement, widthPercent: number, heightPercent: number, options?: { minFontSize?: number; step?: number }) {
	const adjust = () => adjustFontToFit(element, widthPercent, heightPercent, options?.minFontSize, options?.step);
	const observer = createFontResizeObserver(element, widthPercent, heightPercent, options);

	return {
		adjust,
		observer,
		disconnect: () => observer.disconnect(),
	};
}

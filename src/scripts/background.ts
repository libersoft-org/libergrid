export interface BackgroundItem {
	type: 'image' | 'video';
	url: string;
	name: string;
}

export const backgroundMedia: BackgroundItem[] = [
	{ type: 'image', url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg', name: 'Mountain Lake' },
	{ type: 'image', url: 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg', name: 'Forest Path' },
	{ type: 'image', url: 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg', name: 'Ocean Sunset' },
	{ type: 'image', url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg', name: 'City Lights' },
	{ type: 'image', url: 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg', name: 'Desert Stars' },
	{ type: 'video', url: 'https://file-examples.com/storage/fef94d4ca968c5b73a200b5/2017/04/file_example_MP4_1920_18MG.mp4', name: 'Sample Video' },
];

// Simple reactive store without $state for now
let currentIndex = 0;
let listeners: Set<(background: BackgroundItem) => void> = new Set();

// Load saved background index from localStorage
function loadSavedBackground() {
	if (typeof window !== 'undefined') {
		const savedIndex = localStorage.getItem('libergrid-background-index');
		if (savedIndex !== null) {
			const index = parseInt(savedIndex, 10);
			if (index >= 0 && index < backgroundMedia.length) {
				currentIndex = index;
			}
		}
	}
}

// Save current background index to localStorage
function saveCurrentBackground() {
	if (typeof window !== 'undefined') {
		localStorage.setItem('libergrid-background-index', currentIndex.toString());
	}
}

// Initialize with saved background
loadSavedBackground();

export const backgroundStore = {
	get current(): BackgroundItem {
		return backgroundMedia[currentIndex];
	},

	get currentIndex(): number {
		return currentIndex;
	},

	setBackground(index: number) {
		if (index >= 0 && index < backgroundMedia.length) {
			currentIndex = index;
			saveCurrentBackground();
			this.notifyListeners();
		}
	},

	nextBackground() {
		currentIndex = (currentIndex + 1) % backgroundMedia.length;
		saveCurrentBackground();
		this.notifyListeners();
	},

	subscribe(listener: (background: BackgroundItem) => void) {
		listeners.add(listener);
		listener(this.current); // Immediately call with current value

		return () => {
			listeners.delete(listener);
		};
	},

	notifyListeners() {
		listeners.forEach(listener => listener(this.current));

		// Dispatch global event for other components
		if (typeof window !== 'undefined') {
			document.dispatchEvent(
				new CustomEvent('backgroundChange', {
					detail: {
						background: this.current,
						isVideo: this.current.type === 'video',
					},
				})
			);
		}
	},
};

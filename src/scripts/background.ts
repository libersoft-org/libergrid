import { writable } from 'svelte/store';
import { getSettingsValue, setSettingsValue } from './settings.ts';
export interface IBackgroundItem {
	url: string;
	name: string;
}

export interface IBackgroundColor {
	color: string;
	name: string;
}

export type BackgroundType = 'image' | 'video' | 'color';

// Reactive stores
export const backgroundType = writable<BackgroundType>('image');
export const currentBackground = writable<IBackgroundItem | IBackgroundColor | null>(null);

export const backgroundImages: IBackgroundItem[] = [
	{ url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg', name: 'Mountain lake' },
	{ url: 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg', name: 'Forest path' },
	{ url: 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg', name: 'Ocean sunset' },
	{ url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg', name: 'City lights' },
	{ url: 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg', name: 'Desert stars' },
];

export const backgroundVideos: IBackgroundItem[] = [
	{ url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4', name: 'Sample video' },
	{ url: 'https://www.pexels.com/download/video/3089895/', name: 'Sea waves' },
	{ url: 'https://www.pexels.com/download/video/7513671/', name: 'Ocean waves' },
	{ url: 'https://www.pexels.com/download/video/7710243/', name: 'Ocean plant' },
	{ url: 'https://www.pexels.com/download/video/5453622/', name: 'Purple universe' },
	{ url: 'https://www.pexels.com/download/video/31084223/', name: 'Rotating universe' },
	{ url: 'https://www.pexels.com/download/video/7075988/', name: 'Water ink' },
	{ url: 'https://www.pexels.com/download/video/3130284/', name: 'Digital space' },
];

export const backgroundColors: IBackgroundColor[] = [
	{ color: '#1a1a2e', name: 'Dark Navy' },
	{ color: '#16213e', name: 'Deep Blue' },
	{ color: '#0f3460', name: 'Ocean Blue' },
	{ color: '#533483', name: 'Purple' },
	{ color: '#2c1810', name: 'Dark Brown' },
	{ color: '#1e3c72', name: 'Royal Blue' },
	{ color: '#2a5298', name: 'Steel Blue' },
	{ color: '#134e5e', name: 'Teal' },
	{ color: '#71b280', name: 'Forest Green' },
	{ color: '#ff6b6b', name: 'Coral Red' },
	{ color: '#4ecdc4', name: 'Turquoise' },
	{ color: '#45b7d1', name: 'Sky Blue' },
];
export let currentIndex = writable(0);

loadBackground();

export function getCurrentBackgroundItems(): IBackgroundItem[] | IBackgroundColor[] {
	const backgroundType = getSettingsValue('backgroundType');
	switch (backgroundType) {
		case 'image':
			return backgroundImages;
		case 'video':
			return backgroundVideos;
		case 'color':
			return backgroundColors;
		default:
			return backgroundImages;
	}
}

function loadBackground(): void {
	try {
		const savedBackgroundType = getSettingsValue('backgroundType');
		const savedIndex = getSettingsValue('backgroundIndex');

		// Update stores
		backgroundType.set(savedBackgroundType);

		const currentItems = getCurrentBackgroundItems();
		if (savedIndex >= 0 && savedIndex < currentItems.length) {
			currentIndex.set(savedIndex);
			currentBackground.set(currentItems[savedIndex]);
		} else {
			console.error('Saved background index is out of bounds, resetting to 0');
			setBackground(0);
		}
	} catch (error) {
		console.error('Failed to load background index from settings:', error);
	}
}

export function setBackground(index: number): void {
	const currentItems = getCurrentBackgroundItems();
	if (index >= 0 && index < currentItems.length) {
		currentIndex.set(index);
		currentBackground.set(currentItems[index]);
		try {
			setSettingsValue('backgroundIndex', index);
		} catch (error) {
			console.error('Failed to save background index to settings:', error);
		}
	} else {
		console.error('Attempted to set background index out of bounds:', index);
	}
}

export function getCurrentBackground(): IBackgroundItem | IBackgroundColor {
	const currentItems = getCurrentBackgroundItems();
	const index = getSettingsValue('backgroundIndex');
	return currentItems[index] || currentItems[0];
}

export function setBackgroundType(type: 'image' | 'video' | 'color'): void {
	backgroundType.set(type);
	setSettingsValue('backgroundType', type);
	// Reset index when changing type to avoid out of bounds
	setBackground(0);
}

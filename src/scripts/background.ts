import { writable } from 'svelte/store';
import { getSettingsValue, setSettingsValue } from './settings.ts';
export interface IBackgroundItem {
	url: string;
	name: string;
	isVideo: boolean;
}
export const backgroundItems: IBackgroundItem[] = [
	{ url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg', name: 'Mountain lake', isVideo: false },
	{ url: 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg', name: 'Forest path', isVideo: false },
	{ url: 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg', name: 'Ocean sunset', isVideo: false },
	{ url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg', name: 'City lights', isVideo: false },
	{ url: 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg', name: 'Desert stars', isVideo: false },
	{ url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4', name: 'Sample video', isVideo: true },
];
export let currentIndex = writable(0);

loadBackground();

function loadBackground(): void {
	try {
		const savedIndex = getSettingsValue('backgroundIndex');
		if (savedIndex >= 0 && savedIndex < backgroundItems.length) currentIndex.set(savedIndex);
		else {
			console.error('Saved background index is out of bounds, resetting to 0');
			setBackground(0);
		}
	} catch (error) {
		console.error('Failed to load background index from settings:', error);
	}
}

export function setBackground(index: number): void {
	if (index >= 0 && index < backgroundItems.length) {
		currentIndex.set(index);
		try {
			setSettingsValue('backgroundIndex', index);
		} catch (error) {
			console.error('Failed to save background index to settings:', error);
		}
	} else console.error('Attempted to set background index out of bounds:', index);
}

import { writable } from 'svelte/store';
import { getSettingsValue, setSettingsValue } from './settings.ts';

export type BackgroundType = 'image' | 'video' | 'color';
// Reactive stores
export const backgroundType = writable<BackgroundType>('image');
export const currentBackground = writable<string | null>(null);
export const backgroundImages: string[] = ['https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg', 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg', 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg', 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg', 'https://images.pexels.com/photos/352096/pexels-photo-352096.jpeg', 'https://images.pexels.com/photos/3121286/pexels-photo-3121286.jpeg', 'https://images.pexels.com/photos/457878/pexels-photo-457878.jpeg', 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg', 'https://images.pexels.com/photos/2594992/pexels-photo-2594992.jpeg', 'https://images.pexels.com/photos/1168764/pexels-photo-1168764.jpeg', 'https://images.pexels.com/photos/268976/pexels-photo-268976.jpeg', 'https://images.pexels.com/photos/172505/pexels-photo-172505.jpeg'];
export const backgroundVideos: string[] = ['https://www.pexels.com/download/video/7710243/', 'https://www.pexels.com/download/video/3130284/', 'https://cdn.pixabay.com/video/2021/08/06/84086-584871133_large.mp4', 'https://cdn.pixabay.com/video/2023/10/17/185365-875417518_large.mp4', 'https://cdn.pixabay.com/video/2023/10/17/185367-875417528_large.mp4', 'https://cdn.pixabay.com/video/2023/10/17/185366-875417525_large.mp4', 'https://cdn.pixabay.com/video/2024/05/27/213923_large.mp4', 'https://cdn.pixabay.com/video/2021/07/20/82170-577893740_large.mp4', 'https://cdn.pixabay.com/video/2023/08/17/176434-855480487_large.mp4', 'https://cdn.pixabay.com/video/2017/10/20/12528-239934661_large.mp4', 'https://cdn.pixabay.com/video/2024/03/10/203662-921832586_large.mp4', 'https://cdn.pixabay.com/video/2022/02/17/107976-678971242_large.mp4', 'https://cdn.pixabay.com/video/2021/02/28/66575-518836605_large.mp4', 'https://cdn.pixabay.com/video/2020/08/29/48501-454713916_large.mp4', 'https://cdn.pixabay.com/video/2022/12/03/141512-777708212_large.mp4', 'https://cdn.pixabay.com/video/2022/08/10/127433-738466676_large.mp4'];
export const backgroundColors: string[] = ['000000', '888888', '555555', '222222', '111111', '1a1a2e', '16213e', '0f3460', '533483', '2c1810', '1e3c72', '2a5298', '134e5e', '71b280', 'ff6b6b', '4ecdc4', '45b7d1'];
export let currentIndex = writable(0);
loadBackground();

export function getCurrentBackgroundItems(): string[] {
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

export function getCurrentBackground(): string {
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

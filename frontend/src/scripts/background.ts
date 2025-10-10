import { writable } from 'svelte/store';
import { getSettingsValue, setSettingsValue } from './settings.ts';
export interface IBackgroundItem {
	url: string;
}

export interface IBackgroundColor {
	color: string;
}

export type BackgroundType = 'image' | 'video' | 'color';

// Reactive stores
export const backgroundType = writable<BackgroundType>('image');
export const currentBackground = writable<IBackgroundItem | IBackgroundColor | null>(null);

export const backgroundImages: IBackgroundItem[] = [{ url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg' }, { url: 'https://images.pexels.com/photos/433155/pexels-photo-433155.jpeg' }, { url: 'https://images.pexels.com/photos/250716/pexels-photo-250716.jpeg' }, { url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg' }, { url: 'https://images.pexels.com/photos/2098428/pexels-photo-2098428.jpeg' }, { url: 'https://images.pexels.com/photos/243971/pexels-photo-243971.jpeg' }, { url: 'https://images.pexels.com/photos/352096/pexels-photo-352096.jpeg' }, { url: 'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg' }, { url: 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg' }, { url: 'https://images.pexels.com/photos/3121286/pexels-photo-3121286.jpeg' }, { url: 'https://images.pexels.com/photos/457878/pexels-photo-457878.jpeg' }, { url: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg' }, { url: 'https://images.pexels.com/photos/2594992/pexels-photo-2594992.jpeg' }, { url: 'https://images.pexels.com/photos/1168764/pexels-photo-1168764.jpeg' }, { url: 'https://images.pexels.com/photos/268976/pexels-photo-268976.jpeg' }, { url: 'https://images.pexels.com/photos/172505/pexels-photo-172505.jpeg' }, { url: 'https://images.pexels.com/photos/235525/pexels-photo-235525.jpeg' }, { url: 'https://images.pexels.com/photos/3310691/pexels-photo-3310691.jpeg' }];

export const backgroundVideos: IBackgroundItem[] = [{ url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4' }, { url: 'https://www.pexels.com/download/video/3089895/' }, { url: 'https://www.pexels.com/download/video/7513671/' }, { url: 'https://www.pexels.com/download/video/7710243/' }, { url: 'https://www.pexels.com/download/video/5453622/' }, { url: 'https://www.pexels.com/download/video/31084223/' }, { url: 'https://www.pexels.com/download/video/7075988/' }, { url: 'https://www.pexels.com/download/video/3130284/' }, { url: 'https://www.pexels.com/download/video/856281/' }, { url: 'https://cdn.pixabay.com/video/2023/10/02/183279-870457579_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2020/06/24/43027-434334088_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/05/30/165160-832090880_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/02/28/152522-803189119_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/11/27/140669-775595968_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2024/02/02/198921-909336000_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/08/05/174731-852025141_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2021/08/06/84086-584871133_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/11/11/138553-769988105_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/12/01/191573-890522311_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/10/17/185365-875417518_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/10/17/185367-875417528_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/10/17/185366-875417525_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2024/05/27/213923_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2024/02/25/201947-916877801_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/08/06/174944-852206099_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/10/17/185369-875417531_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2021/07/20/82170-577893740_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2021/12/07/99973-658725823_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/08/17/176434-855480487_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2017/10/20/12528-239934661_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2024/03/10/203662-921832586_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/02/17/107976-678971242_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/02/21/108420-680178323_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2021/02/28/66575-518836605_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2019/08/28/26344-357839084_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2024/03/10/203645-921832577_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2020/08/29/48501-454713916_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2020/07/30/45959-447087605_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2020/03/11/33542-397143915_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2020/07/10/44335-438661935_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/12/03/141512-777708212_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/08/10/127433-738466676_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/02/11/150150-797999302_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2022/02/10/107311-676158777_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2019/09/12/26796-359604154_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2019/09/19/27018-361798566_large.mp4' }, { url: 'https://cdn.pixabay.com/video/2023/02/14/150725-798877546_large.mp4' }];

export const backgroundColors: IBackgroundColor[] = [{ color: '#1a1a2e' }, { color: '#16213e' }, { color: '#0f3460' }, { color: '#533483' }, { color: '#2c1810' }, { color: '#1e3c72' }, { color: '#2a5298' }, { color: '#134e5e' }, { color: '#71b280' }, { color: '#ff6b6b' }, { color: '#4ecdc4' }, { color: '#45b7d1' }];
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

import type { IGridItem, IGrids } from './dashboard.ts';
interface IUserSettings {
	inactivityTimeout?: number;
	backgroundIndex?: number;
	backgroundType?: 'image' | 'video' | 'color';
	dashboardItems?: IGridItem[];
	grid?: IGrids;
}
const defaultSettings: IUserSettings = {
	inactivityTimeout: 2000,
	backgroundIndex: 0,
	backgroundType: 'image',
	dashboardItems: [],
	grid: { cols: 10, rows: 6 },
};
const settingsStorageKey = 'libergrid-settings';

// Load settings from localStorage with defaults applied
function getSettings(): IUserSettings {
	try {
		const stored = localStorage.getItem(settingsStorageKey);
		const userSettings: IUserSettings = stored ? JSON.parse(stored) : {};
		// Return settings with defaults applied
		return {
			inactivityTimeout: userSettings.inactivityTimeout ?? defaultSettings.inactivityTimeout,
			backgroundIndex: userSettings.backgroundIndex ?? defaultSettings.backgroundIndex,
			backgroundType: userSettings.backgroundType ?? defaultSettings.backgroundType,
			dashboardItems: userSettings.dashboardItems ?? defaultSettings.dashboardItems,
			grid: userSettings.grid ?? defaultSettings.grid,
		};
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
		// Return defaults on error
		return {
			inactivityTimeout: defaultSettings.inactivityTimeout,
			backgroundIndex: defaultSettings.backgroundIndex,
			backgroundType: defaultSettings.backgroundType,
			dashboardItems: defaultSettings.dashboardItems,
			grid: defaultSettings.grid,
		};
	}
}

// Save settings to localStorage
function setSettings(settings: IUserSettings): void {
	try {
		localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
	} catch (error) {
		console.warn('Failed to save settings to localStorage:', error);
	}
}

// Get specific settings value by key
export function getSettingsValue<K extends keyof IUserSettings>(key: K): NonNullable<IUserSettings[K]> {
	return getSettings()[key] as NonNullable<IUserSettings[K]>;
}

// Update specific settings value by key
export function setSettingsValue<K extends keyof IUserSettings>(key: K, value: NonNullable<IUserSettings[K]>): void {
	try {
		const stored = localStorage.getItem(settingsStorageKey);
		const currentSettings: IUserSettings = stored ? JSON.parse(stored) : {};
		const newSettings = {
			...currentSettings,
			[key]: value,
		};
		setSettings(newSettings);
		// Dispatch custom event to notify components about settings change
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('settingsUpdate', {
					detail: { key, value },
				})
			);
		}
	} catch (error) {
		console.warn(`Failed to update setting ${String(key)}:`, error);
		// Fallback: save just the new setting
		setSettings({ [key]: value } as IUserSettings);
	}
}

// Reset all settings to defaults
export function resetSettings(): void {
	setSettings({});
}

import { getSettingsValue, setSettingsValue } from './settings.ts';
export const gridLimits = {
	minCols: 1,
	maxCols: 30,
	minRows: 1,
	maxRows: 30,
} as const;
export interface IGridItemType {
	type: string;
	label: string;
}
export interface IGrids {
	cols: number;
	rows: number;
}
export interface IGridItem {
	id: string;
	type: IGridItemType['type'];
	gridRow: number;
	gridCol: number;
	colSpan: number;
	rowSpan: number;
	border: boolean;
}
let dashboardItems: IGridItem[] = [];

function loadDashboardItems(): IGridItem[] {
	try {
		console.log('Loading dashboard from storage...');
		const loadedItems = getSettingsValue('dashboardItems');
		console.log('Loaded items from storage:', loadedItems);
		if (Array.isArray(loadedItems)) {
			const validItems = loadedItems.filter(item => item && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.gridRow === 'number' && typeof item.gridCol === 'number' && typeof item.colSpan === 'number' && typeof item.rowSpan === 'number' && typeof item.border === 'boolean');
			console.log('Valid items after filtering:', validItems);
			return validItems;
		} else {
			console.log('No array found in storage, using empty array');
			return [];
		}
	} catch (error) {
		console.error('Failed to load dashboard from localStorage:', error);
		return [];
	}
}

function saveDashboardItems(items: IGridItem[]): void {
	try {
		console.log('Saving dashboard to storage:', items);
		setSettingsValue('dashboardItems', items);
		console.log('Dashboard saved successfully');
	} catch (error) {
		console.error('Failed to save dashboard to localStorage:', error);
	}
}

// Initialize dashboard items
dashboardItems = loadDashboardItems();

// Dashboard manager object
export const dashboard = {
	get items() {
		return dashboardItems;
	},
	set items(newItems: IGridItem[]) {
		dashboardItems = newItems;
		saveDashboardItems(newItems);
	},
	addItem(item: IGridItem) {
		dashboardItems.push(item);
		saveDashboardItems(dashboardItems);
	},
	removeItem(id: string) {
		dashboardItems = dashboardItems.filter(item => item.id !== id);
		saveDashboardItems(dashboardItems);
	},
	updateItem(id: string, updates: Partial<IGridItem>) {
		dashboardItems = dashboardItems.map(item => (item.id === id ? { ...item, ...updates } : item));
		saveDashboardItems(dashboardItems);
	},
	reload() {
		dashboardItems = loadDashboardItems();
		return dashboardItems;
	},
};

export const gridItems: IGridItemType[] = [
	{ type: 'time', label: 'Time' },
	{ type: 'date', label: 'Date' },
	{ type: 'temp', label: 'Temperature' },
	{ type: 'weather', label: 'Weather' },
	{ type: 'nameday', label: 'Name day' },
	{ type: 'video', label: 'Video' },
	{ type: 'chart', label: 'Chart' },
];

export function validateGridResize(newCols: number, newRows: number, dashboardItems: IGridItem[]): boolean {
	// Check if any widget would be outside the new grid bounds
	return dashboardItems.every(item => {
		const maxCol = item.gridCol + item.colSpan - 1;
		const maxRow = item.gridRow + item.rowSpan - 1;
		return maxCol < newCols && maxRow < newRows;
	});
}

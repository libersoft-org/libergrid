import { writable } from 'svelte/store';
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
export interface IGridPosition {
	row: number;
	col: number;
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
	transparency: boolean;
	blur?: boolean;
	blurIntensity?: number;
}
export const gridItems: IGridItemType[] = [
	{ type: 'time', label: 'Time' },
	{ type: 'date', label: 'Date' },
	{ type: 'temp', label: 'Temperature' },
	{ type: 'weather', label: 'Weather' },
	{ type: 'nameday', label: 'Name day' },
	{ type: 'video', label: 'Video' },
	{ type: 'chart', label: 'Chart' },
	{ type: 'map', label: 'Weather map' },
];
export const dashboardItems = writable<IGridItem[]>(loadDashboardItems());
export const showFields = writable<boolean>(false);

// Store for widget settings - allows reactive updates without prop drilling
export const widgetSettings = writable<Record<string, Partial<Pick<IGridItem, 'transparency' | 'blur' | 'blurIntensity'>>>>({});

export function dashboardItemsSet(newItems: IGridItem[]) {
	dashboardItems.set(newItems);
	saveDashboardItems(newItems);
}

export function dashboardAddItem(item: IGridItem) {
	dashboardItems.update(items => {
		const newItems = [...items, item];
		saveDashboardItems(newItems);
		return newItems;
	});
}

export function dashboardDelItem(id: string) {
	dashboardItems.update(items => {
		const newItems = items.filter(item => item.id !== id);
		saveDashboardItems(newItems);
		return newItems;
	});
}

export function dashboardUpdateItem(id: string, updates: Partial<IGridItem>) {
	dashboardItems.update(items => {
		const newItems = items.map(item => (item.id === id ? { ...item, ...updates } : item));
		saveDashboardItems(newItems);
		return newItems;
	});
}

// New reactive approach - update widget settings through store
export function updateWidgetSetting<K extends keyof Pick<IGridItem, 'transparency' | 'blur' | 'blurIntensity'>>(id: string, key: K, value: Pick<IGridItem, 'transparency' | 'blur' | 'blurIntensity'>[K]) {
	// Update the main dashboardItems store
	dashboardItems.update(items => {
		const item = items.find(item => item.id === id);
		if (item && item[key] !== value) {
			const newItems = items.map(item => (item.id === id ? { ...item, [key]: value } : item));
			saveDashboardItems(newItems);
			return newItems;
		}
		return items;
	});
	// Also update the reactive settings store for immediate UI updates
	widgetSettings.update(settings => ({
		...settings,
		[id]: {
			...settings[id],
			[key]: value,
		},
	}));
}

// Get current widget settings (with fallback to main item data)
export function getWidgetSettings(id: string) {
	let settings: Partial<Pick<IGridItem, 'transparency' | 'blur' | 'blurIntensity'>> = {};
	// Get current settings from store
	widgetSettings.subscribe(ws => (settings = ws[id] || {}))();
	// Get fallback from main dashboard items
	let item: IGridItem | undefined;
	dashboardItems.subscribe(items => (item = items.find(i => i.id === id)))();
	return {
		transparency: settings.transparency ?? item?.transparency ?? false,
		blur: settings.blur ?? item?.blur ?? true,
		blurIntensity: settings.blurIntensity ?? item?.blurIntensity ?? 5,
	};
}

export function dashboardReloadItems() {
	const newItems = loadDashboardItems();
	dashboardItems.set(newItems);
	return newItems;
}

function loadDashboardItems(): IGridItem[] {
	try {
		const loadedItems = getSettingsValue('dashboardItems');
		if (Array.isArray(loadedItems)) {
			const validItems = loadedItems
				.filter(item => item && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.gridRow === 'number' && typeof item.gridCol === 'number' && typeof item.colSpan === 'number' && typeof item.rowSpan === 'number')
				.map(item => ({
					...item,
					// Ensure transparency property exists (default to false for new widgets)
					transparency: typeof item.transparency === 'boolean' ? item.transparency : false,
					// Ensure blur property exists (default to true for new widgets)
					blur: typeof item.blur === 'boolean' ? item.blur : true,
					// Ensure blurIntensity property exists (default to 5px for new widgets)
					blurIntensity: typeof item.blurIntensity === 'number' ? item.blurIntensity : 5,
				}));
			return validItems;
		} else {
			return [];
		}
	} catch (error) {
		console.error('Failed to load dashboard from localStorage:', error);
		return [];
	}
}

function saveDashboardItems(items: IGridItem[]): void {
	try {
		setSettingsValue('dashboardItems', items);
	} catch (error) {
		console.error('Failed to save dashboard to localStorage:', error);
	}
}

export function validateGridResize(newCols: number, newRows: number, dashboardItems: IGridItem[]): boolean {
	// Check if any widget would be outside the new grid bounds
	return dashboardItems.every(item => {
		const maxCol = item.gridCol + item.colSpan - 1;
		const maxRow = item.gridRow + item.rowSpan - 1;
		return maxCol < newCols && maxRow < newRows;
	});
}

// Grid logic functions
function getOccupiedCells(items: IGridItem[]): Set<string> {
	return new Set(
		items.flatMap(item => {
			const cells = [];
			for (let r = item.gridRow; r < item.gridRow + item.rowSpan; r++) {
				for (let c = item.gridCol; c < item.gridCol + item.colSpan; c++) {
					cells.push(`${r}-${c}`);
				}
			}
			return cells;
		})
	);
}

export function isGridCellOccupied(row: number, col: number, items: IGridItem[]): boolean {
	const occupiedCells = getOccupiedCells(items);
	return occupiedCells.has(`${row}-${col}`);
}

export function getGridOccupancy(rows: number, cols: number, items: IGridItem[]): boolean[][] {
	const occupiedCells = getOccupiedCells(items);
	return Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => occupiedCells.has(`${row}-${col}`)));
}

export function createNewItem(type: IGridItemType['type'], gridRow: number, gridCol: number): IGridItem {
	return {
		id: `${type}-${Date.now()}`,
		type,
		gridRow,
		gridCol,
		colSpan: 1,
		rowSpan: 1,
		transparency: false,
		blur: true,
		blurIntensity: 5,
	};
}

export function getComponentProps(type: string, item?: any): any {
	switch (type) {
		case 'temp':
			return { label: 'Indoor', temp: 24 };
		case 'map':
			return { latitude: 50.0755, longitude: 14.4378, zoom: 10 };
		default:
			return {};
	}
}

// Collision and validation logic
export function checkCollision(targetGridRow: number, targetGridCol: number, newRowSpan: number, newColSpan: number, excludeId: string, items: IGridItem[]): boolean {
	return items.some(otherItem => {
		if (otherItem.id === excludeId) return false; // Ignore the item being moved/resized
		const newEndRow = targetGridRow + newRowSpan - 1;
		const newEndCol = targetGridCol + newColSpan - 1;
		const otherEndRow = otherItem.gridRow + otherItem.rowSpan - 1;
		const otherEndCol = otherItem.gridCol + otherItem.colSpan - 1;
		// Overlap check
		const rowOverlap = targetGridRow <= otherEndRow && newEndRow >= otherItem.gridRow;
		const colOverlap = targetGridCol <= otherEndCol && newEndCol >= otherItem.gridCol;
		return rowOverlap && colOverlap;
	});
}

export function checkBounds(targetGridRow: number, targetGridCol: number, newRowSpan: number, newColSpan: number, gridRows: number, gridCols: number): boolean {
	return targetGridCol + newColSpan > gridCols || targetGridRow + newRowSpan > gridRows || targetGridCol < 0 || targetGridRow < 0;
}

export function validateComponentUpdate(id: string, items: IGridItem[], gridRows: number, gridCols: number, newGridRow?: number, newGridCol?: number, newRowSpan?: number, newColSpan?: number): { isValid: boolean; targetGridRow: number; targetGridCol: number; targetRowSpan: number; targetColSpan: number } {
	const item = items.find(i => i.id === id);
	if (!item) return { isValid: false, targetGridRow: 0, targetGridCol: 0, targetRowSpan: 1, targetColSpan: 1 };
	// Use new values if specified, otherwise use original
	const targetGridRow = newGridRow !== undefined ? newGridRow : item.gridRow;
	const targetGridCol = newGridCol !== undefined ? newGridCol : item.gridCol;
	const targetRowSpan = newRowSpan !== undefined ? newRowSpan : item.rowSpan;
	const targetColSpan = newColSpan !== undefined ? newColSpan : item.colSpan;
	// Check for collisions with other widgets
	const wouldCollide = checkCollision(targetGridRow, targetGridCol, targetRowSpan, targetColSpan, id, items);
	// Check grid bounds
	const exceedsBounds = checkBounds(targetGridRow, targetGridCol, targetRowSpan, targetColSpan, gridRows, gridCols);
	const isValid = !wouldCollide && !exceedsBounds;
	return { isValid, targetGridRow, targetGridCol, targetRowSpan, targetColSpan };
}

export function updateItemSize(id: string, newColSpan: number, newRowSpan: number, items: IGridItem[], gridRows: number, gridCols: number, newGridRow?: number, newGridCol?: number): boolean {
	const validation = validateComponentUpdate(id, items, gridRows, gridCols, newGridRow, newGridCol, newRowSpan, newColSpan);
	if (validation.isValid) {
		dashboardUpdateItem(id, {
			colSpan: validation.targetColSpan,
			rowSpan: validation.targetRowSpan,
			gridRow: validation.targetGridRow,
			gridCol: validation.targetGridCol,
		});
		return true;
	}
	return false;
}

export function updateItemPosition(id: string, newGridRow: number, newGridCol: number, items: IGridItem[], gridRows: number, gridCols: number): boolean {
	const validation = validateComponentUpdate(id, items, gridRows, gridCols, newGridRow, newGridCol);
	if (validation.isValid) {
		dashboardUpdateItem(id, {
			gridRow: validation.targetGridRow,
			gridCol: validation.targetGridCol,
		});
		return true;
	}
	return false;
}

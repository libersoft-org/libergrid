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

export const gridItems: IGridItemType[] = [
	{ type: 'time', label: 'Time' },
	{ type: 'date', label: 'Date' },
	{ type: 'temp', label: 'Temperature' },
	{ type: 'weather', label: 'Weather' },
	{ type: 'nameday', label: 'Name day' },
	{ type: 'video', label: 'Video' },
	{ type: 'chart', label: 'Chart' },
];

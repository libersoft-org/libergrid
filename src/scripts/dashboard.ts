export interface IWidget {
	type: string;
	label: string;
}

interface IGridConfig {
	cols: number;
	rows: number;
}

export interface DashboardItem {
	id: string;
	type: IWidget['type'];
	gridRow: number;
	gridCol: number;
	colSpan: number;
	rowSpan: number;
	border: boolean;
}

export const widgets: IWidget[] = [
	{ type: 'time', label: 'Time' },
	{ type: 'date', label: 'Date' },
	{ type: 'temp', label: 'Temperature' },
	{ type: 'weather', label: 'Weather' },
	{ type: 'nameday', label: 'Name day' },
	{ type: 'video', label: 'Video' },
	{ type: 'chart', label: 'Chart' },
];

export const gridConfig: IGridConfig = {
	cols: 10,
	rows: 6,
};

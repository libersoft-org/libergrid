export type WidgetType = 'time' | 'date' | 'temp' | 'weather' | 'nameday' | 'video';

export interface DashboardItem {
	id: string;
	type: WidgetType;
	gridRow: number;
	gridCol: number;
	colSpan: number;
	rowSpan: number;
	border: boolean;
}

export const AVAILABLE_WIDGETS: { type: WidgetType; label: string }[] = [
	{ type: 'time', label: 'Time' },
	{ type: 'date', label: 'Date' },
	{ type: 'temp', label: 'Temperature' },
	{ type: 'weather', label: 'Weather' },
	{ type: 'nameday', label: 'Name day' },
	{ type: 'video', label: 'Video' }
];

export interface StatCard {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    percentageChange: string;
    description: string;
}

export interface ChartData {
    date: string;
    desktop: number;
    mobile: number;
}

export interface TableDataItem {
    id: number;
    header: string;
    type: string;
    status: string;
    target: string;
    limit: string;
    reviewer: string;
}

export interface DashboardStats {
    cards: StatCard[];
    chartData: ChartData[];
    tableData: TableDataItem[]; // Add table data here
    // Add other dashboard-related data types here if needed
}


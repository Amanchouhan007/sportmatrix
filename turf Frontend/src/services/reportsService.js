import api from './api';

const unwrap = async (promise, fallback) => {
    try {
        const res = await promise;
        return (res && res.success) ? res.data : fallback;
    } catch {
        return fallback;
    }
};

/** Sport popularity -- owner-scoped to their own branches, or platform-wide for Super Admin. */
export const getSportsReport = () => unwrap(api.get('/reports/sports'), []);

/** Real weekday x hour-bucket occupancy percentage grid, computed from Slot rows. */
export const getOccupancyHeatmap = async () => {
    try {
        const res = await api.get('/reports/occupancy-heatmap');
        if (res && res.success) return { data: res.data, xLabels: res.xLabels, yLabels: res.yLabels };
    } catch {
        // fall through
    }
    return { data: [], xLabels: [], yLabels: [] };
};

/** Real per-day settled revenue for the last 30 days. */
export const getDailyReport = () => unwrap(api.get('/reports/daily'), []);

/** Real per-month settled revenue for the last 12 months. */
export const getMonthlyReport = () => unwrap(api.get('/reports/monthly'), []);

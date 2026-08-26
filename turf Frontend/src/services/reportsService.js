import api from './api';

const unwrap = async (promise, fallback) => {
    try {
        const res = await promise;
        const body = res?.data || res;
        if (body && (body.success !== false)) {
            return body.data !== undefined ? body.data : body;
        }
        return fallback;
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
        const body = res?.data || res;
        if (body && body.data) return { data: body.data, xLabels: body.xLabels || [], yLabels: body.yLabels || [] };
    } catch {
        // fall through
    }
    return { data: [], xLabels: [], yLabels: [] };
};


/** Real per-day settled revenue for the last 30 days. */
export const getDailyReport = () => unwrap(api.get('/reports/daily'), []);

/** Real per-month settled revenue for the last 12 months. */
export const getMonthlyReport = () => unwrap(api.get('/reports/monthly'), []);

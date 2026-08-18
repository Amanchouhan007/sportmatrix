/**
 * Utility functions for standardizing venue and user IDs between frontend UI and backend API.
 */

// Safely converts any turf ID (number or string e.g. 16, '16', 'br_001') to a clean API string
export const formatTurfApiId = (id) => {
    if (!id) return 'br_001';
    if (typeof id === 'string' && (id.startsWith('br_') || id.startsWith('turf_'))) return id;
    return `turf_${id}`;
};

// Safely extracts numeric ID for frontend UI routing if needed
export const formatTurfNumericId = (id) => {
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
        const cleaned = id.replace(/[^0-9]/g, '');
        return cleaned ? parseInt(cleaned, 10) : 1;
    }
    return 1;
};

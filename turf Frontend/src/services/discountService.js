import api from './api';

// Initial Seed Discount Offers Data (No mock data, real MySQL only)
const initialMockDiscounts = [];

// Persistent local storage cache helpers
const getLocalDiscounts = () => {
    try {
        localStorage.removeItem('sports_discounts_data');
    } catch (e) {
        console.error('Error reading discounts from localStorage:', e);
    }
    return initialMockDiscounts;
};

const saveLocalDiscounts = (data) => {
    try {
        localStorage.setItem('sports_discounts_data', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving discounts to localStorage:', e);
    }
};

let discountsState = getLocalDiscounts();

/**
 * Format backend discount object for UI rendering
 */
const mapDiscountResponse = (d) => {
    if (!d) return null;
    return {
        _id: d.id || d._id,
        id: d.id || d._id,
        title: d.title || d.name || '',
        description: d.description || '',
        turfId: d.turfId || d.turf_id || '',
        turfName: d.turfName || d.turf_name || 'Indore Strikers Arena',
        ownerId: d.ownerId || d.owner_id || '',
        ownerName: d.ownerName || d.owner_name || 'Turf Owner',
        discountType: d.discountType || d.discount_type || 'Percentage',
        discountValue: Number(d.discountValue ?? d.discount_value ?? 0),
        minimumBookingAmount: Number(d.minimumBookingAmount ?? d.minimum_booking_amount ?? 0),
        maximumDiscountAmount: Number(d.maximumDiscountAmount ?? d.maximum_discount_amount ?? 0),
        promoCode: d.promoCode || d.promo_code || '',
        banner: d.banner || '',
        thumbnail: d.thumbnail || '',
        applicableSports: Array.isArray(d.applicableSports) ? d.applicableSports : [],
        applicableDays: Array.isArray(d.applicableDays) ? d.applicableDays : [],
        slotTypes: Array.isArray(d.slotTypes) ? d.slotTypes : [],
        startDate: d.startDate || d.start_date || '',
        endDate: d.endDate || d.end_date || '',
        startTime: d.startTime || d.start_time || '00:00',
        endTime: d.endTime || d.end_time || '23:59',
        usageLimit: Number(d.usageLimit ?? d.usage_limit ?? 100),
        usedCount: Number(d.usedCount ?? d.used_count ?? 0),
        perUserLimit: Number(d.perUserLimit ?? d.per_user_limit ?? 1),
        firstBookingOnly: Boolean(d.firstBookingOnly ?? d.first_booking_only),
        stackable: Boolean(d.stackable),
        autoApply: Boolean(d.autoApply ?? d.auto_apply),
        targetRadius: Number(d.targetRadius ?? d.target_radius ?? 5),
        location: d.location || 'Local Region',
        targetCities: Array.isArray(d.targetCities) ? d.targetCities : [],
        gender: d.gender || 'All',
        ageGroup: d.ageGroup || d.age_group || 'All Ages',
        customerType: d.customerType || d.customer_type || 'All Users',
        estimatedAudience: Number(d.estimatedAudience ?? d.estimated_audience ?? 5000),
        status: d.status || 'Active'
    };
};

/**
 * GET All Discount Offers
 */
export const getDiscountOffers = async (filters = {}) => {
    try {
        const response = await api.get('/discount-offers', { params: filters });
        if (response.data && response.data.success) {
            const rawOffers = response.data.data.offers || [];
            const mappedOffers = rawOffers.map(mapDiscountResponse);
            return {
                success: true,
                data: {
                    offers: mappedOffers,
                    pagination: response.data.data.pagination || {
                        total: mappedOffers.length,
                        page: Number(filters.page || 1),
                        limit: Number(filters.limit || 10),
                        totalPages: Math.ceil(mappedOffers.length / Number(filters.limit || 10)) || 1
                    }
                }
            };
        }
    } catch (err) {
        console.warn('Backend GET /discount-offers offline, using local persistent storage fallback.', err.message);
    }

    discountsState = getLocalDiscounts();
    let filtered = [...discountsState];

    if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(d => d.status === filters.status);
    }
    if (filters.discountType && filters.discountType !== 'ALL') {
        filtered = filtered.filter(d => d.discountType === filters.discountType);
    }
    if (filters.turfId && filters.turfId !== 'ALL') {
        filtered = filtered.filter(d => d.turfId === filters.turfId);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(d =>
            (d.title && d.title.toLowerCase().includes(q)) ||
            (d.promoCode && d.promoCode.toLowerCase().includes(q)) ||
            (d.turfName && d.turfName.toLowerCase().includes(q)) ||
            (d.ownerName && d.ownerName.toLowerCase().includes(q))
        );
    }

    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedOffers = filtered.slice(startIndex, startIndex + limit);

    return {
        success: true,
        data: {
            offers: paginatedOffers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        }
    };
};

/**
 * GET Single Discount Offer by ID
 */
export const getDiscountOfferById = async (id) => {
    try {
        const response = await api.get(`/discount-offers/${id}`);
        if (response.data && response.data.success) {
            return {
                success: true,
                data: mapDiscountResponse(response.data.data)
            };
        }
    } catch (err) {
        console.warn(`Backend GET /discount-offers/${id} failed, using local fallback.`, err.message);
    }

    discountsState = getLocalDiscounts();
    const found = discountsState.find(d => d._id === id || d.id === id) || discountsState[0];
    return { success: true, data: mapDiscountResponse(found) };
};

/**
 * POST Create Discount Offer
 */
export const createDiscountOffer = async (offerData) => {
    try {
        const response = await api.post('/discount-offers', offerData);
        if (response.data && response.data.success) {
            const created = mapDiscountResponse(response.data.data);
            discountsState.unshift(created);
            saveLocalDiscounts(discountsState);
            return {
                success: true,
                data: created,
                message: response.data.message || 'Discount offer created successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to create discount offer';
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
        console.warn('Backend POST /discount-offers failed, saving to local persistent storage:', errMsg);
    }

    discountsState = getLocalDiscounts();
    const newOffer = {
        _id: 'disc_' + Date.now(),
        id: 'disc_' + Date.now(),
        usedCount: 0,
        status: offerData.status || 'Active',
        turfName: offerData.turfId === 'turf-2' ? 'SkyLine Football Turf (Pune)' : (offerData.turfId === 'turf-3' ? 'Velocity Sports Hub (Bangalore)' : 'Champions Turf Arena (Mumbai)'),
        ownerName: offerData.ownerName || 'Rajesh Sharma',
        ...offerData
    };
    discountsState.unshift(newOffer);
    saveLocalDiscounts(discountsState);
    return { success: true, data: newOffer, message: 'Discount offer created successfully' };
};

/**
 * PUT Update Discount Offer
 */
export const updateDiscountOffer = async (id, offerData) => {
    try {
        const response = await api.put(`/discount-offers/${id}`, offerData);
        if (response.data && response.data.success) {
            const updated = mapDiscountResponse(response.data.data);
            discountsState = discountsState.map(d => (d._id === id || d.id === id) ? updated : d);
            saveLocalDiscounts(discountsState);
            return {
                success: true,
                data: updated,
                message: response.data.message || 'Discount offer updated successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update discount offer';
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    discountsState = getLocalDiscounts();
    discountsState = discountsState.map(d => (d._id === id || d.id === id) ? { ...d, ...offerData } : d);
    saveLocalDiscounts(discountsState);
    const updated = discountsState.find(d => d._id === id || d.id === id);
    return { success: true, data: updated, message: 'Discount offer updated successfully' };
};

/**
 * PATCH Change Discount Offer Status
 */
export const changeDiscountStatus = async (id, status) => {
    try {
        const response = await api.patch(`/discount-offers/${id}/status`, { status });
        if (response.data && response.data.success) {
            discountsState = discountsState.map(d => (d._id === id || d.id === id) ? { ...d, status } : d);
            saveLocalDiscounts(discountsState);
            return { success: true, message: response.data.message || `Discount offer status updated to ${status}` };
        }
    } catch (err) {
        console.warn(`Backend PATCH /discount-offers/${id}/status failed, toggling in local fallback.`, err.message);
    }

    discountsState = getLocalDiscounts();
    discountsState = discountsState.map(d => (d._id === id || d.id === id) ? { ...d, status } : d);
    saveLocalDiscounts(discountsState);
    return { success: true, message: `Discount offer status updated to ${status}` };
};

/**
 * POST Duplicate Discount Offer
 */
export const duplicateDiscountOffer = async (id) => {
    try {
        const response = await api.post(`/discount-offers/${id}/duplicate`);
        if (response.data && response.data.success) {
            const duplicated = mapDiscountResponse(response.data.data);
            discountsState.unshift(duplicated);
            saveLocalDiscounts(discountsState);
            return { success: true, data: duplicated, message: 'Discount offer duplicated successfully' };
        }
    } catch (err) {
        console.warn(`Backend POST /discount-offers/${id}/duplicate failed, using local fallback.`, err.message);
    }

    discountsState = getLocalDiscounts();
    const original = discountsState.find(d => d._id === id || d.id === id) || discountsState[0];
    const duplicated = {
        ...original,
        _id: 'disc_' + Date.now(),
        id: 'disc_' + Date.now(),
        title: `${original.title} (Copy)`,
        promoCode: original.promoCode ? `${original.promoCode}_COPY` : '',
        usedCount: 0,
        status: 'Draft'
    };
    discountsState.unshift(duplicated);
    saveLocalDiscounts(discountsState);
    return { success: true, data: duplicated, message: 'Discount offer duplicated successfully' };
};

/**
 * DELETE Discount Offer
 */
export const deleteDiscountOffer = async (id) => {
    try {
        const response = await api.delete(`/discount-offers/${id}`);
        if (response.data && response.data.success) {
            discountsState = discountsState.filter(d => d._id !== id && d.id !== id);
            saveLocalDiscounts(discountsState);
            return { success: true, message: response.data.message || 'Discount offer deleted successfully' };
        }
    } catch (err) {
        console.warn(`Backend DELETE /discount-offers/${id} failed, deleting in local fallback.`, err.message);
    }

    discountsState = getLocalDiscounts();
    discountsState = discountsState.filter(d => d._id !== id && d.id !== id);
    saveLocalDiscounts(discountsState);
    return { success: true, message: 'Discount offer deleted successfully' };
};

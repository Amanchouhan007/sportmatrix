import api from './api';

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
        turfName: d.turfName || d.turf_name || '',
        ownerId: d.ownerId || d.owner_id || '',
        ownerName: d.ownerName || d.owner_name || '',
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

// Note: api.js's response interceptor already unwraps to the JSON body
// ({success, data, message}) -- every `response` below IS that body directly.

/** GET all discount offers. */
export const getDiscountOffers = async (filters = {}) => {
    const response = await api.get('/discount-offers', { params: filters });
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to fetch discount offers.');
    }
    const rawOffers = response.data?.offers || [];
    return {
        success: true,
        data: {
            offers: rawOffers.map(mapDiscountResponse),
            pagination: response.data?.pagination || {
                total: rawOffers.length,
                page: Number(filters.page || 1),
                limit: Number(filters.limit || 10),
                totalPages: Math.ceil(rawOffers.length / Number(filters.limit || 10)) || 1
            }
        }
    };
};

/** GET a single discount offer by ID. */
export const getDiscountOfferById = async (id) => {
    const response = await api.get(`/discount-offers/${id}`);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to fetch discount offer.');
    }
    return { success: true, data: mapDiscountResponse(response.data) };
};

/** POST create a new discount offer. */
export const createDiscountOffer = async (offerData) => {
    const response = await api.post('/discount-offers', offerData);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to create discount offer.');
    }
    return { success: true, data: mapDiscountResponse(response.data), message: response.message || 'Discount offer created successfully' };
};

/** PUT update an existing discount offer. */
export const updateDiscountOffer = async (id, offerData) => {
    const response = await api.put(`/discount-offers/${id}`, offerData);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update discount offer.');
    }
    return { success: true, data: mapDiscountResponse(response.data), message: response.message || 'Discount offer updated successfully' };
};

/** PATCH change a discount offer's status. */
export const changeDiscountStatus = async (id, status) => {
    const response = await api.patch(`/discount-offers/${id}/status`, { status });
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update discount offer status.');
    }
    return { success: true, message: response.message || `Discount offer status updated to ${status}` };
};

/** POST duplicate a discount offer. */
export const duplicateDiscountOffer = async (id) => {
    const response = await api.post(`/discount-offers/${id}/duplicate`);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to duplicate discount offer.');
    }
    return { success: true, data: mapDiscountResponse(response.data), message: response.message || 'Discount offer duplicated successfully' };
};

/** DELETE a discount offer. */
export const deleteDiscountOffer = async (id) => {
    const response = await api.delete(`/discount-offers/${id}`);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to delete discount offer.');
    }
    return { success: true, message: response.message || 'Discount offer deleted successfully' };
};

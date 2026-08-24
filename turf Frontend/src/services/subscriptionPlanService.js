import api from './api';

// Note: api.js's response interceptor already unwraps to the JSON body
// ({success, data, message}) -- every `response` below IS that body, not an
// axios wrapper around it. Real backend failures now throw/report honestly
// instead of silently masking as success from a local-only fallback.

/** Fetch all subscription plans. */
export const getAllPlans = async () => {
    const response = await api.get('/subscriptions');
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to fetch subscription plans.');
    }
    return { success: true, data: response.data };
};

/** Fetch single plan details by ID. */
export const getPlanById = async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to fetch plan details.');
    }
    return { success: true, data: response.data };
};

/** Create a new Subscription Plan. */
export const createPlan = async (planData) => {
    const response = await api.post('/subscriptions', planData);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to create plan.');
    }
    return { success: true, data: response.data, message: response.message || 'Plan created successfully' };
};

/** Update an existing Subscription Plan. */
export const updatePlan = async (id, planData) => {
    const response = await api.put(`/subscriptions/${id}`, planData);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update plan.');
    }
    return { success: true, data: response.data, message: response.message || 'Plan updated successfully' };
};

/** Delete a Subscription Plan. */
export const deletePlan = async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to delete plan.');
    }
    return { success: true, message: response.message || 'Plan deleted successfully' };
};

/** Toggle Plan Active Status (active / inactive). */
export const toggleStatus = async (id, status) => {
    const response = await api.patch(`/subscriptions/${id}/status`, { status });
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update plan status.');
    }
    return { success: true, message: response.message || `Status updated to ${status}` };
};

/** Toggle Plan Popularity Flag (true / false). */
export const togglePopular = async (id, isPopular) => {
    const response = await api.patch(`/subscriptions/${id}/popular`, { isPopular });
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to update popular status.');
    }
    return { success: true, message: response.message || 'Popular status updated' };
};

/** Record a Subscription Purchase. */
export const purchaseSubscription = async (purchaseData) => {
    const response = await api.post('/subscriptions/purchase', purchaseData);
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to complete subscription purchase.');
    }
    return response;
};

/** Fetch all Subscription Purchases (Super Admin ledger). */
export const getSubscriptionPurchases = async () => {
    const response = await api.get('/subscriptions/purchases');
    if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to fetch subscription purchases.');
    }
    return response;
};

import api from './api';

// Fallback Seed Plans if backend is offline
export const defaultFallbackPlans = [
    {
        _id: 'plan_starter',
        id: 'plan_starter',
        planName: 'Starter Plan',
        description: 'Ideal for single turf owners getting started.',
        isPopular: false,
        status: 'active',
        monthlyPricing: {
            price: 999,
            branchLimit: 1,
            sportsLimit: 2,
            bookingLimit: 200,
            activeUsersLimit: 5
        },
        yearlyPricing: {
            price: 9999,
            branchLimit: 1,
            sportsLimit: 2,
            bookingLimit: 2500,
            activeUsersLimit: 5
        },
        features: ['Online Slot Booking', 'Basic Analytics', 'Email Notifications', 'Standard Support']
    },
    {
        _id: 'plan_pro',
        id: 'plan_pro',
        planName: 'Professional Plan',
        description: 'Perfect for growing multi-turf sports complexes.',
        isPopular: true,
        status: 'active',
        monthlyPricing: {
            price: 2499,
            branchLimit: 5,
            sportsLimit: 6,
            bookingLimit: 1000,
            activeUsersLimit: 20
        },
        yearlyPricing: {
            price: 24999,
            branchLimit: 5,
            sportsLimit: 6,
            bookingLimit: 15000,
            activeUsersLimit: 20
        },
        features: ['All Starter Features', 'Multi-Branch Management', 'Advanced Analytics & Exports', 'POS Integration', 'Priority 24/7 Support']
    },
    {
        _id: 'plan_enterprise',
        id: 'plan_enterprise',
        planName: 'Enterprise Arena',
        description: 'Custom tailored plan for large stadium & turf networks.',
        isPopular: false,
        status: 'active',
        monthlyPricing: {
            price: 4999,
            branchLimit: 20,
            sportsLimit: 15,
            bookingLimit: 10000,
            activeUsersLimit: 100
        },
        yearlyPricing: {
            price: 49999,
            branchLimit: 20,
            sportsLimit: 15,
            bookingLimit: 120000,
            activeUsersLimit: 100
        },
        features: ['Unlimited Branches', 'Dedicated Account Manager', 'Custom Billing Integrations', 'White Label Branding', 'SLA Guarantee']
    }
];

const loadStoredPlans = () => {
    try {
        const saved = localStorage.getItem('sport_matrix_subscription_plans');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn('Failed to load plans from localStorage', e);
    }
    return defaultFallbackPlans;
};

let localPlans = loadStoredPlans();

const savePlansToStorage = (plans) => {
    try {
        localStorage.setItem('sport_matrix_subscription_plans', JSON.stringify(plans));
        window.dispatchEvent(new CustomEvent('subscription_plans_updated'));
    } catch (e) {
        console.warn('Failed to save plans to localStorage', e);
    }
};

/**
 * Fetch all Subscription Plans (Real Backend + Persistent Fallback)
 */
export const getAllPlans = async () => {
    try {
        const response = await api.get('/subscriptions');
        if (response.data && response.data.success) {
            localPlans = response.data.data;
            savePlansToStorage(localPlans);
            return {
                success: true,
                data: response.data.data
            };
        }
    } catch (err) {
        console.warn('Backend /subscriptions API offline, using local fallback state.', err.message);
    }
    localPlans = loadStoredPlans();
    return { success: true, data: [...localPlans] };
};

/**
 * Fetch single plan details by ID
 */
export const getPlanById = async (id) => {
    try {
        const response = await api.get(`/subscriptions/${id}`);
        if (response.data && response.data.success) {
            return {
                success: true,
                data: response.data.data
            };
        }
    } catch (err) {
        console.warn(`Backend GET /subscriptions/${id} failed, using local fallback.`, err.message);
    }
    const plan = localPlans.find(p => p._id === id || p.id === id) || localPlans[0];
    return { success: true, data: plan };
};

/**
 * Create a new Subscription Plan
 */
export const createPlan = async (planData) => {
    try {
        const response = await api.post('/subscriptions', planData);
        if (response.data && response.data.success) {
            const created = response.data.data;
            localPlans.push(created);
            savePlansToStorage(localPlans);
            return {
                success: true,
                data: created,
                message: response.data.message || 'Plan created successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to create plan';
        console.warn('Backend POST /subscriptions failed:', errMsg);
    }

    const newPlan = {
        _id: 'plan_' + Date.now(),
        id: 'plan_' + Date.now(),
        status: 'active',
        isPopular: false,
        ...planData
    };
    localPlans.push(newPlan);
    savePlansToStorage(localPlans);
    return { success: true, data: newPlan, message: 'Plan created successfully' };
};

/**
 * Update an existing Subscription Plan
 */
export const updatePlan = async (id, planData) => {
    try {
        const response = await api.put(`/subscriptions/${id}`, planData);
        if (response.data && response.data.success) {
            const updated = response.data.data;
            localPlans = localPlans.map(p => (p._id === id || p.id === id) ? updated : p);
            savePlansToStorage(localPlans);
            return {
                success: true,
                data: updated,
                message: response.data.message || 'Plan updated successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update plan';
        console.warn(`Backend PUT /subscriptions/${id} failed:`, errMsg);
    }

    localPlans = localPlans.map(p => (p._id === id || p.id === id) ? { ...p, ...planData } : p);
    savePlansToStorage(localPlans);
    const updated = localPlans.find(p => p._id === id || p.id === id);
    return { success: true, data: updated, message: 'Plan updated successfully' };
};

/**
 * Delete a Subscription Plan
 */
export const deletePlan = async (id) => {
    try {
        const response = await api.delete(`/subscriptions/${id}`);
        if (response.data && response.data.success) {
            localPlans = localPlans.filter(p => p._id !== id && p.id !== id);
            savePlansToStorage(localPlans);
            return {
                success: true,
                message: response.data.message || 'Plan deleted successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to delete plan';
        console.warn(`Backend DELETE /subscriptions/${id} failed:`, errMsg);
    }

    localPlans = localPlans.filter(p => p._id !== id && p.id !== id);
    savePlansToStorage(localPlans);
    return { success: true, message: 'Plan deleted successfully' };
};

/**
 * Toggle Plan Active Status (active / inactive)
 */
export const toggleStatus = async (id, status) => {
    try {
        const response = await api.patch(`/subscriptions/${id}/status`, { status });
        if (response.data && response.data.success) {
            localPlans = localPlans.map(p => (p._id === id || p.id === id) ? { ...p, status } : p);
            savePlansToStorage(localPlans);
            return {
                success: true,
                message: response.data.message || `Status updated to ${status}`
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update plan status';
        console.warn(`Backend PATCH /subscriptions/${id}/status failed:`, errMsg);
    }

    localPlans = localPlans.map(p => (p._id === id || p.id === id) ? { ...p, status } : p);
    savePlansToStorage(localPlans);
    return { success: true, message: `Status updated to ${status}` };
};

/**
 * Toggle Plan Popularity Flag (true / false)
 */
export const togglePopular = async (id, isPopular) => {
    try {
        const response = await api.patch(`/subscriptions/${id}/popular`, { isPopular });
        if (response.data && response.data.success) {
            localPlans = localPlans.map(p => (p._id === id || p.id === id) ? { ...p, isPopular } : p);
            savePlansToStorage(localPlans);
            return {
                success: true,
                message: response.data.message || 'Popular status updated'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update popular status';
        console.warn(`Backend PATCH /subscriptions/${id}/popular failed:`, errMsg);
    }

    localPlans = localPlans.map(p => (p._id === id || p.id === id) ? { ...p, isPopular } : p);
    savePlansToStorage(localPlans);
    return { success: true, message: 'Popular status updated' };
};

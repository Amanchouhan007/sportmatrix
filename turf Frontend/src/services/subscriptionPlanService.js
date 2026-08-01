// UI Mock Service for Subscription Plans (Frontend Only)

const mockPlans = [
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

let plansState = [...mockPlans];

export const createPlan = async (planData) => {
    await new Promise(r => setTimeout(r, 150));
    const newPlan = {
        _id: 'plan_' + Date.now(),
        id: 'plan_' + Date.now(),
        status: 'active',
        isPopular: false,
        ...planData
    };
    plansState.push(newPlan);
    return { success: true, data: newPlan, message: 'Plan created successfully' };
};

export const getAllPlans = async () => {
    await new Promise(r => setTimeout(r, 100));
    return { success: true, data: [...plansState] };
};

export const getPlanById = async (id) => {
    await new Promise(r => setTimeout(r, 100));
    const plan = plansState.find(p => p._id === id || p.id === id) || plansState[0];
    return { success: true, data: plan };
};

export const updatePlan = async (id, planData) => {
    await new Promise(r => setTimeout(r, 150));
    plansState = plansState.map(p => (p._id === id || p.id === id) ? { ...p, ...planData } : p);
    const updated = plansState.find(p => p._id === id || p.id === id);
    return { success: true, data: updated, message: 'Plan updated successfully' };
};

export const deletePlan = async (id) => {
    await new Promise(r => setTimeout(r, 150));
    plansState = plansState.filter(p => p._id !== id && p.id !== id);
    return { success: true, message: 'Plan deleted successfully' };
};

export const toggleStatus = async (id, status) => {
    await new Promise(r => setTimeout(r, 150));
    plansState = plansState.map(p => (p._id === id || p.id === id) ? { ...p, status } : p);
    return { success: true, message: `Status updated to ${status}` };
};

export const togglePopular = async (id, isPopular) => {
    await new Promise(r => setTimeout(r, 150));
    plansState = plansState.map(p => (p._id === id || p.id === id) ? { ...p, isPopular } : p);
    return { success: true, message: 'Popular status updated' };
};


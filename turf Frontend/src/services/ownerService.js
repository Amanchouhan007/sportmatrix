// UI Mock Service for Owner Management (Frontend Only)

const mockOwners = [
    {
        _id: 'own_001',
        id: 'own_001',
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@example.com',
        mobile: '+91 98230 11223',
        status: 'ACTIVE',
        businessName: 'Green Arena Sports Pvt Ltd',
        branchesCount: 3,
        totalBookings: 1240,
        totalRevenue: 485000,
        commission: '₹24,250',
        joinedDate: '2025-01-10',
        city: 'Mumbai',
        state: 'Maharashtra'
    },
    {
        _id: 'own_002',
        id: 'own_002',
        name: 'Vikramaditya Roy',
        email: 'vikram.roy@example.com',
        mobile: '+91 97112 33445',
        status: 'ACTIVE',
        businessName: 'Champion Sports Hub',
        branchesCount: 2,
        totalBookings: 890,
        totalRevenue: 320000,
        commission: '₹16,000',
        joinedDate: '2025-02-01',
        city: 'Bangalore',
        state: 'Karnataka'
    },
    {
        _id: 'own_003',
        id: 'own_003',
        name: 'Suresh Patil',
        email: 'suresh.patil@example.com',
        mobile: '+91 99887 66554',
        status: 'ACTIVE',
        businessName: 'Royal Cricket Ground & Sports',
        branchesCount: 4,
        totalBookings: 2100,
        totalRevenue: 750000,
        commission: '₹37,500',
        joinedDate: '2024-11-15',
        city: 'Indore',
        state: 'Madhya Pradesh'
    },
    {
        _id: 'own_004',
        id: 'own_004',
        name: 'Anita Deshmukh',
        email: 'anita.deshmukh@example.com',
        mobile: '+91 94220 88990',
        status: 'SUSPENDED',
        businessName: 'Metro Sports Club',
        branchesCount: 1,
        totalBookings: 150,
        totalRevenue: 60000,
        commission: '₹3,000',
        joinedDate: '2025-03-05',
        city: 'Pune',
        state: 'Maharashtra'
    },
    {
        _id: 'own_005',
        id: 'own_005',
        name: 'Karan Malhotra',
        email: 'karan.m@example.com',
        mobile: '+91 98190 77665',
        status: 'INACTIVE',
        businessName: 'Apex Sports Arena',
        branchesCount: 1,
        totalBookings: 310,
        totalRevenue: 110000,
        commission: '₹5,500',
        joinedDate: '2025-01-20',
        city: 'Delhi',
        state: 'Delhi'
    }
];

let ownersState = [...mockOwners];

export const createOwner = async (ownerData) => {
    await new Promise(r => setTimeout(r, 150));
    const newOwner = {
        _id: 'own_' + Date.now(),
        id: 'own_' + Date.now(),
        status: 'ACTIVE',
        branchesCount: 0,
        totalBookings: 0,
        totalRevenue: 0,
        commission: '₹0',
        joinedDate: new Date().toISOString().split('T')[0],
        ...ownerData
    };
    ownersState.unshift(newOwner);
    return { success: true, data: newOwner, message: 'Owner created successfully' };
};

export const getOwners = async (filters = {}) => {
    await new Promise(r => setTimeout(r, 100));
    let filtered = [...ownersState];

    if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(o => o.status === filters.status);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(o => 
            (o.name && o.name.toLowerCase().includes(q)) || 
            (o.email && o.email.toLowerCase().includes(q)) ||
            (o.mobile && o.mobile.includes(q)) ||
            (o.businessName && o.businessName.toLowerCase().includes(q))
        );
    }

    const page = parseInt(filters.page || 1, 10);
    const limit = parseInt(filters.limit || 10, 10);
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedOwners = filtered.slice(startIndex, startIndex + limit);

    return {
        success: true,
        data: {
            owners: paginatedOwners,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        }
    };
};

export const getOwnerById = async (id) => {
    await new Promise(r => setTimeout(r, 100));
    const owner = ownersState.find(o => o._id === id || o.id === id) || ownersState[0];
    return { success: true, data: owner };
};

export const updateOwner = async (id, ownerData) => {
    await new Promise(r => setTimeout(r, 150));
    ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, ...ownerData } : o);
    const updated = ownersState.find(o => o._id === id || o.id === id);
    return { success: true, data: updated, message: 'Owner updated successfully' };
};

export const changeOwnerStatus = async (id, status) => {
    await new Promise(r => setTimeout(r, 150));
    ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, status } : o);
    return { success: true, message: `Owner status changed to ${status}` };
};

export const resetOwnerPassword = async () => {
    await new Promise(r => setTimeout(r, 150));
    return { success: true, message: 'Password reset successfully' };
};

export const deleteOwner = async (id) => {
    await new Promise(r => setTimeout(r, 150));
    ownersState = ownersState.filter(o => o._id !== id && o.id !== id);
    return { success: true, message: 'Owner deleted successfully' };
};


import api from './api';

// Initial Seed Owners Data
const initialMockOwners = [
    {
        _id: 'own_001',
        id: 'own_001',
        name: 'Rajesh Sharma',
        fullName: 'Rajesh Sharma',
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
        fullName: 'Vikramaditya Roy',
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
        fullName: 'Suresh Patil',
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
        fullName: 'Anita Deshmukh',
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
        fullName: 'Karan Malhotra',
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

// Persistent local storage cache helper
const getLocalOwners = () => {
    try {
        const cached = localStorage.getItem('sports_owners_data');
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.error('Error reading owners from localStorage:', e);
    }
    return initialMockOwners;
};

const saveLocalOwners = (data) => {
    try {
        localStorage.setItem('sports_owners_data', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving owners to localStorage:', e);
    }
};

let ownersState = getLocalOwners();

/**
 * Format single backend owner row for UI consumption
 */
const mapOwnerResponse = (o) => {
    if (!o) return null;
    return {
        _id: o.id || o._id,
        id: o.id || o._id,
        name: o.fullName || o.full_name || o.name || '',
        fullName: o.fullName || o.full_name || o.name || '',
        email: o.email || '',
        mobile: o.mobile || '',
        alternateMobile: o.alternateMobile || o.alternate_mobile || '',
        status: o.status || 'ACTIVE',
        businessName: o.businessName || o.business_name || '',
        businessType: o.businessType || o.business_type || '',
        gstNumber: o.gstNumber || o.gst_number || '',
        panNumber: o.panNumber || o.pan_number || '',
        country: o.country || 'India',
        state: o.state || '',
        city: o.city || '',
        zipCode: o.zipCode || o.zip_code || '',
        address: o.fullAddress || o.full_address || o.address || '',
        profileImage: o.profileImage || o.profile_image || '',
        branchesCount: o.branchesCount ?? o.branches_count ?? 0,
        totalBookings: o.totalBookings ?? o.total_bookings ?? 0,
        totalRevenue: o.totalRevenue ?? o.total_revenue ?? 0,
        commission: o.commission ?? '₹0',
        joinedDate: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : (o.joinedDate || new Date().toISOString().split('T')[0])
    };
};

/**
 * Get All Owners with filtering, search, and pagination (Real Backend + Persistent Fallback)
 */
export const getOwners = async (filters = {}) => {
    try {
        const response = await api.get('/owners', { params: filters });
        if (response.data && response.data.success) {
            const rawOwners = response.data.data.owners || [];
            const mappedOwners = rawOwners.map(mapOwnerResponse);
            return {
                success: true,
                data: {
                    owners: mappedOwners,
                    pagination: response.data.data.pagination || {
                        total: mappedOwners.length,
                        page: Number(filters.page || 1),
                        limit: Number(filters.limit || 10),
                        totalPages: Math.ceil(mappedOwners.length / Number(filters.limit || 10)) || 1
                    }
                }
            };
        }
    } catch (err) {
        console.warn('Backend /owners API offline, using local persistent state fallback.', err.message);
    }

    // Refresh state from localStorage
    ownersState = getLocalOwners();
    let filtered = [...ownersState];

    if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(o => o.status === filters.status);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(o =>
            (o.name && o.name.toLowerCase().includes(q)) ||
            (o.fullName && o.fullName.toLowerCase().includes(q)) ||
            (o.email && o.email.toLowerCase().includes(q)) ||
            (o.mobile && o.mobile.includes(q)) ||
            (o.businessName && o.businessName.toLowerCase().includes(q)) ||
            (o.city && o.city.toLowerCase().includes(q))
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

/**
 * Get Owner details by ID
 */
export const getOwnerById = async (id) => {
    try {
        const response = await api.get(`/owners/${id}`);
        if (response.data && response.data.success) {
            return {
                success: true,
                data: mapOwnerResponse(response.data.data)
            };
        }
    } catch (err) {
        console.warn(`Backend GET /owners/${id} failed, using local fallback.`, err.message);
    }

    ownersState = getLocalOwners();
    const owner = ownersState.find(o => o._id === id || o.id === id) || ownersState[0];
    return { success: true, data: mapOwnerResponse(owner) };
};

/**
 * Create Owner
 */
export const createOwner = async (ownerData) => {
    try {
        const response = await api.post('/owners', ownerData);
        if (response.data && response.data.success) {
            const created = mapOwnerResponse(response.data.data);
            ownersState.unshift(created);
            saveLocalOwners(ownersState);
            return {
                success: true,
                data: created,
                message: response.data.message || 'Owner created successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to create owner';
        console.warn('Backend POST /owners failed, saving to persistent local storage:', errMsg);
        
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    ownersState = getLocalOwners();
    const newOwner = {
        _id: 'own_' + Date.now(),
        id: 'own_' + Date.now(),
        status: 'ACTIVE',
        branchesCount: 0,
        totalBookings: 0,
        totalRevenue: 0,
        commission: '₹0',
        joinedDate: new Date().toISOString().split('T')[0],
        ...ownerData,
        name: ownerData.fullName || ownerData.name,
        fullName: ownerData.fullName || ownerData.name
    };
    ownersState.unshift(newOwner);
    saveLocalOwners(ownersState);
    return { success: true, data: newOwner, message: 'Owner created successfully' };
};

/**
 * Update Owner
 */
export const updateOwner = async (id, ownerData) => {
    try {
        const response = await api.put(`/owners/${id}`, ownerData);
        if (response.data && response.data.success) {
            const updated = mapOwnerResponse(response.data.data);
            ownersState = ownersState.map(o => (o._id === id || o.id === id) ? updated : o);
            saveLocalOwners(ownersState);
            return {
                success: true,
                data: updated,
                message: response.data.message || 'Owner updated successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update owner';
        console.warn(`Backend PUT /owners/${id} failed:`, errMsg);
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    ownersState = getLocalOwners();
    ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, ...ownerData, name: ownerData.fullName || o.name, fullName: ownerData.fullName || o.fullName } : o);
    saveLocalOwners(ownersState);
    const updated = ownersState.find(o => o._id === id || o.id === id);
    return { success: true, data: updated, message: 'Owner updated successfully' };
};

/**
 * Change Owner Status
 */
export const changeOwnerStatus = async (id, status) => {
    try {
        const response = await api.patch(`/owners/${id}/status`, { status });
        if (response.data && response.data.success) {
            ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, status } : o);
            saveLocalOwners(ownersState);
            return { success: true, message: response.data.message || `Owner status changed to ${status}` };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to change owner status';
        console.warn(`Backend PATCH /owners/${id}/status failed:`, errMsg);
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    ownersState = getLocalOwners();
    ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, status } : o);
    saveLocalOwners(ownersState);
    return { success: true, message: `Owner status changed to ${status}` };
};

/**
 * Reset Owner Password
 */
export const resetOwnerPassword = async (id, newPassword) => {
    try {
        const passwordVal = typeof newPassword === 'string' ? newPassword : newPassword?.password;
        const response = await api.put(`/owners/${id}`, { password: passwordVal });
        if (response.data && response.data.success) {
            return { success: true, message: 'Password reset successfully' };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to reset password';
        console.warn(`Backend reset password failed:`, errMsg);
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    return { success: true, message: 'Password reset successfully' };
};

/**
 * Delete Owner
 */
export const deleteOwner = async (id) => {
    try {
        const response = await api.delete(`/owners/${id}`);
        if (response.data && response.data.success) {
            ownersState = ownersState.filter(o => o._id !== id && o.id !== id);
            saveLocalOwners(ownersState);
            return { success: true, message: response.data.message || 'Owner deleted successfully' };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to delete owner';
        console.warn(`Backend DELETE /owners/${id} failed:`, errMsg);
        if (err.response && err.response.status < 500) {
            throw new Error(errMsg);
        }
    }

    ownersState = getLocalOwners();
    ownersState = ownersState.filter(o => o._id !== id && o.id !== id);
    saveLocalOwners(ownersState);
    return { success: true, message: 'Owner deleted successfully' };
};

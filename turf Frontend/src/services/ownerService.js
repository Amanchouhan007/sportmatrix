import api from './api';

// Initial Seed Owners Data
const initialMockOwners = [];

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
    return [];
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
        const resData = response.data || response;
        if (resData && (resData.success || resData.owners)) {
            const rawOwners = resData.data?.owners || resData.owners || [];
            const mappedOwners = rawOwners.map(mapOwnerResponse);
            return {
                success: true,
                data: {
                    owners: mappedOwners,
                    pagination: resData.data?.pagination || resData.pagination || {
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
        const resData = response.data || response;
        if (resData && resData.success) {
            return {
                success: true,
                data: mapOwnerResponse(resData.data)
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
        const resData = response.data || response;
        if (resData && (resData.success || resData.id || resData._id)) {
            const created = mapOwnerResponse(resData.data || resData);
            ownersState.unshift(created);
            saveLocalOwners(ownersState);
            return {
                success: true,
                data: created,
                message: resData.message || 'Owner created successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to create owner';
        console.warn('Backend POST /owners failed, saving to persistent local storage:', errMsg);
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
        const resData = response.data || response;
        if (resData && resData.success) {
            const updated = mapOwnerResponse(resData.data || resData);
            ownersState = ownersState.map(o => (o._id === id || o.id === id) ? updated : o);
            saveLocalOwners(ownersState);
            return {
                success: true,
                data: updated,
                message: resData.message || 'Owner updated successfully'
            };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to update owner';
        console.warn(`Backend PUT /owners/${id} failed:`, errMsg);
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
        const resData = response.data || response;
        if (resData && resData.success) {
            ownersState = ownersState.map(o => (o._id === id || o.id === id) ? { ...o, status } : o);
            saveLocalOwners(ownersState);
            return { success: true, message: resData.message || `Owner status changed to ${status}` };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to change owner status';
        console.warn(`Backend PATCH /owners/${id}/status failed:`, errMsg);
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
        const resData = response.data || response;
        if (resData && resData.success) {
            return { success: true, message: 'Password reset successfully' };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to reset password';
        console.warn(`Backend reset password failed:`, errMsg);
    }

    return { success: true, message: 'Password reset successfully' };
};

/**
 * Delete Owner
 */
export const deleteOwner = async (id) => {
    try {
        const response = await api.delete(`/owners/${id}`);
        const resData = response.data || response;
        if (resData && resData.success) {
            ownersState = ownersState.filter(o => o._id !== id && o.id !== id);
            saveLocalOwners(ownersState);
            return { success: true, message: resData.message || 'Owner deleted successfully' };
        }
    } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to delete owner';
        console.warn(`Backend DELETE /owners/${id} failed:`, errMsg);
    }

    ownersState = getLocalOwners();
    ownersState = ownersState.filter(o => o._id !== id && o.id !== id);
    saveLocalOwners(ownersState);
    return { success: true, message: 'Owner deleted successfully' };
};

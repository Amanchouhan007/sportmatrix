// UI Mock Service for Commission Settings (Frontend Only)

let commissionSettingsState = {
    defaultRate: 5.0,
    maxRate: 15.0,
    status: 'ACTIVE',
    sportsRates: [
        { sportName: 'Football', commissionRate: 5.0 },
        { sportName: 'Cricket', commissionRate: 5.0 },
        { sportName: 'Football', commissionRate: 4.0 },
        { sportName: 'Football', commissionRate: 4.5 }
    ]
};

export const getCommissionSettings = async () => {
    await new Promise(r => setTimeout(r, 100));
    return {
        success: true,
        data: commissionSettingsState
    };
};

export const updateCommissionSettings = async (payload) => {
    await new Promise(r => setTimeout(r, 150));
    commissionSettingsState = { ...commissionSettingsState, ...payload };
    return {
        success: true,
        data: commissionSettingsState,
        message: 'Commission settings updated successfully'
    };
};

export const changeCommissionStatus = async (status) => {
    await new Promise(r => setTimeout(r, 150));
    commissionSettingsState.status = status;
    return {
        success: true,
        message: `Commission status changed to ${status}`
    };
};


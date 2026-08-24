import api from './api';

/** Submit a corporate & bulk turf booking proposal. Real API call only. */
export const submitCorporateProposal = async (proposalData) => {
    const payload = {
        companyName: proposalData.companyName,
        contactPerson: proposalData.contactPerson,
        phone: proposalData.phone,
        email: proposalData.email,
        eventType: proposalData.eventType,
        city: proposalData.city,
        estimatedPlayers: proposalData.estimatedPlayers,
        budget: proposalData.budget,
        eventDate: proposalData.eventDate || null,
        timeSlot: proposalData.timeSlot,
        notes: proposalData.notes,
    };

    const res = await api.post('/corporate/proposals', payload);
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to submit corporate proposal.');
    }
    return res;
};

/** Fetch all corporate proposals (Owner/Super Admin CRM). */
export const getCorporateProposals = async (params = {}) => {
    const res = await api.get('/corporate/proposals', { params });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch corporate proposals.');
    }
    return res.data || [];
};

/** Update a corporate proposal's status/notes. */
export const updateCorporateProposalStatus = async (id, status, notes) => {
    const res = await api.patch(`/corporate/proposals/${id}/status`, { status, notes });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to update proposal status.');
    }
    return res;
};

/** Submit an admin custom quote for a corporate proposal. */
export const saveCorporateQuote = async (proposalId, quoteData) => {
    const res = await api.patch(`/corporate/proposals/${proposalId}/quote`, {
        quotedPrice: quoteData.quotedPrice,
        discountAmount: quoteData.discountAmount || 0,
        gstAmount: quoteData.gstAmount || 0,
        finalTotal: quoteData.finalTotal,
        depositRequired: quoteData.depositRequired,
        addons: quoteData.addons || [],
        adminNotes: quoteData.adminNotes || '',
        status: quoteData.status || 'PROPOSAL_SENT',
    });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to save corporate quote.');
    }
    return res;
};

export default {
    submitCorporateProposal,
    getCorporateProposals,
    updateCorporateProposalStatus,
    saveCorporateQuote
};

const prisma = require('../../config/prisma');

const genId = () => `lead_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const formatLead = (c) => ({
    id: c.id,
    branchId: c.branchId,
    name: c.contactName,
    phone: c.phone,
    email: c.email,
    category: c.category,
    teamName: c.teamName,
    preferredSport: c.preferredSport,
    preferredSlot: c.slotPreference,
    status: c.status,
    notes: c.notes,
    broadcastCount: c.broadcastCount,
    lastBroadcastAt: c.lastBroadcastAt,
    createdAt: c.createdAt
});

const resolveOwnerBranchIds = async (user) => {
    const branches = await prisma.branch.findMany({ where: { ownerUserId: user.id }, select: { id: true } });
    return branches.map(b => b.id);
};

/**
 * Real CRM leads for the requesting owner's branch(es) -- a genuine leads
 * table, not a synthetic aggregation of every registered user/booking/team.
 */
const getLeads = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { branchId, category, status } = req.query;
        const where = {};
        if (branchId) where.branchId = branchId;
        else if (req.user.role !== 'SUPER_ADMIN') where.branchId = { in: await resolveOwnerBranchIds(req.user) };
        if (category && category !== 'ALL') where.category = category;
        if (status && status !== 'ALL') where.status = status;

        const leads = await prisma.crmLead.findMany({ where, orderBy: { createdAt: 'desc' } });
        const formatted = leads.map(formatLead);

        return res.status(200).json({
            success: true,
            data: formatted,
            summary: {
                totalContacts: formatted.length,
                totalTeams: formatted.filter(l => l.category === 'CAPTAIN_TEAM').length,
                corporateProposals: formatted.filter(l => l.category === 'CORPORATE').length,
                activeUmpires: formatted.filter(l => l.category === 'UMPIRE').length
            }
        });
    } catch (error) {
        console.error('Fetch CRM leads error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching CRM leads: ' + error.message });
    }
};

const assertBranchAccess = async (branchId, user) => {
    if (!branchId) return true;
    if (user.role === 'SUPER_ADMIN') return true;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return !!branch && branch.ownerUserId === user.id;
};

const createLead = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const { branchId, name, fullName, email, phone, category, teamName, preferredSport, preferredSlot, status, notes } = req.body;
    const leadName = name || fullName;

    if (!leadName) {
        return res.status(400).json({ success: false, message: 'Name is a required field.' });
    }
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone is a required field.' });
    }

    try {
        if (branchId && !(await assertBranchAccess(branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        const lead = await prisma.crmLead.create({
            data: {
                id: genId(),
                branchId: branchId || null,
                contactName: leadName.trim(),
                phone: phone.trim(),
                email: email || null,
                category: category || 'CAPTAIN_TEAM',
                teamName: teamName || null,
                slotPreference: preferredSlot || null,
                preferredSport: preferredSport || null,
                status: status || 'NEW',
                notes: notes || null
            }
        });

        return res.status(201).json({ success: true, message: 'CRM lead created successfully', data: formatLead(lead) });
    } catch (error) {
        console.error('Create CRM lead error:', error);
        return res.status(500).json({ success: false, message: 'Error creating CRM lead: ' + error.message });
    }
};

const deleteLead = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const lead = await prisma.crmLead.findUnique({ where: { id: req.params.id } });
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found.' });
        }
        if (!(await assertBranchAccess(lead.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        await prisma.crmLead.delete({ where: { id: req.params.id } });
        return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete CRM lead error:', error);
        return res.status(500).json({ success: false, message: 'Error deleting lead: ' + error.message });
    }
};

/**
 * Records a broadcast against the targeted leads' real counters. There is no
 * WhatsApp/SMS gateway wired up yet (a documented future integration) -- this
 * honestly persists that a broadcast was sent rather than faking delivery.
 */
const broadcastOffer = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const { leadIds, message, offerTitle } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ success: false, message: 'leadIds must be a non-empty array.' });
    }

    try {
        const result = await prisma.crmLead.updateMany({
            where: { id: { in: leadIds } },
            data: { broadcastCount: { increment: 1 }, lastBroadcastAt: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: `Broadcast recorded for ${result.count} contact(s).`,
            data: { offerTitle, message, targeted: result.count, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Broadcast offer error:', error);
        return res.status(500).json({ success: false, message: 'Error recording broadcast: ' + error.message });
    }
};

module.exports = { getLeads, createLead, deleteLead, broadcastOffer };

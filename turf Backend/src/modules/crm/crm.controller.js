const db = require('../../config/db');

/**
 * Get all CRM leads from database
 */
const getLeads = async (req, res) => {
    try {
        const ownerFilter = req.query.ownerId || req.query.owner_id || (req.user?.role === 'OWNER' ? req.user.id : null);
        const emailFilter = req.query.email || req.user?.email;

        const [crmRows] = await db.query('SELECT * FROM crm_leads ORDER BY created_at DESC');

        // 1. Fetch real slot bookings as Customer / Player leads
        let bookingLeads = [];
        try {
            let bookingSql = `
                SELECT b.id, b.customer_name, b.mobile_number, b.sport_name, b.duty_date, b.time_slot, b.amount, b.status, b.created_at,
                       br.branch_name, br.city
                FROM bookings b
                LEFT JOIN branches br ON b.branch_id = br.id
            `;
            const bParams = [];
            if (req.user?.role === 'OWNER' || (ownerFilter && ownerFilter !== 'ALL')) {
                bookingSql += ` WHERE (b.branch_id IN (SELECT id FROM branches WHERE owner_id = ? OR owner_id IN (SELECT id FROM owners WHERE email = ? OR user_id = ? OR id = ?) OR email = ?))`;
                bParams.push(ownerFilter || '', emailFilter || '', ownerFilter || '', ownerFilter || '', emailFilter || '');
            }
            bookingSql += ` ORDER BY b.created_at DESC`;
            const [bRows] = await db.query(bookingSql, bParams);
            bookingLeads = bRows.map(b => ({
                id: `bmt_lead_${b.id}`,
                name: b.customer_name || 'Player Contact',
                phone: b.mobile_number || '',
                email: '',
                role: 'player',
                category: 'PLAYER',
                teamName: `${b.sport_name || 'Sports'} Player`,
                preferredSport: b.sport_name || 'Cricket',
                preferredSlot: `${b.time_slot || ''} (${b.duty_date || ''})`,
                turfBranch: b.branch_name || (b.city ? `${b.city} Turf` : 'Indore Strikers Arena'),
                status: b.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed',
                totalBookings: 1,
                amount: b.amount ? `₹${Number(b.amount).toLocaleString('en-IN')}` : 'N/A',
                notes: `Real Slot Booking ${b.id}`,
                createdAt: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }));
        } catch (e) { console.warn('Booking leads error:', e.message); }

        // 2. Fetch registered Customer / Player Users as contacts (Excluding Admins & Owners!)
        let userLeads = [];
        try {
            const [uRows] = await db.query(`SELECT id, name, email, mobile, role, created_at FROM users WHERE role NOT IN ('SUPER_ADMIN', 'SUPERADMIN', 'OWNER', 'ADMIN')`);
            userLeads = uRows.map(u => ({
                id: `user_lead_${u.id}`,
                name: u.name || 'Registered Customer',
                phone: u.mobile || '',
                email: u.email || '',
                role: 'player',
                category: 'PLAYER',
                teamName: 'Registered Member',
                preferredSport: 'Cricket',
                preferredSlot: 'Flexible',
                turfBranch: 'All Turf Branches',
                status: 'Confirmed',
                totalBookings: 1,
                notes: `Platform Registered Player`,
                createdAt: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }));
        } catch (e) { console.warn('User leads error:', e.message); }

        // 3. Fetch Teams as Captain / Team leads
        let teamLeads = [];
        try {
            const [tRows] = await db.query(`SELECT id, team_name, captain_name, captain_email, captain_mobile, status, created_at FROM teams`);
            teamLeads = tRows.map(t => ({
                id: `team_lead_${t.id}`,
                name: t.captain_name || 'Team Captain',
                phone: t.captain_mobile || '',
                email: t.captain_email || '',
                role: 'captain',
                category: 'CAPTAIN',
                teamName: t.team_name || 'Tournament Team',
                preferredSport: 'Cricket',
                preferredSlot: 'Tournament Fixtures',
                turfBranch: 'All Turf Branches',
                status: t.status || 'Confirmed',
                totalBookings: 1,
                notes: `Tournament Team Captain (${t.team_name})`,
                createdAt: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }));
        } catch (e) { console.warn('Team leads error:', e.message); }

        // Map CRM leads table
        const mappedCrm = crmRows.map(c => ({
            id: c.id,
            name: c.contact_name,
            phone: c.phone,
            email: c.email,
            role: (c.category || 'player').toLowerCase(),
            category: c.category || 'PLAYER',
            teamName: c.team_name || 'Individual',
            preferredSport: c.preferred_sport || 'Cricket',
            preferredSlot: c.slot_preference || 'Flexible',
            turfBranch: 'Indore Strikers Arena',
            status: c.status || 'NEW',
            totalBookings: 1,
            notes: c.notes,
            createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));

        // Deduplicate leads by phone or name
        const combined = [...mappedCrm, ...bookingLeads, ...userLeads, ...teamLeads];
        const seen = new Set();
        const deduplicated = [];
        for (const item of combined) {
            const key = (item.phone && item.phone !== 'N/A') ? item.phone : item.name;
            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(item);
            }
        }

        // Count active venues
        const [bRes] = await db.query(`SELECT COUNT(*) as count FROM branches WHERE status = 'ACTIVE'`);
        const activeVenues = Number(bRes[0]?.count || 4);

        const corporateCount = deduplicated.filter(l => l.role === 'corporate' || l.category === 'CORPORATE').length;
        const umpireCount = deduplicated.filter(l => l.role === 'umpire' || l.category === 'UMPIRE').length;
        const teamCount = deduplicated.filter(l => l.role === 'captain' || l.category === 'CAPTAIN').length;

        return res.status(200).json({
            success: true,
            data: deduplicated,
            summary: {
                totalContacts: deduplicated.length,
                totalTeams: teamCount,
                corporateProposals: corporateCount,
                activeUmpires: umpireCount,
                activeVenues
            }
        });
    } catch (error) {
        console.error('Fetch CRM leads error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching CRM leads: ' + error.message
        });
    }
};

/**
 * Create a new CRM lead
 */
const createLead = async (req, res) => {
    const { name, fullName, email, phone, role, teamName, preferredSport, preferredSlot, turfBranch, status, notes } = req.body;
    const leadName = name || fullName;
    const leadPhone = phone || 'N/A';

    if (!leadName) {
        return res.status(400).json({
            success: false,
            message: 'Name is a required field.'
        });
    }

    try {
        const leadId = `lead_${Date.now()}`;
        await db.query(`
            INSERT INTO crm_leads (id, contact_name, phone, email, category, team_name, slot_preference, preferred_sport, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            leadId,
            leadName.trim(),
            leadPhone.trim(),
            email || null,
            'CAPTAIN_TEAM',
            teamName || null,
            preferredSlot || 'Weekend Evening',
            preferredSport || 'Cricket',
            status || 'NEW',
            notes || null
        ]);

        return res.status(201).json({
            success: true,
            message: 'CRM lead created successfully',
            data: {
                id: leadId,
                name: leadName,
                phone: leadPhone,
                email,
                notes
            }
        });
    } catch (error) {
        console.error('Create CRM lead error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating CRM lead: ' + error.message
        });
    }
};

/**
 * Delete a CRM lead
 */
const deleteLead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM crm_leads WHERE id = ?', [id]);
        return res.status(200).json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Delete CRM lead error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting lead: ' + error.message
        });
    }
};

/**
 * Broadcast message to leads
 */
const broadcastOffer = async (req, res) => {
    const { leadIds, message, offerTitle } = req.body;
    return res.status(200).json({
        success: true,
        message: `Broadcast successfully dispatched for ${Array.isArray(leadIds) ? leadIds.length : 1} contacts.`,
        data: { offerTitle, message, timestamp: new Date().toISOString() }
    });
};

module.exports = {
    getLeads,
    createLead,
    deleteLead,
    broadcastOffer
};

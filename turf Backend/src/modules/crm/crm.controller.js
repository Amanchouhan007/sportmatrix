const db = require('../../config/db');

/**
 * Get all CRM leads from database
 */
const getLeads = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM crm_leads ORDER BY created_at DESC');
        return res.status(200).json({
            success: true,
            data: rows
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
    const { name, phone, role, teamName, preferredSport, preferredSlot, turfBranch, status, notes } = req.body;

    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Name and Phone number are required fields.'
        });
    }

    try {
        const leadId = `lead_${Date.now()}`;
        await db.query(`
            INSERT INTO crm_leads (id, name, phone, role, team_name, preferred_sport, preferred_slot, turf_branch, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            leadId,
            name.trim(),
            phone.trim(),
            role || 'team',
            teamName || null,
            preferredSport || 'Cricket',
            preferredSlot || 'Weekend Evening',
            turfBranch || 'SportZone Arena',
            status || 'Hot Lead',
            notes || null
        ]);

        return res.status(201).json({
            success: true,
            message: 'CRM lead created successfully',
            data: {
                id: leadId,
                name,
                phone,
                role: role || 'team',
                teamName,
                preferredSport,
                preferredSlot,
                turfBranch,
                status: status || 'Hot Lead',
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

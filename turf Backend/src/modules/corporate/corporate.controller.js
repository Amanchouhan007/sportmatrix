const db = require('../../config/db');

// 1. Submit a new Corporate Proposal
exports.createCorporateProposal = async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            phone,
            email,
            eventType = 'Corporate Tournament',
            city = 'Indore',
            estimatedPlayers = '10-20 Players',
            budget = '₹25,000 - ₹50,000',
            eventDate,
            notes
        } = req.body;

        // Validation: Company name and phone are required
        if (!companyName || !companyName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Company / Organization Name is required.'
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Mobile Number is required.'
            });
        }

        // Generate unique proposal ID
        const id = `CORP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const sanitizedEventDate = eventDate ? new Date(eventDate) : null;

        const query = `
            INSERT INTO corporate_bookings (
                id, company_name, contact_person, phone, email,
                event_type, city, estimated_players, budget, event_date,
                status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)
        `;

        await db.query(query, [
            id,
            companyName.trim(),
            contactPerson ? contactPerson.trim() : null,
            phone.trim(),
            email ? email.trim() : null,
            eventType || 'Corporate Tournament',
            city || 'Indore',
            estimatedPlayers || '10-20 Players',
            budget || '₹25,000 - ₹50,000',
            sanitizedEventDate,
            notes ? notes.trim() : null
        ]);

        return res.status(201).json({
            success: true,
            message: 'Corporate proposal request submitted successfully! An Event Manager will reach out shortly.',
            data: {
                id,
                companyName: companyName.trim(),
                contactPerson: contactPerson ? contactPerson.trim() : null,
                phone: phone.trim(),
                email: email ? email.trim() : null,
                eventType,
                city,
                estimatedPlayers,
                budget,
                status: 'NEW',
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating corporate proposal:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit corporate proposal. Please try again.',
            error: error.message
        });
    }
};

// 2. Fetch all Corporate Proposals (for Admin / Owner CRM)
exports.getAllCorporateProposals = async (req, res) => {
    try {
        const { status, city, search } = req.query;
        let query = `SELECT * FROM corporate_bookings WHERE 1=1`;
        const params = [];

        if (status && status !== 'ALL') {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (city && city !== 'ALL') {
            query += ` AND city = ?`;
            params.push(city);
        }

        if (search) {
            query += ` AND (company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR email LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        query += ` ORDER BY created_at DESC`;

        const [proposals] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals
        });
    } catch (error) {
        console.error('Error fetching corporate proposals:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve corporate proposals.',
            error: error.message
        });
    }
};

// 3. Get single proposal by ID
exports.getCorporateProposalById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`SELECT * FROM corporate_bookings WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Corporate proposal with ID "${id}" not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching corporate proposal by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch corporate proposal details.',
            error: error.message
        });
    }
};

// 4. Update Proposal Status & Notes
exports.updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['NEW', 'CONTACTED', 'QUOTATION_SENT', 'CONVERTED', 'REJECTED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
            });
        }

        let updateQuery = `UPDATE corporate_bookings SET `;
        const updates = [];
        const params = [];

        if (status) {
            updates.push(`status = ?`);
            params.push(status);
        }

        if (notes !== undefined) {
            updates.push(`notes = ?`);
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided to update.'
            });
        }

        updateQuery += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Corporate proposal with ID "${id}" not found.`
            });
        }

        const [updatedRows] = await db.query(`SELECT * FROM corporate_bookings WHERE id = ?`, [id]);

        return res.status(200).json({
            success: true,
            message: 'Corporate proposal status updated successfully.',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Error updating corporate proposal status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update proposal status.',
            error: error.message
        });
    }
};

// 5. Submit Official Admin Price Quote for Corporate Proposal
exports.updateCorporateQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            quotedPrice,
            discountAmount,
            gstAmount,
            finalTotal,
            depositRequired,
            addons,
            adminNotes,
            status = 'QUOTATION_SENT'
        } = req.body;

        const formattedNotes = `Quote: ₹${finalTotal || quotedPrice} (Base: ₹${quotedPrice}, GST: ₹${gstAmount || 0}) | Addons: ${Array.isArray(addons) ? addons.join(', ') : addons || 'None'} | Terms: ${adminNotes || 'N/A'}`;

        const updateQuery = `UPDATE corporate_bookings SET status = ?, notes = ? WHERE id = ?`;
        const [result] = await db.query(updateQuery, [status, formattedNotes, id]);

        return res.status(200).json({
            success: true,
            message: 'Official corporate quotation dispatched and saved successfully.',
            data: {
                id,
                quotedPrice: finalTotal || quotedPrice,
                discountAmount,
                gstAmount,
                depositRequired,
                addons,
                status,
                adminNotes
            }
        });
    } catch (error) {
        console.error('Error updating corporate quote:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update corporate quote.',
            error: error.message
        });
    }
};

// 6. Delete Proposal
exports.deleteCorporateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(`DELETE FROM corporate_bookings WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Corporate proposal with ID "${id}" not found.`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Corporate proposal deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting corporate proposal:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete corporate proposal.',
            error: error.message
        });
    }
};

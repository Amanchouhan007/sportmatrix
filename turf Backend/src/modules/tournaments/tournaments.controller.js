const db = require('../../config/db');

/**
 * Fetch tournaments list mapped to frontend data formats
 */
const getTournaments = async (req, res) => {
    const { branchId } = req.query;

    if (!branchId) {
        return res.status(400).json({
            success: false,
            message: 'branchId query parameter is required.'
        });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                t.id,
                t.title,
                t.description,
                t.start_date,
                t.end_date,
                t.registration_fee,
                t.max_teams,
                t.prize_pool,
                t.status,
                s.name as sport_name,
                (SELECT COUNT(*) FROM teams tm WHERE tm.tournament_id = t.id AND tm.status = 'CONFIRMED') as registrations
            FROM tournaments t
            JOIN sports s ON t.sport_id = s.id
            WHERE t.branch_id = ?
            ORDER BY t.start_date ASC
        `, [branchId]);

        const formatDate = (dateVal) => {
            if (!dateVal) return '';
            const d = new Date(dateVal);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        };

        // Formatting mappings to match initialTournaments format in UI
        const formatted = rows.map(r => ({
            id: r.id,
            _id: r.id,
            name: r.title,
            description: r.description || '',
            sport: r.sport_name,
            date: formatDate(r.start_date),
            startDate: r.start_date,
            endDate: r.end_date,
            entryFee: String(r.registration_fee),
            prize: `₹${Number(r.prize_pool.replace(/,/g, '')).toLocaleString()}`,
            prizePool: r.prize_pool,
            teams: `${r.registrations}/${r.max_teams}`,
            registrations: r.registrations,
            maxTeams: r.max_teams,
            status: r.status
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch tournaments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching tournaments.'
        });
    }
};

/**
 * Fetch tournament details by ID
 */
const getTournamentById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT t.*, s.name as sport_name 
            FROM tournaments t
            JOIN sports s ON t.sport_id = s.id
            WHERE t.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found.'
            });
        }

        const r = rows[0];
        const [teams] = await db.query('SELECT * FROM teams WHERE tournament_id = ? AND status = "CONFIRMED"', [id]);

        const detail = {
            id: r.id,
            _id: r.id,
            name: r.title,
            description: r.description,
            sport: r.sport_name,
            startDate: r.start_date,
            endDate: r.end_date,
            entryFee: r.registration_fee,
            prize: r.prize_pool,
            registrations: teams.length,
            maxTeams: r.max_teams,
            status: r.status,
            teamsList: teams
        };

        return res.status(200).json({
            success: true,
            data: detail
        });
    } catch (error) {
        console.error('Fetch tournament details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching tournament details.'
        });
    }
};

/**
 * Create a new tournament
 */
const createTournament = async (req, res) => {
    const { branchId, name, sportId, startDate, endDate, entryFee, prizePool, maxTeams, status } = req.body;

    if (!branchId || !name || !sportId || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'branchId, name, sportId, startDate, and endDate are required fields.'
        });
    }

    try {
        const tourneyId = 't_' + Date.now();
        await db.query(`
            INSERT INTO tournaments (id, branch_id, title, description, sport_id, start_date, end_date, registration_fee, max_teams, prize_pool, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tourneyId,
            branchId,
            name,
            req.body.description || '',
            sportId,
            startDate,
            endDate,
            entryFee || 0,
            maxTeams || 16,
            prizePool || '0',
            status || 'Upcoming'
        ]);

        return res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            data: { id: tourneyId, name }
        });
    } catch (error) {
        console.error('Create tournament error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error creating tournament.'
        });
    }
};

/**
 * Update tournament details
 */
const updateTournament = async (req, res) => {
    const { id } = req.params;
    const { name, description, startDate, endDate, entryFee, prizePool, maxTeams, status } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM tournaments WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found.'
            });
        }

        await db.query(`
            UPDATE tournaments 
            SET 
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                registration_fee = COALESCE(?, registration_fee),
                prize_pool = COALESCE(?, prize_pool),
                max_teams = COALESCE(?, max_teams),
                status = COALESCE(?, status)
            WHERE id = ?
        `, [name, description, startDate, endDate, entryFee, prizePool, maxTeams, status, id]);

        return res.status(200).json({
            success: true,
            message: 'Tournament updated successfully'
        });
    } catch (error) {
        console.error('Update tournament error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating tournament.'
        });
    }
};

/**
 * Delete a tournament
 */
const deleteTournament = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM tournaments WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tournament deleted successfully'
        });
    } catch (error) {
        console.error('Delete tournament error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting tournament.'
        });
    }
};

/**
 * Register a team for a tournament
 */
const registerTeam = async (req, res) => {
    const { id } = req.params; // Tournament ID
    const { teamName, captainName, captainEmail, captainMobile } = req.body;

    if (!teamName || !captainName || !captainEmail || !captainMobile) {
        return res.status(400).json({
            success: false,
            message: 'teamName, captainName, captainEmail, and captainMobile are required.'
        });
    }

    try {
        // 1. Check tournament constraints
        const [tourneys] = await db.query('SELECT max_teams FROM tournaments WHERE id = ?', [id]);
        if (tourneys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found.'
            });
        }

        const maxTeams = tourneys[0].max_teams;

        // 2. Count active registrations
        const [teams] = await db.query('SELECT COUNT(*) as count FROM teams WHERE tournament_id = ? AND status = "CONFIRMED"', [id]);
        if (teams[0].count >= maxTeams) {
            return res.status(409).json({
                success: false,
                message: 'Tournament registration is full.'
            });
        }

        // 3. Insert team
        const teamId = 'tm_' + Date.now();
        await db.query(`
            INSERT INTO teams (id, tournament_id, team_name, captain_name, captain_email, captain_mobile, status)
            VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
        `, [teamId, id, teamName.trim(), captainName.trim(), captainEmail.trim(), captainMobile.trim()]);

        return res.status(201).json({
            success: true,
            message: 'Team successfully registered for tournament.',
            teamId
        });
    } catch (error) {
        console.error('Register team error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error registering team.'
        });
    }
};

/**
 * Get round brackets matchmaking schedule
 */
const getBracketSchedule = async (req, res) => {
    const { id } = req.params; // Tournament ID

    try {
        const [teams] = await db.query('SELECT team_name FROM teams WHERE tournament_id = ? AND status = "CONFIRMED"', [id]);

        // If not enough teams are registered, output standard fallback brackets for testing
        if (teams.length < 4) {
            const defaultBrackets = [
                {
                    name: 'Semi-Finals',
                    matches: [
                        { id: 1, teams: [{ seed: 1, name: 'Indore Thunders', score: 145, winner: true }, { seed: 4, name: 'Warriors XI', score: 122 }] },
                        { id: 2, teams: [{ seed: 2, name: 'Royal Challengers', score: 156, winner: true }, { seed: 3, name: 'Super Kings', score: 148 }] },
                    ]
                },
                {
                    name: 'Grand Finale',
                    matches: [
                        { id: 3, teams: [{ seed: 1, name: 'Indore Thunders', score: '—' }, { seed: 2, name: 'Royal Challengers', score: '—' }] }
                    ]
                }
            ];

            return res.status(200).json({
                success: true,
                data: defaultBrackets
            });
        }

        // Generate dynamic brackets from real teams (Semi-Finals/Finals layout)
        const tNames = teams.map(t => t.team_name);
        const dynamicSchedule = [
            {
                name: 'Semi-Finals',
                matches: [
                    { id: 1, teams: [{ seed: 1, name: tNames[0], score: '—' }, { seed: 4, name: tNames[3] || 'TBD', score: '—' }] },
                    { id: 2, teams: [{ seed: 2, name: tNames[1], score: '—' }, { seed: 3, name: tNames[2] || 'TBD', score: '—' }] }
                ]
            },
            {
                name: 'Grand Finale',
                matches: [
                    { id: 3, teams: [{ seed: 1, name: `Winner of Semi #1`, score: '—' }, { seed: 2, name: `Winner of Semi #2`, score: '—' }] }
                ]
            }
        ];

        return res.status(200).json({
            success: true,
            data: dynamicSchedule
        });
    } catch (error) {
        console.error('Fetch brackets schedule error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error generating bracket schedule.'
        });
    }
};

module.exports = {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    registerTeam,
    getBracketSchedule
};

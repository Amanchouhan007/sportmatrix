const prisma = require('../../config/prisma');

const genId = () => `tm_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const formatTeam = (t) => ({
    id: t.id,
    _id: t.id,
    branchId: t.branchId,
    name: t.teamName,
    teamName: t.teamName,
    sport: t.sport,
    rosterCount: t.rosterCount,
    rank: t.rank,
    wins: t.wins,
    losses: t.losses,
    draws: t.draws,
    createdAt: t.createdAt
});

const getTeams = async (req, res) => {
    try {
        const { branchId } = req.query;
        const rows = await prisma.clubTeam.findMany({
            where: branchId ? { branchId } : {},
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: rows.map(formatTeam) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



const createTeam = async (req, res) => {
    const { branchId, name, teamName, sport, membersCount } = req.body;
    const resolvedName = teamName || name;
    if (!resolvedName) {
        return res.status(400).json({ success: false, message: 'Team name is required.' });
    }

    try {
        const team = await prisma.clubTeam.create({
            data: {
                id: genId(),
                branchId: branchId || null,
                teamName: resolvedName,
                sport: sport || 'Cricket',
                rosterCount: membersCount || 11
            }
        });
        return res.status(201).json({ success: true, data: formatTeam(team) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeams, createTeam };

export const MASTER_TOURNAMENTS = [];

export const MASTER_TEAMS = [];

export const MASTER_PAYMENTS = [];

export const getMasterTournamentMetrics = () => {
    const totalTournaments = MASTER_TOURNAMENTS.length;
    const pendingApprovals = MASTER_TOURNAMENTS.filter(t => t.status === 'Pending Approval').length;
    const approvedActive = MASTER_TOURNAMENTS.filter(t => t.status === 'Approved' || t.status === 'Active').length;
    const totalTeams = MASTER_TOURNAMENTS.reduce((sum, t) => sum + (t.registrations || 0), 0);
    const totalRevenue = MASTER_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
    const platformCommission = MASTER_PAYMENTS.reduce((sum, p) => sum + p.commissionAmount, 0);

    return {
        totalTournaments,
        pendingApprovals,
        approvedActive,
        totalTeams,
        totalRevenue,
        platformCommission
    };
};

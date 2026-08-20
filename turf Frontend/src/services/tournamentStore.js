export const MASTER_TOURNAMENTS = [
    { id: 't_001', title: 'Premier Cricket Cup', sport: 'Cricket', startDate: '2026-03-15', endDate: '2026-03-20', date: 'Mar 15 - Mar 20, 2026', entryFee: 500, prizePool: 50000, prize: '₹50,000', teams: '12/16', registrations: 12, maxTeams: 16, status: 'Approved', format: 'Knockout', createdBy: 'Rajesh Sharma' },
    { id: 't_002', title: 'Indore Football Cup', sport: 'Football', startDate: '2026-03-22', endDate: '2026-03-25', date: 'Mar 22 - Mar 25, 2026', entryFee: 800, prizePool: 30000, prize: '₹30,000', teams: '6/8', registrations: 6, maxTeams: 8, status: 'Pending Approval', format: 'League', createdBy: 'Amit Kumar (Staff)' },
    { id: 't_003', title: 'Football Open Arena', sport: 'Football', startDate: '2026-02-28', endDate: '2026-03-02', date: 'Feb 28 - Mar 02, 2026', entryFee: 300, prizePool: 15000, prize: '₹15,000', teams: '16/16', registrations: 16, maxTeams: 16, status: 'Completed', format: 'League + Knockout', createdBy: 'Vikramaditya Roy' },
    { id: 't_004', title: 'Monsoon Futsal League', sport: 'Football', startDate: '2026-04-10', endDate: '2026-04-12', date: 'Apr 10 - Apr 12, 2026', entryFee: 600, prizePool: 20000, prize: '₹20,000', teams: '4/12', registrations: 4, maxTeams: 12, status: 'Draft', format: 'Knockout', createdBy: 'Kiaan Tech' },
];

export const MASTER_TEAMS = [
    { id: 'tm_101', tournamentTitle: 'Premier Cricket Cup', teamName: 'Indore Thunders', logo: '⚡', captainName: 'Rajesh Patel', captainEmail: 'rajesh@gmail.com', captainMobile: '+91 98765 43201', jerseyColor: 'Yellow & Black', paymentStatus: 'PAID', paymentMethod: 'UPI', amount: 500, status: 'Approved', registeredAt: '2026-03-01' },
    { id: 'tm_102', tournamentTitle: 'Premier Cricket Cup', teamName: 'Royal Challengers', logo: '🦁', captainName: 'Kunal Shah', captainEmail: 'kunal@gmail.com', captainMobile: '+91 98765 43202', jerseyColor: 'Red & Gold', paymentStatus: 'PAID', paymentMethod: 'WALLET', amount: 500, status: 'Approved', registeredAt: '2026-03-02' },
    { id: 'tm_201', tournamentTitle: 'Indore Football Cup', teamName: 'Red Devils Futsal', logo: '😈', captainName: 'Suraj Sharma', captainEmail: 'suraj.sharma@gmail.com', captainMobile: '+91 98765 43220', jerseyColor: 'Crimson Red', paymentStatus: 'PAID', paymentMethod: 'ONLINE', amount: 800, status: 'Pending', registeredAt: '2026-03-05' },
    { id: 'tm_301', tournamentTitle: 'Football Open Arena', teamName: 'Apex FC', logo: '⚽', captainName: 'Devendra Singh', captainEmail: 'devendra@gmail.com', captainMobile: '+91 98765 43230', jerseyColor: 'Blue', paymentStatus: 'PAID', paymentMethod: 'UPI', amount: 300, status: 'Approved', registeredAt: '2026-02-28' }
];

export const MASTER_PAYMENTS = [
    { id: 1, tournamentTitle: 'Premier Cricket Cup', transactionType: 'Entry Fee', invoiceNumber: 'INV-TRN-1001', payerName: 'Indore Thunders', amount: 500, commissionAmount: 50, paymentMethod: 'UPI', status: 'COMPLETED', date: '2026-03-01' },
    { id: 2, tournamentTitle: 'Premier Cricket Cup', transactionType: 'Entry Fee', invoiceNumber: 'INV-TRN-1002', payerName: 'Royal Challengers', amount: 500, commissionAmount: 50, paymentMethod: 'WALLET', status: 'COMPLETED', date: '2026-03-02' },
    { id: 3, tournamentTitle: 'Indore Football Cup', transactionType: 'Entry Fee', invoiceNumber: 'INV-TRN-1003', payerName: 'Red Devils Futsal', amount: 800, commissionAmount: 80, paymentMethod: 'ONLINE', status: 'COMPLETED', date: '2026-03-05' },
    { id: 4, tournamentTitle: 'Football Open Arena', transactionType: 'Sponsor Payment', invoiceNumber: 'INV-SPN-2002', payerName: 'Nike Sports', amount: 30000, commissionAmount: 3000, paymentMethod: 'UPI', status: 'COMPLETED', date: '2026-02-28' }
];

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

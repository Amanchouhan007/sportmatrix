import api from './api';

// Calculate Weighted Player Performance Score (PPS)
export const calculatePPS = (player, tierWeight = 1.0) => {
    const battingAvgPart = (player.battingAvg || 0) * 0.30
    const battingSrPart = (player.strikeRate || 0) * 0.15
    const wicketsPerMatch = (player.wickets || 0) / Math.max(1, player.matches || 1)
    const wicketsPart = wicketsPerMatch * 20
    const economyFactor = Math.max(0, (10 - (player.economy || 7.0))) * 10
    const winRatePart = (parseFloat(player.winRate) || 50) * 0.20
    const mvpPart = (player.mvps || 0) * 12

    const baseScore = battingAvgPart + battingSrPart + wicketsPart + economyFactor + winRatePart + mvpPart
    const finalScore = baseScore * tierWeight
    return Math.round(finalScore * 10) / 10
}

export const fetchGlobalLeaderboard = async () => {
    try {
        const res = await api.get('/tournaments/leaderboard/global');
        if (res && res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            return res.data.data.map(item => ({
                id: item.id || item.team_id,
                name: item.team_name || item.captain_name || 'Sports Team',
                avatar: item.logo || '🏆',
                team: item.team_name || 'Independent',
                city: item.city || 'Indore',
                sport: item.sport_type || 'Cricket',
                role: 'Team Leader',
                matches: item.matches_played || 0,
                runs: (item.wins || 0) * 50,
                battingAvg: item.points || 0,
                strikeRate: 150.0,
                wickets: item.goal_difference || item.draws || 0,
                economy: 6.0,
                winRate: `${Math.round(((item.wins || 0) / Math.max(1, item.matches_played || 1)) * 100)}%`,
                mvps: item.wins || 0,
                highestScore: `${item.goals_for || 0}`,
                bestBowling: '—',
                verificationTier: 'Tier 3',
                tierMultiplier: 2.0,
                trustScore: 98,
                currentPPS: (item.points || 0) * 10 + (item.wins || 0) * 5,
                badges: ['🏆 Verified Team']
            }));
        }
    } catch (e) {
        console.warn('Backend leaderboard fetch error:', e.message);
    }
    return getLeaderboardPlayers();
};

export const INITIAL_LEADERBOARD_PLAYERS = []

// Get Master Merged Leaderboard List
export const getLeaderboardPlayers = () => {
    try {
        const storedCustom = localStorage.getItem('indore_custom_leaderboard_players')
        const customList = storedCustom ? JSON.parse(storedCustom) : []

        // Create a map by normalized name to override initial players seamlessly
        const playerMap = new Map()

        // 1. Load initial default players
        for (const p of INITIAL_LEADERBOARD_PLAYERS) {
            const key = p.name.trim().toLowerCase()
            const pps = calculatePPS(p, p.tierMultiplier || 1.0)
            playerMap.set(key, { ...p, currentPPS: pps })
        }

        // 2. Overlay / Merge custom & umpire certified players
        for (const p of customList) {
            if (!p.name) continue
            const key = p.name.trim().toLowerCase()
            const existing = playerMap.get(key)

            const tierMultiplier = p.tierMultiplier || (p.verificationTier === 'Tier 3' ? 2.0 : p.verificationTier === 'Tier 2' ? 1.5 : 1.0)

            if (existing) {
                const merged = {
                    ...existing,
                    ...p,
                    verificationTier: p.verificationTier || existing.verificationTier || 'Tier 2',
                    tierMultiplier: tierMultiplier,
                    badges: Array.from(new Set([...(existing.badges || []), ...(p.badges || [])]))
                }
                merged.currentPPS = calculatePPS(merged, tierMultiplier)
                playerMap.set(key, merged)
            } else {
                const newP = {
                    ...p,
                    verificationTier: p.verificationTier || 'Tier 2',
                    tierMultiplier: tierMultiplier
                }
                newP.currentPPS = calculatePPS(newP, tierMultiplier)
                playerMap.set(key, newP)
            }
        }

        return Array.from(playerMap.values()).sort((a, b) => b.currentPPS - a.currentPPS)
    } catch (e) {
        console.error('Error loading leaderboard players:', e)
        return []
    }
}

// Add or Update player stats when Umpire or User signs off a match
export const addOrUpdateLeaderboardPlayer = (playerData) => {
    try {
        const currentList = getLeaderboardPlayers()
        const key = playerData.name.trim().toLowerCase()
        const existingIndex = currentList.findIndex(p => p.name.trim().toLowerCase() === key)

        let updatedEntry = null

        if (existingIndex >= 0) {
            const existing = currentList[existingIndex]
            const newMatches = (existing.matches || 1) + 1
            const newRuns = (existing.runs || 0) + (playerData.newRuns || 0)
            const newWickets = (existing.wickets || 0) + (playerData.newWickets || 0)
            const newMvps = (existing.mvps || 0) + (playerData.isMvp ? 1 : 0)

            const calculatedAvg = Math.round((newRuns / Math.max(1, newMatches)) * 10) / 10
            const calculatedSr = playerData.newBalls > 0 
                ? Math.round(((playerData.newRuns / playerData.newBalls) * 100) * 10) / 10
                : existing.strikeRate || 160.0

            const tier = playerData.verificationTier || 'Tier 2'
            const tierMult = tier === 'Tier 3' ? 2.0 : tier === 'Tier 2' ? 1.5 : 1.0

            updatedEntry = {
                ...existing,
                matches: newMatches,
                runs: newRuns,
                wickets: newWickets,
                mvps: newMvps,
                battingAvg: calculatedAvg > 0 ? calculatedAvg : existing.battingAvg,
                strikeRate: calculatedSr > 0 ? calculatedSr : existing.strikeRate,
                team: playerData.team || existing.team,
                verificationTier: tier,
                tierMultiplier: tierMult,
                badges: Array.from(new Set([
                    ...(existing.badges || []),
                    ...(playerData.isMvp ? ['⭐ Match MVP'] : []),
                    tier === 'Tier 2' ? '⚖️ Paid Umpire Verified (1.5x)' : '🏆 Official Certified'
                ]))
            }
            updatedEntry.currentPPS = calculatePPS(updatedEntry, tierMult)
        } else {
            const tier = playerData.verificationTier || 'Tier 2'
            const tierMult = tier === 'Tier 3' ? 2.0 : tier === 'Tier 2' ? 1.5 : 1.0

            const runs = (playerData.newRuns || 45) + 300
            const matches = playerData.matches || 10
            const avg = Math.round((runs / matches) * 10) / 10
            const sr = playerData.newBalls > 0 ? Math.round(((playerData.newRuns / playerData.newBalls) * 100) * 10) / 10 : 175.0

            updatedEntry = {
                id: `ply_ump_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                name: playerData.name.trim(),
                avatar: playerData.avatar || '⚡',
                team: playerData.team || 'Indore Blasters',
                city: playerData.city || 'Indore',
                sport: 'Cricket',
                role: playerData.role || 'All-Rounder',
                matches: matches,
                runs: runs,
                battingAvg: avg,
                strikeRate: sr,
                wickets: (playerData.newWickets || 0) + 8,
                economy: playerData.economy || 6.80,
                winRate: '75.0%',
                mvps: playerData.isMvp ? 5 : 3,
                highestScore: `${playerData.newRuns || 50}*`,
                bestBowling: `${playerData.newWickets || 2}/18`,
                verificationTier: tier,
                tierMultiplier: tierMult,
                trustScore: 98,
                badges: [
                    tier === 'Tier 2' ? '⚖️ Paid Umpire Verified (1.5x)' : '🏆 Official Certified',
                    ...(playerData.isMvp ? ['⭐ Match MVP'] : [])
                ]
            }
            updatedEntry.currentPPS = calculatePPS(updatedEntry, tierMult)
        }

        // Save custom/updated list into localStorage
        const storedCustom = JSON.parse(localStorage.getItem('indore_custom_leaderboard_players') || '[]')
        const filteredCustom = storedCustom.filter(p => p.name.trim().toLowerCase() !== key)
        const newCustomList = [updatedEntry, ...filteredCustom]

        localStorage.setItem('indore_custom_leaderboard_players', JSON.stringify(newCustomList))

        // Trigger event so any open leaderboard UI auto-refreshes!
        window.dispatchEvent(new Event('leaderboardUpdated'))
        return updatedEntry
    } catch (e) {
        console.error('Failed to update leaderboard player:', e)
    }
}

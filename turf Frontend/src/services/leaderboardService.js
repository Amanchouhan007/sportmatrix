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

export const INITIAL_LEADERBOARD_PLAYERS = [
    {
        id: 'ply_indore_1',
        name: 'Karan Malhotra',
        avatar: '🔥',
        team: 'Vijay Nagar Blasters',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Top-Order Batsman',
        matches: 34,
        runs: 1540,
        battingAvg: 55.0,
        strikeRate: 186.5,
        wickets: 14,
        economy: 7.80,
        winRate: '82.4%',
        mvps: 12,
        highestScore: '124*',
        bestBowling: '2/18',
        verificationTier: 'Tier 3',
        tierMultiplier: 2.0,
        trustScore: 99,
        badges: ['🏆 Indore Cup Champion', '⭐ 12x MVP', '🔥 Century Master']
    },
    {
        id: 'ply_indore_2',
        name: 'Vikramaditya Roy',
        avatar: '🎯',
        team: 'Palasia Super Strikers',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Fast Bowler & All-Rounder',
        matches: 29,
        runs: 560,
        battingAvg: 28.0,
        strikeRate: 148.0,
        wickets: 48,
        economy: 5.60,
        winRate: '75.8%',
        mvps: 8,
        highestScore: '54*',
        bestBowling: '5/10',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 97,
        badges: ['⚖️ Paid Umpire Verified', '🎯 5-Wicket Haul', '⚡ Pace King']
    },
    {
        id: 'ply_indore_3',
        name: 'Rohit Soni',
        avatar: '🏏',
        team: 'Bhawarkua Royal Kings',
        city: 'Indore',
        sport: 'Cricket',
        role: 'All-Rounder',
        matches: 27,
        runs: 1120,
        battingAvg: 46.6,
        strikeRate: 169.2,
        wickets: 31,
        economy: 6.90,
        winRate: '70.3%',
        mvps: 7,
        highestScore: '92',
        bestBowling: '4/22',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 96,
        badges: ['⚖️ Paid Umpire Verified', '⭐ 7x MVP']
    },
    {
        id: 'ply_indore_4',
        name: 'Devendra Rathore',
        avatar: '🛡️',
        team: 'Annapurna Titans',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Opening Batsman',
        matches: 24,
        runs: 980,
        battingAvg: 44.5,
        strikeRate: 162.0,
        wickets: 6,
        economy: 8.20,
        winRate: '66.7%',
        mvps: 5,
        highestScore: '86*',
        bestBowling: '2/14',
        verificationTier: 'Tier 3',
        tierMultiplier: 2.0,
        trustScore: 95,
        badges: ['🏆 Tournament Elite', '⭐ 5x MVP']
    },
    {
        id: 'ply_indore_5',
        name: 'Shubham Joshi',
        avatar: '🌪️',
        team: 'Super Corridor Smashers',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Spin Bowler',
        matches: 22,
        runs: 240,
        battingAvg: 20.0,
        strikeRate: 130.0,
        wickets: 38,
        economy: 5.90,
        winRate: '68.2%',
        mvps: 6,
        highestScore: '38',
        bestBowling: '4/11',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 96,
        badges: ['⚖️ Paid Umpire Verified', '🌪️ Spin Wizard']
    },
    {
        id: 'ply_indore_6',
        name: 'Yashwant Rao',
        avatar: '⚡',
        team: 'Rau Cricket Club',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Wicketkeeper Batsman',
        matches: 26,
        runs: 890,
        battingAvg: 42.3,
        strikeRate: 174.0,
        wickets: 0,
        economy: 0,
        winRate: '65.4%',
        mvps: 5,
        highestScore: '88',
        bestBowling: '—',
        verificationTier: 'Tier 1',
        tierMultiplier: 1.0,
        trustScore: 93,
        badges: ['✓ Captain Handshake', '🧤 26 Dismissals']
    },
    {
        id: 'ply_indore_7',
        name: 'Deepak Patel',
        avatar: '🌟',
        team: 'Scheme 54 Blasters',
        city: 'Indore',
        sport: 'Cricket',
        role: 'All-Rounder',
        matches: 20,
        runs: 710,
        battingAvg: 39.4,
        strikeRate: 158.0,
        wickets: 24,
        economy: 7.10,
        winRate: '65.0%',
        mvps: 4,
        highestScore: '74',
        bestBowling: '3/16',
        verificationTier: 'Tier 1',
        tierMultiplier: 1.0,
        trustScore: 92,
        badges: ['✓ Captain Handshake']
    },
    {
        id: 'ply_indore_8',
        name: 'Aman Varma',
        avatar: '🚀',
        team: 'Mahalaxmi Nagar Kings',
        city: 'Indore',
        sport: 'Cricket',
        role: 'Pinch Hitter',
        matches: 19,
        runs: 680,
        battingAvg: 40.0,
        strikeRate: 192.5,
        wickets: 11,
        economy: 8.40,
        winRate: '63.1%',
        mvps: 4,
        highestScore: '79*',
        bestBowling: '2/20',
        verificationTier: 'Tier 2',
        tierMultiplier: 1.5,
        trustScore: 94,
        badges: ['⚖️ Paid Umpire Verified', '🚀 Highest SR']
    }
]

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
        return INITIAL_LEADERBOARD_PLAYERS
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

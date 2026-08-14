import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    HiCheckCircle, 
    HiClock, 
    HiLocationMarker, 
    HiPhone, 
    HiStar, 
    HiUserGroup, 
    HiShieldCheck, 
    HiEye, 
    HiPlus, 
    HiX, 
    HiCheck, 
    HiRefresh, 
    HiDownload, 
    HiSparkles,
    HiLightningBolt,
    HiLogout,
    HiQrcode
} from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { addOrUpdateLeaderboardPlayer } from '../../services/leaderboardService'

// Initial Assigned Umpire Matches Data for Indore Turfs
const INITIAL_MATCHES = [
    {
        id: 'MTC-IND-901',
        title: 'Vijay Nagar Blasters vs Indore Super Kings',
        turf: 'Spike Cricket Turf',
        turfLocation: 'Bhawarkua, Indore',
        date: 'Today, 13 Aug',
        time: '6:00 PM – 7:00 PM',
        slotId: '18:00',
        matchType: 'Dare Match™ (Loser Pays All)',
        modeBadge: '🔥 DARE MATCH',
        hasUmpireRequested: true,
        status: 'Live Now',
        statusColor: 'emerald',
        umpireFee: 300,
        umpireName: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        paymentStatus: 'Direct QR Pending',
        teamA: {
            name: 'Vijay Nagar Blasters',
            captain: 'Rahul Sharma',
            phone: '+91 98765 43210',
            score: 74,
            wickets: 3,
            overs: '5.2'
        },
        teamB: {
            name: 'Indore Super Kings',
            captain: 'Aman Verma',
            phone: '+91 98765 43211',
            score: 0,
            wickets: 0,
            overs: '0.0'
        },
        target: 75,
        currentOverBalls: ['1', '4', '0', '6', 'W', '1'],
        striker: 'Rahul Sharma (42 off 19)',
        nonStriker: 'Vikram Singh (18 off 12)',
        bowler: 'Aman Verma (1/12 in 1.2 ov)',
        multiplier: '1.5x Umpire Verified'
    },
    {
        id: 'MTC-IND-902',
        title: 'Palasia Panthers vs Annapurna Strikers',
        turf: 'Royal Cricket Ground',
        turfLocation: 'Vijay Nagar, Indore',
        date: 'Today, 13 Aug',
        time: '7:30 PM – 8:30 PM',
        slotId: '19:30',
        matchType: '50:50 Split Match',
        modeBadge: '🤝 50:50 SPLIT',
        hasUmpireRequested: true,
        status: 'Upcoming',
        statusColor: 'blue',
        umpireFee: 300,
        umpireName: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        paymentStatus: 'QR Paid on Ground',
        teamA: {
            name: 'Palasia Panthers',
            captain: 'Karan Singhal',
            phone: '+91 98765 43212',
            score: 0,
            wickets: 0,
            overs: '0.0'
        },
        teamB: {
            name: 'Annapurna Strikers',
            captain: 'Yash Rathore',
            phone: '+91 98765 43213',
            score: 0,
            wickets: 0,
            overs: '0.0'
        },
        target: 0,
        currentOverBalls: [],
        striker: 'Toss Pending',
        nonStriker: '',
        bowler: '',
        multiplier: '1.5x Umpire Verified'
    },
    {
        id: 'MTC-IND-903',
        title: 'Super Corridor Titans vs Rau Royals',
        turf: 'Indore Sports Complex',
        turfLocation: 'LIG Colony, Indore',
        date: 'Today, 13 Aug',
        time: '9:00 PM – 10:00 PM',
        slotId: '21:00',
        matchType: 'Official Tournament Semi-Final',
        modeBadge: '🏆 TOURNAMENT',
        hasUmpireRequested: true,
        status: 'Upcoming',
        statusColor: 'purple',
        umpireFee: 300,
        umpireName: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        paymentStatus: 'QR Paid on Ground',
        teamA: {
            name: 'Super Corridor Titans',
            captain: 'Devendra Patel',
            phone: '+91 98765 43214',
            score: 0,
            wickets: 0,
            overs: '0.0'
        },
        teamB: {
            name: 'Rau Royals',
            captain: 'Sachin Narang',
            phone: '+91 98765 43215',
            score: 0,
            wickets: 0,
            overs: '0.0'
        },
        target: 0,
        currentOverBalls: [],
        striker: 'Awaiting Match Start',
        nonStriker: '',
        bowler: '',
        multiplier: '2.0x Tournament Double'
    }
]

// Past Match Record History (Konsa Match Kis Umpire Ne Conduct Kiya)
const INITIAL_OFFICIATED_HISTORY = [
    {
        id: 'LOG-IND-441',
        matchTitle: 'Vijay Nagar Blasters vs Palasia Panthers',
        turf: 'Spike Cricket Turf (Indore)',
        date: 'Yesterday, 12 Aug 2026',
        time: '8:00 PM – 9:00 PM',
        officiatedBy: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        result: 'Vijay Nagar Blasters won by 3 runs (82/4 vs 79/6)',
        mvp: 'Karan Malhotra (52* off 22 & 2 wkts)',
        payment: '✓ ₹300 Direct QR Paid by Captain (PhonePe)',
        verifiedTier: '⚖️ 1.5x Umpire Certified'
    },
    {
        id: 'LOG-IND-438',
        matchTitle: 'Indore Tigers vs Bhawarkua Super Kings',
        turf: 'Royal Cricket Ground (Indore)',
        date: '11 Aug 2026',
        time: '6:00 PM – 7:00 PM',
        officiatedBy: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        result: 'Indore Tigers won by 18 runs (112/2 vs 94/8)',
        mvp: 'Aman Verma (64 off 26)',
        payment: '✓ ₹300 Direct QR Paid by Captain (GPay)',
        verifiedTier: '⚖️ 1.5x Umpire Certified'
    },
    {
        id: 'LOG-IND-432',
        matchTitle: 'Dare Match™: Super Corridor vs Rau Royals',
        turf: 'Indore Sports Complex',
        date: '10 Aug 2026',
        time: '9:00 PM – 10:00 PM',
        officiatedBy: 'Rajesh Sisodiya (LIC: UMP-IND-409)',
        result: 'Super Corridor won (65/5 vs 62/7) • Loser Paid Full Turf',
        mvp: 'Rahul Sharma (3 wkts in final over)',
        payment: '✓ ₹300 Cash Received on Ground',
        verifiedTier: '⚖️ 1.5x Umpire Certified'
    },
    {
        id: 'LOG-IND-429',
        matchTitle: 'Champion Turf Box Cup - Match 4',
        turf: 'Champion Turf Ground (Indore)',
        date: '08 Aug 2026',
        time: '7:00 PM – 8:00 PM',
        officiatedBy: 'Vikram Gaud (LIC: UMP-IND-208)',
        result: 'Annapurna Strikers won by 6 wickets (78/2 in 4.5 ov)',
        mvp: 'Sachin Narang (38* off 14)',
        payment: '✓ ₹300 QR Paid (Paytm)',
        verifiedTier: '🏆 2.0x Tournament Double'
    }
]

export default function UmpireDashboard() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const toastContext = useToast()
    const addToast = toastContext?.addToast

    // Umpire Active State & QR Configuration
    const [isOnDuty, setIsOnDuty] = useState(true)
    const [activeTab, setActiveTab] = useState('duty') // 'duty' | 'history' | 'qr' | 'rules'
    const [myUpiId, setMyUpiId] = useState(() => {
        return localStorage.getItem('umpire_upi_id') || 'rajesh.umpire@okhdfcbank'
    })
    const [myUmpireName, setMyUmpireName] = useState('Rajesh Sisodiya')

    // Matches requiring umpire
    const [matches, setMatches] = useState(() => {
        try {
            const saved = localStorage.getItem('umpire_matches_data')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    return parsed.map(m => ({ ...m, umpireFee: 300 }))
                }
            }
        } catch (e) {}
        return INITIAL_MATCHES
    })

    // Officiated match history
    const [matchHistory, setMatchHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('umpire_match_history')
            if (saved) return JSON.parse(saved)
        } catch (e) {}
        return INITIAL_OFFICIATED_HISTORY
    })

    // Active Live Scoring Modal State
    const [scoringMatch, setScoringMatch] = useState(null)
    const [currentScore, setCurrentScore] = useState({
        runs: 74,
        wickets: 3,
        overs: 5.2,
        ballsThisOver: ['1', '4', '0', '6', 'W', '1'],
        selectedInnings: 'Vijay Nagar Blasters',
        topBatsman: 'Rahul Sharma',
        batsmanRuns: 58,
        batsmanBalls: 32,
        batsmanFours: 6,
        batsmanSixes: 3,
        topBowler: 'Aman Verma',
        bowlerWickets: 3,
        bowlerOvers: '4.0',
        bowlerRuns: 22,
        mvpPlayer: 'Rahul Sharma',
        mvpPhone: '+91 98765 43210',
        matchNotes: 'Clean match. Certified with 1.5x rating.'
    })

    // QR Payment Modal State & Custom QR Upload
    const [qrModalMatch, setQrModalMatch] = useState(null)
    const [customQrImage, setCustomQrImage] = useState(() => {
        return localStorage.getItem('umpire_custom_qr_img') || null
    })
    const [qrMode, setQrMode] = useState(() => {
        return localStorage.getItem('umpire_qr_mode') || 'upi' // 'upi' | 'custom'
    })

    // Match & Captains Editor Modal State
    const [editingCaptainsMatch, setEditingCaptainsMatch] = useState(null)

    // Toss Ceremony State
    const [tossMatch, setTossMatch] = useState(null)
    const [tossDecision, setTossDecision] = useState({
        winnerTeam: '',
        electedTo: 'bat', // 'bat' | 'bowl'
        tossMode: 'system', // 'system' | 'manual'
        callingTeam: '',
        callingCall: 'HEADS', // 'HEADS' | 'TAILS'
        coinFlipping: false,
        coinResult: null // 'HEADS' | 'TAILS'
    })

    // Official Payment Receipt Modal State
    const [receiptModalMatch, setReceiptModalMatch] = useState(null)

    useEffect(() => {
        try {
            localStorage.setItem('umpire_matches_data', JSON.stringify(matches))
            localStorage.setItem('umpire_match_history', JSON.stringify(matchHistory))
            localStorage.setItem('umpire_upi_id', myUpiId)
            localStorage.setItem('umpire_qr_mode', qrMode)
            if (customQrImage) {
                localStorage.setItem('umpire_custom_qr_img', customQrImage)
            }
        } catch (e) {}
    }, [matches, matchHistory, myUpiId, qrMode, customQrImage])

    // Save Live Ball
    const handleAddBall = (eventStr) => {
        setCurrentScore(prev => {
            let addRuns = 0
            let isWicket = false
            if (['0', '1', '2', '3', '4', '6'].includes(eventStr)) {
                addRuns = parseInt(eventStr, 10)
            } else if (eventStr === 'W') {
                isWicket = true
            } else if (eventStr === 'WD' || eventStr === 'NB') {
                addRuns = 1
            }

            const nextRuns = prev.runs + addRuns
            const nextWickets = isWicket ? Math.min(10, prev.wickets + 1) : prev.wickets
            const nextBalls = [...prev.ballsThisOver, eventStr]

            return {
                ...prev,
                runs: nextRuns,
                wickets: nextWickets,
                ballsThisOver: nextBalls.length > 6 ? [eventStr] : nextBalls
            }
        })
        if (addToast) addToast(`Ball Recorded: ${eventStr}`, 'info')
    }

    // Complete Match & Certify Scorecard (Pushes to History & Leaderboard)
    const handleSignAndCertifyMatch = (match) => {
        const batsmanName = currentScore.topBatsman || currentScore.mvpPlayer || match.teamA?.captain || 'Rahul Sharma'
        const batsmanRuns = parseInt(currentScore.batsmanRuns || 58, 10)
        const batsmanBalls = parseInt(currentScore.batsmanBalls || 32, 10)
        const bowlerName = currentScore.topBowler || match.teamB?.captain || 'Aman Verma'
        const bowlerWkts = parseInt(currentScore.bowlerWickets || 3, 10)
        const calculatedSR = Math.round((batsmanRuns / Math.max(1, batsmanBalls)) * 100 * 10) / 10

        const newHistoryRecord = {
            id: `LOG-IND-${Math.floor(100 + Math.random() * 900)}`,
            matchTitle: match.title,
            turf: `${match.turf} (${match.turfLocation})`,
            date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            time: match.time,
            officiatedBy: `${myUmpireName} (LIC: UMP-IND-409)`,
            result: `${currentScore.selectedInnings} scored ${currentScore.runs}/${currentScore.wickets} in ${currentScore.overs} overs`,
            mvp: `${currentScore.mvpPlayer} (${batsmanRuns} Runs / ${bowlerWkts} Wkts)`,
            payment: `✓ ₹${match.umpireFee || 300} Received on Personal QR (${myUpiId})`,
            verifiedTier: '⚖️ 1.5x Umpire Certified'
        }

        const updatedHistory = [newHistoryRecord, ...matchHistory]
        setMatchHistory(updatedHistory)

        // 🌟 Push Official Umpire-Certified Performance to Indore Leaderboard!
        const isBatsmanMvp = currentScore.mvpPlayer?.toLowerCase().includes(batsmanName.toLowerCase())
        addOrUpdateLeaderboardPlayer({
            name: batsmanName,
            team: match.teamA?.name || 'Indore Blasters',
            newRuns: batsmanRuns,
            newBalls: batsmanBalls,
            newWickets: 0,
            isMvp: isBatsmanMvp,
            verificationTier: 'Tier 2',
            role: 'Batsman'
        })

        if (bowlerName && bowlerName.toLowerCase() !== batsmanName.toLowerCase()) {
            const isBowlerMvp = currentScore.mvpPlayer?.toLowerCase().includes(bowlerName.toLowerCase())
            addOrUpdateLeaderboardPlayer({
                name: bowlerName,
                team: match.teamB?.name || 'Indore Kings',
                newRuns: 0,
                newBalls: 0,
                newWickets: bowlerWkts,
                isMvp: isBowlerMvp,
                verificationTier: 'Tier 2',
                role: 'Bowler'
            })
        }

        const updatedMatches = matches.map(m => {
            if (m.id === match.id) {
                return {
                    ...m,
                    status: 'Certified & Completed',
                    statusColor: 'emerald',
                    teamA: { ...m.teamA, score: currentScore.runs, wickets: currentScore.wickets },
                    mvp: currentScore.mvpPlayer,
                    paymentStatus: 'Payment Received'
                }
            }
            return m
        })
        setMatches(updatedMatches)
        setScoringMatch(null)

        if (addToast) {
            addToast(`🎉 Match Certified! ${batsmanName} (${batsmanRuns} Runs) pushed to TOP of Leaderboard with 1.5x Points!`, 'success')
        }
    }

    // Open Toss Ceremony Modal for Match
    const handleStartToss = (match) => {
        setTossMatch(match)
        setTossDecision({
            winnerTeam: match.teamA?.name || '',
            electedTo: 'bat',
            tossMode: 'system',
            callingTeam: match.teamA?.name || '',
            callingCall: 'HEADS',
            coinFlipping: false,
            coinResult: null
        })
    }

    // Flip Coin Simulation (System Toss Mode)
    const handleFlipCoin = () => {
        setTossDecision(prev => ({ ...prev, coinFlipping: true, coinResult: null }))
        setTimeout(() => {
            const result = Math.random() > 0.5 ? 'HEADS' : 'TAILS'
            const caller = tossDecision.callingTeam || tossMatch?.teamA?.name || ''
            const call = tossDecision.callingCall || 'HEADS'
            const isCallerWinner = call === result
            const winner = isCallerWinner
                ? caller
                : (caller === tossMatch?.teamA?.name ? tossMatch?.teamB?.name : tossMatch?.teamA?.name)

            setTossDecision(prev => ({
                ...prev,
                coinFlipping: false,
                coinResult: result,
                winnerTeam: winner
            }))
            if (addToast) addToast(`🪙 Coin Result: ${result}! Toss won by ${winner}!`, 'info')
        }, 1000)
    }

    // Confirm Toss Decision & Launch Live Scoring Desk
    const handleConfirmTossAndStart = () => {
        if (!tossMatch) return
        const winner = tossDecision.winnerTeam || tossMatch.teamA?.name
        const isBatting = tossDecision.electedTo === 'bat'
        
        // Determine which team bats first
        const battingTeam = isBatting
            ? winner
            : (winner === tossMatch.teamA?.name ? tossMatch.teamB?.name : tossMatch.teamA?.name)
        
        const tossSummaryText = `${winner} won toss (${tossDecision.tossMode === 'system' ? 'System Coin' : 'Manual'}) & elected to ${isBatting ? 'Bat' : 'Bowl'} first`

        const updatedMatches = matches.map(m => {
            if (m.id === tossMatch.id) {
                return {
                    ...m,
                    status: 'Live Now',
                    statusColor: 'emerald',
                    tossSummary: tossSummaryText,
                    striker: `${battingTeam} Batting (0/0)`
                }
            }
            return m
        })
        setMatches(updatedMatches)

        setScoringMatch({
            ...tossMatch,
            status: 'Live Now',
            tossSummary: tossSummaryText
        })

        setCurrentScore({
            runs: 0,
            wickets: 0,
            overs: 0.0,
            ballsThisOver: [],
            selectedInnings: battingTeam,
            mvpPlayer: tossMatch.teamA?.captain || '',
            matchNotes: `Official Toss: ${tossSummaryText}. Certified by ${myUmpireName}.`
        })

        setTossMatch(null)
        if (addToast) {
            addToast(`🏏 Toss Done! ${tossSummaryText}. Match is now LIVE!`, 'success')
        }
    }

    // Confirm Payment Received on Ground via QR Code & Generate Receipt
    const handleConfirmPayment = (match) => {
        if (!match) return
        const receiptNo = `REC-UMP-${Math.floor(10000 + Math.random() * 90000)}`
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const updatedMatches = matches.map(m => {
            if (m.id === match.id) {
                return {
                    ...m,
                    paymentStatus: 'Payment Received',
                    receiptNo: receiptNo,
                    paidAt: timestamp
                }
            }
            return m
        })
        setMatches(updatedMatches)

        // Also update match history if it exists
        const updatedHistory = matchHistory.map(h => {
            if (h.id === match.id || h.matchTitle === match.title) {
                return {
                    ...h,
                    payment: `✓ ₹${match.umpireFee || 300} Received on Personal QR (${myUpiId})`
                }
            }
            return h
        })
        setMatchHistory(updatedHistory)

        setQrModalMatch(null)
        setReceiptModalMatch({
            ...match,
            receiptNo,
            paidAt: timestamp,
            paymentStatus: 'Payment Received'
        })
        if (addToast) {
            addToast(`✅ ₹${match.umpireFee || 300} Payment Marked as Received! Receipt Generated: ${receiptNo}`, 'success')
        }
    }

    // Handle Custom QR Image File Upload
    const handleQrUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            if (addToast) addToast('Please upload an image under 5MB', 'error')
            return
        }
        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result
            setCustomQrImage(base64)
            setQrMode('custom')
            if (addToast) addToast('✅ Custom QR Code Scanner Photo Uploaded Successfully!', 'success')
        }
        reader.readAsDataURL(file)
    }

    // Generate Dynamic UPI QR Code Image URL
    const getUpiQrUrl = (amount = 300) => {
        const upiString = `upi://pay?pa=${encodeURIComponent(myUpiId)}&pn=${encodeURIComponent(myUmpireName)}&am=${amount}&cu=INR&tn=Umpire%20Duty%20Fee`
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&color=0f172a&bgcolor=ffffff`
    }

    // Get the actual QR image (uploaded photo or auto-generated)
    const getDisplayQrImage = (amount = 300) => {
        if (qrMode === 'custom' && customQrImage) {
            return customQrImage
        }
        return getUpiQrUrl(amount)
    }

    // Save or Add Ground Match & Captain Details
    const handleSaveCaptainsMatch = (formData) => {
        if (formData.isNew) {
            const newMatch = {
                id: `MTC-IND-${Math.floor(900 + Math.random() * 99)}`,
                title: `${formData.teamAName || 'Team A'} vs ${formData.teamBName || 'Team B'}`,
                turf: formData.turf || 'Spike Cricket Turf',
                turfLocation: formData.turfLocation || 'Bhawarkua, Indore',
                date: formData.date || 'Today',
                time: formData.time || '8:00 PM – 9:00 PM',
                slotId: '20:00',
                matchType: formData.matchType || 'Dare Match™',
                modeBadge: formData.modeBadge || '🔥 DARE MATCH',
                hasUmpireRequested: true,
                status: 'Upcoming',
                statusColor: 'blue',
                umpireFee: 300,
                umpireName: `${myUmpireName} (LIC: UMP-IND-409)`,
                paymentStatus: 'QR Payment Pending',
                teamA: {
                    name: formData.teamAName || 'Team A',
                    captain: formData.teamACaptain || 'Captain A',
                    phone: formData.teamAPhone || '+91 98765 00001',
                    score: 0,
                    wickets: 0,
                    overs: '0.0'
                },
                teamB: {
                    name: formData.teamBName || 'Team B',
                    captain: formData.teamBCaptain || 'Captain B',
                    phone: formData.teamBPhone || '+91 98765 00002',
                    score: 0,
                    wickets: 0,
                    overs: '0.0'
                },
                target: 0,
                currentOverBalls: [],
                striker: 'Toss Pending',
                nonStriker: '',
                bowler: '',
                multiplier: '1.5x Umpire Verified'
            }
            setMatches([newMatch, ...matches])
            if (addToast) addToast(`🏏 New Match "${newMatch.title}" Registered on Ground!`, 'success')
        } else {
            const updated = matches.map(m => {
                if (m.id === formData.id) {
                    return {
                        ...m,
                        title: `${formData.teamAName} vs ${formData.teamBName}`,
                        turf: formData.turf,
                        turfLocation: formData.turfLocation,
                        teamA: {
                            ...m.teamA,
                            name: formData.teamAName,
                            captain: formData.teamACaptain,
                            phone: formData.teamAPhone
                        },
                        teamB: {
                            ...m.teamB,
                            name: formData.teamBName,
                            captain: formData.teamBCaptain,
                            phone: formData.teamBPhone
                        }
                    }
                }
                return m
            })
            setMatches(updated)
            if (addToast) addToast(`✓ Captain details updated for ${formData.title || 'Match'}!`, 'success')
        }
        setEditingCaptainsMatch(null)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#111827] pb-24 animate-in fade-in duration-300">
            {/* ═══════════════════════════════════════════════════
                TOP OFFICIAL UMPIRE BADGE HEADER BAR
            ═══════════════════════════════════════════════════ */}
            <div className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-6 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    {/* Umpire Profile & Credentials */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/30 shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {myUmpireName}
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider font-mono">
                                    LIC: UMP-IND-409
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                                    ✓ BCCI / Turf Certified Level-2
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                <span>🏟️ Officiating At: <strong className="text-slate-200 font-bold">Spike Turf & Royal Ground (Indore)</strong></span>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono font-bold">QR: {myUpiId}</span>
                            </p>
                        </div>
                    </div>

                    {/* Header Action Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                        {/* Show QR Code Fast Button */}
                        <button
                            type="button"
                            onClick={() => setQrModalMatch({ title: 'Direct Match Fee', umpireFee: 300, turf: 'Ground Match' })}
                            className="px-4 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105"
                        >
                            <HiQrcode className="w-4 h-4 text-slate-950" />
                            <span>Show My Payment QR (₹300)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOnDuty(!isOnDuty)
                                if (addToast) addToast(isOnDuty ? 'Duty Status: Off Duty' : 'Duty Status: On Duty (Accepting Match Scoring)', 'info')
                            }}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                                isOnDuty 
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-white animate-pulse' : 'bg-red-400'}`}></span>
                            <span>{isOnDuty ? '🟢 ON DUTY' : '🔴 OFF DUTY'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/leaderboard')}
                            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <span>👑</span>
                            <span>Leaderboard</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (logout) logout()
                                navigate('/login')
                                if (addToast) addToast('Logged out of Umpire Portal', 'info')
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-black text-xs border border-red-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                            title="Sign out of Umpire Portal"
                        >
                            <HiLogout className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                KEY OVERVIEW SUMMARY CARDS
            ═══════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Stat 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Assigned Today</span>
                            <div className="text-2xl font-black text-[#111827] mt-0.5">3 Matches</div>
                            <span className="text-[11px] font-bold text-emerald-600">Umpire Service Requested</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center font-black">
                            🏏
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Matches Officiated</span>
                            <div className="text-2xl font-black text-[#111827] mt-0.5">{matchHistory.length} Matches</div>
                            <span className="text-[11px] font-bold text-blue-600">Scorecards Certified Live</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 text-2xl flex items-center justify-center font-black">
                            ⚖️
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Payment Mode</span>
                            <div className="text-lg font-black text-purple-700 truncate max-w-[140px] mt-0.5">Direct UPI QR</div>
                            <span className="text-[10px] font-mono text-slate-500 truncate block">{myUpiId}</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 text-2xl flex items-center justify-center font-black">
                            📱
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Leaderboard Weight</span>
                            <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">1.5x Points</div>
                            <span className="text-[11px] font-bold text-amber-700">Official Sign-Off Tier</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 text-2xl flex items-center justify-center font-black">
                            ⭐
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════
                    MAIN NAVIGATION TABS
                ═══════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] mt-8 pb-3 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'duty', label: '⚡ Live Duty & Assigned Matches (3)', icon: '🏏' },
                        { id: 'history', label: '📜 Match History & Officiated Log (Kaunsa Match Kisne Kiya)', icon: '⚖️' },
                        { id: 'qr', label: '📱 My UPI Payment QR Code', icon: '💳' },
                        { id: 'rules', label: '📖 Box Cricket Umpiring Rules', icon: '📜' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-[#111827] text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:text-[#111827] border border-[#E5E7EB]'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════════════
                    TAB 1: LIVE DUTY & ASSIGNED MATCHES
                ═══════════════════════════════════════════════════ */}
                {activeTab === 'duty' && (
                    <div className="mt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-black text-[#111827] uppercase tracking-tight flex items-center gap-2">
                                    <span>🏏</span> Matches Where Umpire Was Booked By Captains
                                </h2>
                                <p className="text-xs text-slate-500 font-semibold">Official referee live duty queue for verified Indore box cricket matches.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditingCaptainsMatch({
                                        isNew: true,
                                        title: '',
                                        turf: 'Spike Cricket Turf',
                                        turfLocation: 'Bhawarkua, Indore',
                                        time: '8:00 PM – 9:00 PM',
                                        date: 'Today',
                                        matchType: 'Dare Match™ (Loser Pays All)',
                                        modeBadge: '🔥 DARE MATCH',
                                        umpireFee: 300,
                                        teamAName: '',
                                        teamACaptain: '',
                                        teamAPhone: '',
                                        teamBName: '',
                                        teamBCaptain: '',
                                        teamBPhone: ''
                                    })}
                                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105"
                                >
                                    <span>➕</span>
                                    <span>Register Ground Match & Captains</span>
                                </button>
                                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                    🟢 Assigned to {myUmpireName}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {matches.map((match) => (
                                <div
                                    key={match.id}
                                    className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition-all shadow-sm ${
                                        match.status === 'Live Now'
                                            ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-md'
                                            : 'border-[#E5E7EB] hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    match.status === 'Live Now'
                                                        ? 'bg-emerald-500 text-white animate-pulse'
                                                        : match.status === 'Certified & Completed'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                                                }`}>
                                                    {match.status}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-black text-[10px] uppercase tracking-wider border border-orange-200">
                                                    {match.modeBadge}
                                                </span>

                                                {/* Status / Payment Badge: Don't show payment pending for upcoming matches */}
                                                {match.status === 'Upcoming' ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[10px] uppercase tracking-wider">
                                                        🕒 Starts at {match.time?.split('–')?.[0]?.trim() || match.time}
                                                    </span>
                                                ) : (match.paymentStatus === 'Payment Received' || match.paymentStatus === 'QR Paid on Ground') ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] uppercase tracking-wider">
                                                        ✓ Received (₹{match.umpireFee || 300})
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] uppercase tracking-wider">
                                                        ⏳ Payment Pending (₹{match.umpireFee || 300})
                                                    </span>
                                                )}

                                                <span className="text-xs font-mono font-bold text-slate-400">
                                                    ID: {match.id}
                                                </span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-black text-[#111827]">
                                                {match.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-2">
                                                <span>🏟️ {match.turf} ({match.turfLocation})</span>
                                                <span>•</span>
                                                <span>🕒 {match.time} ({match.date})</span>
                                                <span>•</span>
                                                <span className="text-emerald-700 font-bold">Duty Fee: ₹{match.umpireFee || 300}</span>
                                            </p>
                                            {match.tossSummary && (
                                                <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 mt-1">
                                                    <span>🪙</span>
                                                    <span>{match.tossSummary}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons for Umpire */}
                                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                                            {/* UPCOMING MATCH: Conduct Toss & Start Match */}
                                            {match.status === 'Upcoming' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartToss(match)}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-2"
                                                >
                                                    <span>🪙</span>
                                                    <span>Conduct Toss & Start</span>
                                                </button>
                                            )}

                                            {/* LIVE MATCH: Open Live Scoring Desk */}
                                            {match.status === 'Live Now' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setScoringMatch(match)
                                                        setCurrentScore(prev => ({
                                                            ...prev,
                                                            runs: match.teamA?.score || 0,
                                                            wickets: match.teamA?.wickets || 0,
                                                            overs: parseFloat(match.teamA?.overs) || 0.0,
                                                            ballsThisOver: match.currentOverBalls || [],
                                                            selectedInnings: match.teamA?.name || 'Team A',
                                                            topBatsman: match.teamA?.captain || 'Rahul Sharma',
                                                            topBowler: match.teamB?.captain || 'Aman Verma',
                                                            mvpPlayer: match.teamA?.captain || 'Rahul Sharma',
                                                            mvpPhone: match.teamA?.phone || '+91 98765 43210',
                                                            matchNotes: 'Official match certified by licensed referee.'
                                                        }))
                                                    }}
                                                    className="px-5 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-[#111827] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-2"
                                                >
                                                    <span>⚡</span>
                                                    <span>Open Live Scoring Desk</span>
                                                </button>
                                            )}

                                            {/* COMPLETED MATCH: View Official Scorecard */}
                                            {match.status === 'Certified & Completed' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setScoringMatch(match)
                                                    }}
                                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <span>📜</span>
                                                    <span>View Scorecard</span>
                                                </button>
                                            )}

                                            {/* PAYMENT BUTTON: Only shown when Match is Live or Completed (Never on Upcoming!) */}
                                            {match.status !== 'Upcoming' && (
                                                (match.paymentStatus === 'Payment Received' || match.paymentStatus === 'QR Paid on Ground') ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setQrModalMatch(match)}
                                                        className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-400 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                                    >
                                                        <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                                                        <span>✓ Payment Received (₹{match.umpireFee || 300})</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setQrModalMatch(match)}
                                                        className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <HiQrcode className="w-4 h-4 text-purple-700" />
                                                        <span>Show QR (₹{match.umpireFee || 300})</span>
                                                    </button>
                                                )
                                            )}

                                            {/* Edit Captains & Teams Button */}
                                            <button
                                                type="button"
                                                onClick={() => setEditingCaptainsMatch({
                                                    isNew: false,
                                                    id: match.id,
                                                    title: match.title,
                                                    turf: match.turf,
                                                    turfLocation: match.turfLocation,
                                                    teamAName: match.teamA?.name || '',
                                                    teamACaptain: match.teamA?.captain || '',
                                                    teamAPhone: match.teamA?.phone || '',
                                                    teamBName: match.teamB?.name || '',
                                                    teamBCaptain: match.teamB?.captain || '',
                                                    teamBPhone: match.teamB?.phone || ''
                                                })}
                                                className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                title="Edit Team & Captain Contact Details"
                                            >
                                                <span>✏️</span>
                                                <span>Edit Captains</span>
                                            </button>

                                            {/* WhatsApp Captains */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.open(`https://wa.me/919876543210?text=Hello%20Captain%2C%20this%20is%20${encodeURIComponent(myUmpireName)}%20(Official%20Umpire)%20for%20your%20match%20at%20${encodeURIComponent(match.turf)}.%20Please%20report%20for%20toss!`)
                                                }}
                                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <span>💬</span>
                                                <span>Call Captains</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Teams Box */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 block">Team 1 (Batting First)</span>
                                                <h4 className="text-sm font-black text-[#111827]">{match.teamA?.name}</h4>
                                                <span className="text-xs text-slate-600 font-bold block mt-0.5">
                                                    👤 Capt: {match.teamA?.captain || 'Not Set'} · 📞 {match.teamA?.phone || 'No phone'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-[#111827] font-mono">
                                                    {match.teamA?.score}/{match.teamA?.wickets}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 font-mono">({match.teamA?.overs} ov)</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 block">Team 2 (Chasing / Bowling)</span>
                                                <h4 className="text-sm font-black text-[#111827]">{match.teamB?.name}</h4>
                                                <span className="text-xs text-slate-600 font-bold block mt-0.5">
                                                    👤 Capt: {match.teamB?.captain || 'Not Set'} · 📞 {match.teamB?.phone || 'No phone'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-[#111827] font-mono">
                                                    {match.target > 0 ? `Target: ${match.target}` : 'Awaiting 2nd Innings'}
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 font-mono">Need {(match.target - match.teamB?.score) || 0} runs</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    TAB 2: OFFICIATED MATCHES RECORD (KAUNSA MATCH KISNE KIYA)
                ═══════════════════════════════════════════════════ */}
                {activeTab === 'history' && (
                    <div className="mt-6 bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                                    <span>📜</span> Match Officiating Logbook (Kaunsa Match Kisne Conduct Kiya)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Official record of all verified turf matches with referee names, winner scores, and direct QR payment status.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                                {matchHistory.length} Matches Recorded
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {matchHistory.map((rec) => (
                                <div key={rec.id} className="py-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">{rec.id}</span>
                                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">{rec.verifiedTier}</span>
                                            <span className="text-xs text-slate-500 font-bold">🕒 {rec.date} ({rec.time})</span>
                                        </div>

                                        <h4 className="font-black text-base text-[#111827]">{rec.matchTitle}</h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span>🏟️ Ground:</span>
                                                <strong className="text-slate-900 font-bold">{rec.turf}</strong>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>⚖️ Officiated By:</span>
                                                <strong className="text-amber-800 font-black">{rec.officiatedBy}</strong>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>🏆 Match Result:</span>
                                                <strong className="text-emerald-700 font-bold">{rec.result}</strong>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>⭐ Man of Match:</span>
                                                <strong className="text-[#111827] font-bold">{rec.mvp}</strong>
                                            </div>
                                        </div>

                                        <div className="pt-1 text-xs font-bold text-purple-700">
                                            {rec.payment}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (addToast) addToast(`Official Match Certificate for ${rec.id} downloaded!`, 'success')
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <span>📥</span>
                                            <span>Certificate PDF</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    TAB 3: MY UPI PAYMENT QR CODE SETTINGS
                ═══════════════════════════════════════════════════ */}
                {activeTab === 'qr' && (
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Visual UPI QR Standee Card */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                <span>●</span> {qrMode === 'custom' && customQrImage ? '🖼️ Uploaded QR Scanner Active' : '⚡ Direct UPI QR Code'}
                            </div>
                            
                            <h3 className="text-lg font-black text-white">{myUmpireName}</h3>
                            <p className="text-xs text-slate-300 font-mono font-bold bg-white/10 py-1 px-3 rounded-lg inline-block">{myUpiId}</p>

                            {/* Generated or Uploaded QR Code */}
                            <div className="bg-white p-4 rounded-2xl shadow-inner inline-block mx-auto">
                                <img
                                    src={getDisplayQrImage(300)}
                                    alt="UPI QR Code"
                                    className="w-48 h-48 mx-auto object-contain rounded-lg"
                                />
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQrMode('upi')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                        qrMode === 'upi'
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'bg-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    ⚡ UPI QR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQrMode('custom')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                        qrMode === 'custom'
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'bg-white/10 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    🖼️ Uploaded Photo
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-300 font-medium">
                                Captains can scan using PhonePe, Google Pay, Paytm, or any BHIM UPI App on the ground.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    if (addToast) addToast(`QR Code Standee image ready for ${myUpiId}!`, 'success')
                                }}
                                className="w-full py-3 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                            >
                                📥 Save / Download QR Standee
                            </button>
                        </div>

                        {/* UPI & Photo Upload Configuration Form */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-base font-black text-[#111827]">
                                    📱 Personal QR Code & Scanner Setup
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Aap apna real PhonePe / GPay / Paytm scanner photo upload kar sakte hain, ya apna UPI ID enter karke auto-QR bana sakte hain!
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Option 1: Upload QR Photo */}
                                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🖼️</span>
                                            <div>
                                                <h4 className="text-xs font-black text-[#111827] uppercase">Upload Your Scanner QR Photo / Screenshot</h4>
                                                <span className="text-[11px] text-slate-500 font-semibold">PhonePe, Google Pay, Paytm standee photo (JPG/PNG)</span>
                                            </div>
                                        </div>
                                        <label
                                            htmlFor="qr-file-upload"
                                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all hover:scale-105"
                                        >
                                            {customQrImage ? '🔄 Change Photo' : '📁 Upload Photo'}
                                        </label>
                                        <input
                                            id="qr-file-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleQrUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    {customQrImage && (
                                        <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl">
                                            <div className="flex items-center gap-2.5">
                                                <img src={customQrImage} alt="QR Thumbnail" className="w-10 h-10 object-contain rounded-lg border border-slate-200" />
                                                <div>
                                                    <span className="text-xs font-black text-emerald-900 block">✓ Custom QR Photo Uploaded</span>
                                                    <span className="text-[10px] text-slate-500 font-semibold">Active for captain scanner</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomQrImage(null)
                                                    setQrMode('upi')
                                                    localStorage.removeItem('umpire_custom_qr_img')
                                                    if (addToast) addToast('Custom QR photo removed, switched back to UPI ID QR', 'info')
                                                }}
                                                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 font-bold rounded-lg cursor-pointer"
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Option 2: UPI ID Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Umpire Full Name</label>
                                        <input
                                            type="text"
                                            value={myUmpireName}
                                            onChange={e => setMyUmpireName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Your Personal UPI ID (VPA) *</label>
                                        <input
                                            type="text"
                                            value={myUpiId}
                                            onChange={e => setMyUpiId(e.target.value)}
                                            placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#111827] outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5 text-emerald-950">
                                    <span className="font-black block">💡 How Direct QR Payment Works:</span>
                                    <p>1. Captain ground par match shuru hone se pehle aapka QR code scan karega.</p>
                                    <p>2. Paisa direct aapke bank me aayega.</p>
                                    <p>3. Match khatam hone par aap scorecard sign-off karke players ke 1.5x points Indore Leaderboard me rank kar denge!</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (addToast) addToast(`✓ QR Settings saved successfully!`, 'success')
                                    }}
                                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                                >
                                    Save QR Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    TAB 4: BOX CRICKET RULES & VAR HANDBOOK
                ═══════════════════════════════════════════════════ */}
                {activeTab === 'rules' && (
                    <div className="mt-6 bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                            <span>📖</span> Official Box Cricket Turf Umpiring Protocol (Indore League)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <h4 className="font-black text-[#111827] text-sm">1. Direct Net Touch & Catch Out Rule</h4>
                                <p>Agar ball roof net ko chhue bina boundary side net me direct hit kare bina bounce ke, toh 4 runs hain. Agar fielder direct catch pakad le roof net touch ke baad, toh batsman NOT OUT hai.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <h4 className="font-black text-[#111827] text-sm">2. No-Ball Height & Overstep</h4>
                                <p>Full toss ball above waist height is strictly NO BALL (+1 run & Free Hit). Bowler ka pair popping crease ke bahar nikalne par umpire whistle bajakar NO BALL signal karega.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <h4 className="font-black text-[#111827] text-sm">3. 1.5x Rating Certification</h4>
                                <p>Umpire dwara certify kiye gaye match ke sabhi runs aur wickets par Indore Leaderboard me automated 1.5x multiplier milta hai. Score submit karte waqt MVP Player award karna zaroori hai.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                <h4 className="font-black text-[#111827] text-sm">4. Dare Match™ Tie-Breaker (Super Over)</h4>
                                <p>Agar Dare Match tie hota hai, toh 1-Over Super Over hoga. Winner team ka slot rent ₹0 ho jayega aur Loser Team turf owner ko full bill pay karegi.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════
                🪙 OFFICIAL TOSS CEREMONY MODAL (System Flip & Manual Toggle)
            ═══════════════════════════════════════════════════ */}
            {tossMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 my-auto max-h-[95vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 text-2xl flex items-center justify-center font-black shrink-0 border border-amber-300 shadow-xs">
                                    🪙
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-[#111827]">
                                        Official Match Toss Ceremony
                                    </h3>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        Referee: {myUmpireName} (LIC: UMP-IND-409)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTossMatch(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Match Details Banner */}
                        <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1">
                            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                                {tossMatch.modeBadge || 'OFFICIAL MATCH'} · {tossMatch.turf}
                            </div>
                            <div className="text-sm font-black flex items-center justify-between">
                                <span>{tossMatch.teamA?.name}</span>
                                <span className="text-slate-400 text-xs">vs</span>
                                <span>{tossMatch.teamB?.name}</span>
                            </div>
                        </div>

                        {/* TOSS METHOD SELECTOR TOGGLE (System Flip vs Manual Toss) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                                Choose Toss Mode:
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, tossMode: 'system' }))}
                                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                        tossDecision.tossMode === 'system'
                                            ? 'bg-white text-amber-900 shadow-sm border border-amber-300 font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span>🪙 System Coin Toss (Digital Flip)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, tossMode: 'manual' }))}
                                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                        tossDecision.tossMode === 'manual'
                                            ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300 font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span>✋ Manual Toss (On-Field Coin)</span>
                                </button>
                            </div>
                        </div>

                        {/* MODE A: SYSTEM DIGITAL COIN TOSS */}
                        {tossDecision.tossMode === 'system' ? (
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300/80 rounded-2xl p-4 text-center space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-left bg-white p-3 rounded-xl border border-amber-200 gap-2">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 block">Calling Captain & Call</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <select
                                                value={tossDecision.callingTeam}
                                                onChange={e => setTossDecision(prev => ({ ...prev, callingTeam: e.target.value }))}
                                                className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-black px-2.5 py-1 text-slate-900 outline-none"
                                            >
                                                <option value={tossMatch.teamA?.name}>{tossMatch.teamA?.name}</option>
                                                <option value={tossMatch.teamB?.name}>{tossMatch.teamB?.name}</option>
                                            </select>
                                            <select
                                                value={tossDecision.callingCall}
                                                onChange={e => setTossDecision(prev => ({ ...prev, callingCall: e.target.value }))}
                                                className="bg-amber-100 border border-amber-300 rounded-lg text-xs font-mono font-black px-2.5 py-1 text-amber-950 outline-none"
                                            >
                                                <option value="HEADS">HEADS</option>
                                                <option value="TAILS">TAILS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={tossDecision.coinFlipping}
                                        onClick={handleFlipCoin}
                                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto"
                                    >
                                        {tossDecision.coinFlipping ? 'Flipping...' : '🪙 Spin Coin'}
                                    </button>
                                </div>

                                {/* Animated Coin Display */}
                                <div className="flex items-center justify-center gap-3">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 shadow-lg border-2 border-amber-300 flex items-center justify-center text-3xl font-black text-slate-950 transition-transform ${
                                        tossDecision.coinFlipping ? 'animate-spin' : ''
                                    }`}>
                                        🪙
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                                            System Coin Toss Result
                                        </span>
                                        <div className="text-base font-black text-[#111827]">
                                            {tossDecision.coinFlipping 
                                                ? 'Spinning Coin in Air...' 
                                                : tossDecision.coinResult 
                                                ? `Landed on: ${tossDecision.coinResult}!` 
                                                : 'Ready for Flip'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* MODE B: MANUAL ON-FIELD TOSS */
                            <div className="bg-emerald-50/60 border-2 border-emerald-300/80 rounded-2xl p-4 space-y-2">
                                <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>✋</span> Manual On-Field Coin Toss Selection
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium">
                                    If coin was flipped on the ground by captain, select the verified winner team and decision below:
                                </p>
                            </div>
                        )}

                        {/* Step 1: Who won the toss? */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                                <span>1️⃣ Which Team Won The Toss?</span>
                                <span className="text-[11px] text-emerald-700 font-bold">Toss Winner</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Team A Option */}
                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, winnerTeam: tossMatch.teamA?.name }))}
                                    className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                                        (tossDecision.winnerTeam === tossMatch.teamA?.name || !tossDecision.winnerTeam)
                                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Team A</span>
                                        {(tossDecision.winnerTeam === tossMatch.teamA?.name || !tossDecision.winnerTeam) && (
                                            <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                                        )}
                                    </div>
                                    <div className="font-black text-xs text-[#111827] mt-0.5 truncate">
                                        {tossMatch.teamA?.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-semibold truncate">
                                        Capt: {tossMatch.teamA?.captain}
                                    </div>
                                </button>

                                {/* Team B Option */}
                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, winnerTeam: tossMatch.teamB?.name }))}
                                    className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                                        tossDecision.winnerTeam === tossMatch.teamB?.name
                                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Team B</span>
                                        {tossDecision.winnerTeam === tossMatch.teamB?.name && (
                                            <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                                        )}
                                    </div>
                                    <div className="font-black text-xs text-[#111827] mt-0.5 truncate">
                                        {tossMatch.teamB?.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-semibold truncate">
                                        Capt: {tossMatch.teamB?.captain}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Toss winner elected to */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                                <span>2️⃣ Toss Winner Elected To?</span>
                                <span className="text-[11px] text-emerald-700 font-bold">Select Decision</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, electedTo: 'bat' }))}
                                    className={`p-3.5 rounded-2xl text-center border-2 transition-all cursor-pointer font-black text-xs flex items-center justify-center gap-2 ${
                                        tossDecision.electedTo === 'bat'
                                            ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-lg">🏏</span>
                                    <span>BAT First</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTossDecision(prev => ({ ...prev, electedTo: 'bowl' }))}
                                    className={`p-3.5 rounded-2xl text-center border-2 transition-all cursor-pointer font-black text-xs flex items-center justify-center gap-2 ${
                                        tossDecision.electedTo === 'bowl'
                                            ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/20'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-lg">⚾</span>
                                    <span>BOWL First (Field)</span>
                                </button>
                            </div>
                        </div>

                        {/* Live Toss Decision Summary Callout */}
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2.5 shadow-2xs">
                            <span className="text-xl">📢</span>
                            <div>
                                <strong>{tossDecision.winnerTeam || tossMatch.teamA?.name}</strong> won the toss ({tossDecision.tossMode === 'system' ? 'System Coin' : 'Manual'}) and elected to <strong className="uppercase underline text-emerald-900">{tossDecision.electedTo === 'bat' ? 'BAT' : 'BOWL'}</strong> first!
                            </div>
                        </div>

                        {/* Confirm & Start Match Button */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setTossMatch(null)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmTossAndStart}
                                className="px-6 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span>🏏</span>
                                <span>Confirm Toss & Start Live Game</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                📱 QUICK POPUP: SHOW PAYMENT QR CODE TO CAPTAINS
            ═══════════════════════════════════════════════════ */}
            {qrModalMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Direct Umpire Payment</span>
                            <button
                                type="button"
                                onClick={() => setQrModalMatch(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h4 className="font-black text-lg text-[#111827]">{myUmpireName}</h4>
                            <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                                {myUpiId}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-sm">
                            <img
                                src={getDisplayQrImage(qrModalMatch.umpireFee || 300)}
                                alt="UPI QR"
                                className="w-56 h-56 mx-auto object-contain rounded-lg"
                            />
                        </div>

                        <div className="text-xs space-y-1 font-semibold text-slate-600">
                            <div className="text-xl font-black text-[#111827]">
                                Amount: ₹{qrModalMatch.umpireFee || 300}
                            </div>
                            <p className="text-[11px] text-slate-500">Scan using PhonePe, Google Pay, Paytm or any UPI App</p>
                        </div>

                        {qrModalMatch.paymentStatus === 'Payment Received' || qrModalMatch.paymentStatus === 'QR Paid on Ground' ? (
                            <div className="space-y-2 pt-1">
                                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs">
                                    <HiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>✓ ₹{qrModalMatch.umpireFee || 300} Payment Received!</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQrModalMatch(null)
                                        setReceiptModalMatch(qrModalMatch)
                                    }}
                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>🧾</span>
                                    <span>View Official Payment Receipt</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleConfirmPayment(qrModalMatch)}
                                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <HiCheck className="w-5 h-5" />
                                <span>✓ Mark Payment as Received (₹{qrModalMatch.umpireFee || 300})</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                🧾 OFFICIAL UMPIRE PAYMENT RECEIPT MODAL
            ═══════════════════════════════════════════════════ */}
            {receiptModalMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                                <span>🧾</span> OFFICIAL DUTY PAYMENT RECEIPT
                            </span>
                            <button
                                type="button"
                                onClick={() => setReceiptModalMatch(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-2 text-left">
                            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Receipt No:</span>
                                <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                                    {receiptModalMatch.receiptNo || 'REC-UMP-9842'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Match:</span>
                                <span className="font-bold text-slate-900 truncate max-w-[200px]">{receiptModalMatch.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Turf Venue:</span>
                                <span className="font-bold text-slate-900">{receiptModalMatch.turf}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Captain / Payer:</span>
                                <span className="font-bold text-slate-900">{receiptModalMatch.teamA?.captain || 'Team Captain'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Umpire Fee:</span>
                                <span className="font-mono font-black text-base text-emerald-700">₹{receiptModalMatch.umpireFee || 300}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200">
                                <span className="font-semibold text-slate-600">Status:</span>
                                <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded uppercase tracking-wider">
                                    ✓ PAID & VERIFIED
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    window.print()
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <HiDownload className="w-4 h-4" />
                                <span>Print Receipt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReceiptModalMatch(null)}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                            >
                                ✓ Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                ✏️ MODAL: REGISTER / EDIT GROUND MATCH & CAPTAINS
            ═══════════════════════════════════════════════════ */}
            {editingCaptainsMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-auto max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">📝</span>
                                <div>
                                    <h3 className="font-black text-base text-[#111827]">
                                        {editingCaptainsMatch.isNew ? '➕ Register New Match on Ground' : '✏️ Edit Captains & Teams'}
                                    </h3>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        Enter Team Captain names and contact numbers for official leaderboard records.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingCaptainsMatch(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveCaptainsMatch(editingCaptainsMatch)
                            }}
                            className="space-y-4"
                        >
                            {/* Turf & Ground Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Turf Name</label>
                                    <input
                                        type="text"
                                        value={editingCaptainsMatch.turf || ''}
                                        onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, turf: e.target.value }))}
                                        placeholder="e.g. Spike Cricket Turf"
                                        required
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Location / Area</label>
                                    <input
                                        type="text"
                                        value={editingCaptainsMatch.turfLocation || ''}
                                        onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, turfLocation: e.target.value }))}
                                        placeholder="e.g. Bhawarkua, Indore"
                                        required
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Team 1 Details */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                                    Team 1 (Batting / Home)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Team 1 Name *</label>
                                        <input
                                            type="text"
                                            value={editingCaptainsMatch.teamAName || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamAName: e.target.value }))}
                                            placeholder="e.g. Vijay Nagar Blasters"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Captain Name *</label>
                                        <input
                                            type="text"
                                            value={editingCaptainsMatch.teamACaptain || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamACaptain: e.target.value }))}
                                            placeholder="e.g. Rahul Sharma"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Captain Mobile *</label>
                                        <input
                                            type="tel"
                                            value={editingCaptainsMatch.teamAPhone || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamAPhone: e.target.value }))}
                                            placeholder="+91 98765 43210"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Team 2 Details */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full inline-block">
                                    Team 2 (Bowling / Away)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Team 2 Name *</label>
                                        <input
                                            type="text"
                                            value={editingCaptainsMatch.teamBName || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamBName: e.target.value }))}
                                            placeholder="e.g. Indore Super Kings"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Captain Name *</label>
                                        <input
                                            type="text"
                                            value={editingCaptainsMatch.teamBCaptain || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamBCaptain: e.target.value }))}
                                            placeholder="e.g. Aman Verma"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-700 mb-1">Captain Mobile *</label>
                                        <input
                                            type="tel"
                                            value={editingCaptainsMatch.teamBPhone || ''}
                                            onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, teamBPhone: e.target.value }))}
                                            placeholder="+91 98765 43211"
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#111827] outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingCaptainsMatch(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer"
                                >
                                    ✓ Save & Update Match
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                ⚡ LIVE MATCH SCORING DESK MODAL
            ═══════════════════════════════════════════════════ */}
            {scoringMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-auto max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                                        ● LIVE SCORING DESK
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-500">
                                        LIC: UMP-IND-409
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-[#111827] mt-1">
                                    {scoringMatch.title}
                                </h3>
                                <p className="text-xs text-slate-500 font-semibold">📍 {scoringMatch.turf} · Duty Fee: ₹{scoringMatch.umpireFee || 300}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScoringMatch(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Big Digital Score Display */}
                        <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                                    Batting: {currentScore.selectedInnings}
                                </span>
                                <div className="text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                                    <span>{currentScore.runs}/{currentScore.wickets}</span>
                                    <span className="text-lg text-slate-400 font-semibold">({currentScore.overs} Overs)</span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium mt-1 block">
                                    Target: {scoringMatch.target || 'Setting Target (1st Innings)'}
                                </span>
                            </div>

                            {/* Current Over Balls Timeline */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">This Over Balls</span>
                                <div className="flex items-center gap-1.5 justify-center">
                                    {currentScore.ballsThisOver.map((b, i) => (
                                        <span
                                            key={i}
                                            className={`w-7 h-7 rounded-full text-xs font-mono font-black flex items-center justify-center shadow-xs ${
                                                b === '4' ? 'bg-blue-600 text-white' :
                                                b === '6' ? 'bg-purple-600 text-white animate-bounce' :
                                                b === 'W' ? 'bg-red-600 text-white' :
                                                b === '0' ? 'bg-slate-800 text-slate-400' :
                                                'bg-slate-700 text-white'
                                            }`}
                                        >
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 1-Click Ball Input Keyboard */}
                        <div className="space-y-2">
                            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                                ⚡ Tap to Record Current Delivery:
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {['0', '1', '2', '3', '4', '6', 'W', 'WD'].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleAddBall(val)}
                                        className={`py-3 rounded-2xl font-black text-sm font-mono shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                                            val === '4' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                            val === '6' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                                            val === 'W' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                            val === 'WD' ? 'bg-amber-500 hover:bg-amber-600 text-black' :
                                            'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                        }`}
                                    >
                                        {val === 'W' ? 'OUT (W)' : val === 'WD' ? 'WIDE' : val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 🏏 Individual Top Batsman & Bowler Performance Entry for Leaderboard */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                                    <span>👑</span> Match Top Performers (Direct Indore Leaderboard Push)
                                </span>
                                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                                    1.5x Multiplier Rating
                                </span>
                            </div>

                            {/* Top Batsman */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">🏏 Top Batsman Name</label>
                                    <input
                                        type="text"
                                        value={currentScore.topBatsman || ''}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, topBatsman: e.target.value }))}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#111827]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Runs Scored</label>
                                    <input
                                        type="number"
                                        value={currentScore.batsmanRuns || 0}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, batsmanRuns: parseInt(e.target.value, 10) || 0 }))}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Balls Faced</label>
                                    <input
                                        type="number"
                                        value={currentScore.batsmanBalls || 0}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, batsmanBalls: parseInt(e.target.value, 10) || 0 }))}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                            </div>

                            {/* Top Bowler */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">🎯 Top Bowler Name</label>
                                    <input
                                        type="text"
                                        value={currentScore.topBowler || ''}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, topBowler: e.target.value }))}
                                        placeholder="e.g. Aman Verma"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#111827]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Wickets Taken</label>
                                    <input
                                        type="number"
                                        value={currentScore.bowlerWickets || 0}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, bowlerWickets: parseInt(e.target.value, 10) || 0 }))}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Runs Given</label>
                                    <input
                                        type="number"
                                        value={currentScore.bowlerRuns || 0}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, bowlerRuns: parseInt(e.target.value, 10) || 0 }))}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                            </div>

                            {/* Match MVP & Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">⭐ Match MVP (Star Player)</label>
                                    <input
                                        type="text"
                                        value={currentScore.mvpPlayer || ''}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, mvpPlayer: e.target.value }))}
                                        placeholder="Player Name"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#111827]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">MVP WhatsApp / Phone Number</label>
                                    <input
                                        type="tel"
                                        value={currentScore.mvpPhone || ''}
                                        onChange={e => setCurrentScore(prev => ({ ...prev, mvpPhone: e.target.value }))}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-[#111827]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sign Off & Complete Match Button */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setScoringMatch(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                                Keep Open
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSignAndCertifyMatch(scoringMatch)}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
                            >
                                <span>⚖️</span>
                                <span>Sign Off & Push to Leaderboard (1.5x)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

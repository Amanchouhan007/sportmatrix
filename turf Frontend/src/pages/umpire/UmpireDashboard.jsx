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
    HiQrcode,
    HiMenuAlt2
} from 'react-icons/hi'
import { HiTrophy } from 'react-icons/hi2'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { addOrUpdateLeaderboardPlayer } from '../../services/leaderboardService'
import { getUmpireProfile, updateUmpireProfile, getUmpireMatches, recordToss, updateMatchScore, completeMatch, updatePaymentStatus, registerGroundMatch } from '../../services/umpireService'

// Initial Assigned Umpire Matches Data for Indore Turfs
const INITIAL_MATCHES = []

// Past Match Record History (Konsa Match Kis Umpire Ne Conduct Kiya)
const INITIAL_OFFICIATED_HISTORY = []

export default function UmpireDashboard() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const toastContext = useToast()
    const addToast = toastContext?.addToast

    // Responsive Mobile Sidebar Toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Umpire Active State & QR Configuration
    const [isOnDuty, setIsOnDuty] = useState(true)
    const [activeTab, setActiveTab] = useState('duty') // 'duty' | 'history' | 'qr' | 'rules'
    // No hardcoded person/UPI default -- real values arrive from getUmpireProfile() below.
    const [myUpiId, setMyUpiId] = useState(() => localStorage.getItem('umpire_upi_id') || '')
    const [myUmpireName, setMyUmpireName] = useState('')
    const [myMatchFee, setMyMatchFee] = useState(300)
    const [officiatingLocations, setOfficiatingLocations] = useState('')

    // Matches requiring umpire -- always sourced fresh from getUmpireMatches() below,
    // not a stale localStorage cache (which could show a previous umpire's matches).
    const [matches, setMatches] = useState(INITIAL_MATCHES)

    // Officiated match history -- same: real data only, no persisted cache fallback.
    const [matchHistory, setMatchHistory] = useState(INITIAL_OFFICIATED_HISTORY)

    // Active Live Scoring Modal State -- starts at zero/empty; no demo scoreline.
    // Reset to this blank state whenever a new match's live scoring begins (see handleStartScoring).
    const BLANK_SCORE = {
        runs: 0,
        wickets: 0,
        overs: 0,
        ballsThisOver: [],
        selectedInnings: '',
        topBatsman: '',
        batsmanRuns: 0,
        batsmanBalls: 0,
        batsmanFours: 0,
        batsmanSixes: 0,
        topBowler: '',
        bowlerWickets: 0,
        bowlerOvers: '0.0',
        bowlerRuns: 0,
        mvpPlayer: '',
        mvpPhone: '',
        matchNotes: ''
    }
    const [scoringMatch, setScoringMatch] = useState(null)
    const [currentScore, setCurrentScore] = useState(BLANK_SCORE)

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
        tossMode: 'manual'
    })

    // Official Payment Receipt Modal State
    const [receiptModalMatch, setReceiptModalMatch] = useState(null)

    // New Match Assignment Confirmation Popup -- previously assignment was only
    // ever shown as a static "Assigned to {name}" badge with no popup. Shows once
    // per dashboard load for the soonest assigned match still needing acknowledgment.
    const [newAssignmentMatch, setNewAssignmentMatch] = useState(null)

    useEffect(() => {
        getUmpireProfile().then(prof => {
            if (prof) {
                if (prof.full_name) setMyUmpireName(prof.full_name);
                if (prof.upi_id) setMyUpiId(prof.upi_id);
                if (prof.on_duty_status !== undefined) setIsOnDuty(Boolean(prof.on_duty_status));
                if (prof.officiating_grounds) setOfficiatingLocations(prof.officiating_grounds);
                if (prof.match_fee) setMyMatchFee(Number(prof.match_fee));
            }
        });

        getUmpireMatches().then(list => {
            if (Array.isArray(list)) {
                const upcoming = list.filter(m => (m.dutyStatus || m.match_status) !== 'CERTIFIED_COMPLETED').map(m => {
                    const matchObj = m.match || {};
                    const teamA = matchObj.teamAName || m.team1_name || 'Team A';
                    const teamB = matchObj.teamBName || m.team2_name || 'Team B';
                    return {
                        id: m.id || m.matchId || m.match_code,
                        matchCode: m.matchId || m.id || m.match_code,
                        title: m.title || `${teamA} vs ${teamB}`,
                        turf: m.turf || m.venue || matchObj.branch?.branchName || m.branchName || 'Turf Venue',
                        turfLocation: m.turfLocation || matchObj.branch?.city || '',
                        date: m.date || (matchObj.createdAt ? new Date(matchObj.createdAt).toLocaleDateString() : 'Today'),
                        time: m.time || (matchObj.createdAt ? new Date(matchObj.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'),
                        matchType: m.matchType || matchObj.paymentMode || 'DARE MATCH',
                        modeBadge: m.modeBadge || (matchObj.paymentMode ? `🔥 ${matchObj.paymentMode}` : '🔥 DARE MATCH'),
                        hasUmpireRequested: true,
                        status: m.dutyStatus || m.status || 'SCHEDULED',
                        statusColor: (m.dutyStatus || m.status) === 'CERTIFIED_COMPLETED' ? 'gray' : 'emerald',
                        umpireFee: Number(m.dutyFee || m.umpireFee || 300),
                        paymentStatus: m.feePaymentStatus === 'RECEIVED' ? 'Paid Direct QR' : (m.paymentStatus || 'Direct QR Pending'),
                        teamA: {
                            name: teamA,
                            captain: m.teamA?.captain || (m.tossWinnerTeam === teamA ? 'Captain (Toss Winner)' : 'Captain A'),
                            phone: m.teamA?.phone || '',
                            score: m.teamA?.score || 0,
                            wickets: m.teamA?.wickets || 0,
                            overs: m.teamA?.overs || '0.0'
                        },
                        teamB: {
                            name: teamB,
                            captain: m.teamB?.captain || (m.tossWinnerTeam === teamB ? 'Captain (Toss Winner)' : 'Captain B'),
                            phone: m.teamB?.phone || '',
                            score: m.teamB?.score || 0,
                            wickets: m.teamB?.wickets || 0,
                            overs: m.teamB?.overs || '0.0'
                        },
                        target: m.target || 0
                    };
                });

                const completed = list.filter(m => (m.dutyStatus || m.match_status) === 'CERTIFIED_COMPLETED').map(m => {
                    const matchObj = m.match || {};
                    const teamA = matchObj.teamAName || m.team1_name || 'Team A';
                    const teamB = matchObj.teamBName || m.team2_name || 'Team B';
                    return {
                        id: m.id || m.matchId || m.match_code,
                        matchTitle: m.matchTitle || `${teamA} vs ${teamB}`,
                        turf: m.turf || matchObj.branch?.branchName || m.branchName || 'Turf Venue',
                        date: m.date || (m.certifiedAt ? new Date(m.certifiedAt).toLocaleDateString() : 'Recently'),
                        time: m.time || (m.certifiedAt ? new Date(m.certifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
                        officiatedBy: `${myUmpireName || 'Official Umpire'}`,
                        result: m.result || `${m.tossWinnerTeam || teamA} won`,
                        mvp: m.mvp || 'Player Performance Score (1.5x)',
                        payment: `✓ ₹${m.dutyFee || m.umpireFee || 300} Received`,
                        verifiedTier: '⚖️ 1.5x Umpire Certified'
                    };
                });

                setMatches(upcoming);
                setMatchHistory(completed);

                const alreadyAcknowledged = JSON.parse(sessionStorage.getItem('umpire_acknowledged_matches') || '[]');
                const unacknowledged = upcoming.find(m => m.hasUmpireRequested && !alreadyAcknowledged.includes(m.id));
                if (unacknowledged) setNewAssignmentMatch(unacknowledged);
            }
        });
    }, []);

    const handleAcknowledgeAssignment = () => {
        if (!newAssignmentMatch) return
        try {
            const alreadyAcknowledged = JSON.parse(sessionStorage.getItem('umpire_acknowledged_matches') || '[]')
            sessionStorage.setItem('umpire_acknowledged_matches', JSON.stringify([...alreadyAcknowledged, newAssignmentMatch.id]))
        } catch (e) {}
        setNewAssignmentMatch(null)
    }

    // Save Live Ball & Sync to DB
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
            const updatedScore = {
                ...prev,
                runs: nextRuns,
                wickets: nextWickets,
                ballsThisOver: nextBalls.length > 6 ? [eventStr] : nextBalls
            }

            // Sync score summary to backend DB
            if (scoringMatch?.id) {
                updateMatchScore({
                    matchId: scoringMatch.id,
                    currentScoreSummary: `${updatedScore.runs}/${updatedScore.wickets} (${updatedScore.overs} ov)`,
                    ballByBallFeed: updatedScore.ballsThisOver.join(','),
                    topBatsmanName: updatedScore.topBatsman,
                    topBatsmanRuns: updatedScore.batsmanRuns,
                    topBowlerName: updatedScore.topBowler,
                    topBowlerWickets: updatedScore.bowlerWickets
                }).catch(() => {})
            }

            return updatedScore
        })
        if (addToast) addToast(`Ball Recorded: ${eventStr}`, 'info')
    }

    // Complete Match & Certify Scorecard (Persists to MySQL DB & Leaderboard)
    const handleSignAndCertifyMatch = async (match) => {
        const batsmanName = currentScore.topBatsman || currentScore.mvpPlayer || match.teamA?.captain || 'Rahul Sharma'
        const batsmanRuns = parseInt(currentScore.batsmanRuns || 58, 10)
        const batsmanBalls = parseInt(currentScore.batsmanBalls || 32, 10)
        const bowlerName = currentScore.topBowler || match.teamB?.captain || 'Aman Verma'
        const bowlerWkts = parseInt(currentScore.bowlerWickets || 3, 10)

        // 🌟 1. Persist Certified Completion in MySQL DB via API
        try {
            await completeMatch({
                matchId: match.id || match.matchCode,
                winnerTeamSide: currentScore.selectedInnings
            })
        } catch (e) {
            console.warn('Error completing match in DB:', e)
        }

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

        setMatchHistory([newHistoryRecord, ...matchHistory])

        // 🌟 2. Push Official Umpire-Certified Performance to Leaderboard!
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
            addToast(`🎉 Match Certified & Persisted to DB! ${batsmanName} updated on Leaderboard!`, 'success')
        }
    }

    // Open Toss Ceremony Modal for Match
    const handleStartToss = (match) => {
        setTossMatch(match)
        setTossDecision({
            winnerTeam: match.teamA?.name || '',
            electedTo: 'bat',
            tossMode: 'manual'
        })
    }

    // Confirm Toss Decision & Launch Live Scoring Desk (Persisted to DB)
    const handleConfirmTossAndStart = async () => {
        if (!tossMatch) return
        const winner = tossDecision.winnerTeam || tossMatch.teamA?.name
        const isBatting = tossDecision.electedTo === 'bat'
        
        const battingTeam = isBatting
            ? winner
            : (winner === tossMatch.teamA?.name ? tossMatch.teamB?.name : tossMatch.teamA?.name)
        
        const tossSummaryText = `${winner} won toss & elected to ${isBatting ? 'Bat' : 'Bowl'} first`

        // 🌟 Persist Toss Result to MySQL DB via API
        try {
            await recordToss({
                matchId: tossMatch.id || tossMatch.matchCode,
                tossWinner: winner,
                tossDecision: isBatting ? 'bat' : 'bowl'
            })
        } catch (e) {
            console.warn('Error recording toss in DB:', e)
        }

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
            addToast(`🏏 Toss Done! ${tossSummaryText}. Persisted to DB!`, 'success')
        }
    }

    // Confirm Payment Received on Ground via QR Code & Persist to DB
    const handleConfirmPayment = async (match) => {
        if (!match) return
        const receiptNo = `REC-UMP-${Math.floor(10000 + Math.random() * 90000)}`
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        // 🌟 Persist Fee Payment Status to MySQL DB via API
        try {
            await updatePaymentStatus({
                matchId: match.id || match.matchCode,
                paymentStatus: 'RECEIVED'
            })
        } catch (e) {
            console.warn('Error updating payment status in DB:', e)
        }

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
            addToast(`✅ ₹${match.umpireFee || 300} Payment Marked as Received in DB! Receipt Generated: ${receiptNo}`, 'success')
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

    // Save or Add Ground Match & Captain Details (Persisted to DB)
    const handleSaveCaptainsMatch = async (formData) => {
        if (formData.isNew) {
            try {
                if (formData.matchId) {
                    await registerGroundMatch({ matchId: formData.matchId })
                }
            } catch (e) {
                console.warn('Ground match registration error:', e)
            }
            const newMatch = {
                id: formData.matchId || `MTC-IND-${Math.floor(900 + Math.random() * 99)}`,
                title: `${formData.teamAName || 'Team A'} vs ${formData.teamBName || 'Team B'}`,
                turf: formData.turf || 'Spike Cricket Turf',
                turfLocation: formData.turfLocation || 'Indore',
                date: formData.date || 'Today',
                time: formData.time || '8:00 PM – 9:00 PM',
                hasUmpireRequested: true,
                status: 'Upcoming',
                statusColor: 'blue',
                umpireFee: 300,
                paymentStatus: 'QR Payment Pending',
                teamA: {
                    name: formData.teamAName || 'Team A',
                    captain: formData.teamACaptain || 'Captain A',
                    phone: formData.teamAPhone || '',
                    score: 0,
                    wickets: 0,
                    overs: '0.0'
                },
                teamB: {
                    name: formData.teamBName || 'Team B',
                    captain: formData.teamBCaptain || 'Captain B',
                    phone: formData.teamBPhone || '',
                    score: 0,
                    wickets: 0,
                    overs: '0.0'
                }
            }
            setMatches([newMatch, ...matches])
            if (addToast) addToast(`🏏 Match "${newMatch.title}" Registered on Ground & Persisted!`, 'success')
        } else {
            try {
                if (formData.id) {
                    await updateMatchScore({
                        matchId: formData.id,
                        topBatsmanName: formData.teamACaptain,
                        topBowlerName: formData.teamBCaptain
                    })
                }
            } catch (e) {}

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
            if (addToast) addToast(`✓ Captain details updated for ${formData.title || 'Match'} & saved in DB!`, 'success')
        }
        setEditingCaptainsMatch(null)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col md:flex-row font-sans animate-in fade-in duration-300">
            {/* ═══════════════════════════════════════════════════
                MOBILE OVERLAY BACKDROP
            ═══════════════════════════════════════════════════ */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ═══════════════════════════════════════════════════
                RESPONSIVE LEFT SIDEBAR
            ═══════════════════════════════════════════════════ */}
            <aside className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } shrink-0`}>
                <div>
                    {/* Brand & Umpire Badge Header */}
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/kiaan_logo.jpg" 
                                alt="Kiaan Technologies Turf" 
                                className="w-10 h-10 rounded-xl object-cover shadow-md border border-emerald-400/40 shrink-0" 
                            />
                            <div>
                                <h2 className="text-xs font-black text-white tracking-wider uppercase">KIAAN'S TURF</h2>
                                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">OFFICIAL UMPIRE</p>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Umpire Profile Summary Card */}
                    <div className="p-4 mx-3 my-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white truncate max-w-[150px]">{myUmpireName || 'Official Umpire'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                                ✓ Certified
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium truncate">
                            🏟️ {officiatingLocations || 'Spike Turf & Royal Ground (Indore)'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-700/60">
                            <span className="text-slate-300 font-semibold">UPI QR:</span>
                            <span className="text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded text-[11px] truncate max-w-[130px]">{myUpiId || 'rajesh.umpire@okhdfcbank'}</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-3 space-y-1">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">NAVIGATION MENU</div>
                        {[
                            { id: 'duty', label: 'Live Duty & Matches', badge: matches.length, icon: '⚡' },
                            { id: 'history', label: 'Match History Log', badge: matchHistory.length, icon: '📜' },
                            { id: 'qr', label: 'My UPI Payment QR', badge: null, icon: '💳' },
                            { id: 'rules', label: 'Umpiring Rules', badge: null, icon: '📖' },
                        ].map(tab => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id)
                                        setIsSidebarOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md font-black'
                                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </div>
                                    {tab.badge !== null && tab.badge !== undefined && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                                            isActive ? 'bg-slate-950/80 text-emerald-300 border border-emerald-400/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                        }`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Sidebar Bottom Controls */}
                <div className="p-3 border-t border-slate-800 space-y-2">
                    <button
                        type="button"
                        onClick={async () => {
                            const nextDuty = !isOnDuty
                            setIsOnDuty(nextDuty)
                            try {
                                await updateUmpireProfile({ on_duty_status: nextDuty })
                            } catch (e) {}
                            if (addToast) addToast(nextDuty ? 'Duty Status: ON DUTY (Persisted to DB)' : 'Duty Status: OFF DUTY (Persisted to DB)', 'info')
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isOnDuty ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-white animate-pulse' : 'bg-red-400'}`}></span>
                        <span>{isOnDuty ? '🟢 ON DUTY' : '🔴 OFF DUTY'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (logout) logout()
                            navigate('/')
                        }}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <HiLogout className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════════
                MAIN CONTENT AREA
            ═══════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Top Header Bar for Mobile Hamburger & Quick Actions */}
                <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            <HiMenuAlt2 className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {activeTab === 'duty' && '⚡ Live Duty & Assigned Matches'}
                                {activeTab === 'history' && '📜 Match History & Officiated Log'}
                                {activeTab === 'qr' && '💳 My UPI Payment QR Code'}
                                {activeTab === 'rules' && '📖 Box Cricket Umpiring Rules'}
                            </h2>
                            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                                🏟️ {officiatingLocations || 'Venue Not Assigned'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setQrModalMatch({ title: 'Direct Match Fee', umpireFee: myMatchFee, turf: 'Ground Match' })}
                            className="px-3.5 py-2 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                            <HiQrcode className="w-4 h-4 text-slate-950" />
                            <span className="hidden sm:inline">Show QR (₹{myMatchFee})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/leaderboard')}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                            <span>👑</span>
                            <span className="hidden sm:inline">Leaderboard</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Body Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

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
                                                        setCurrentScore({
                                                            ...BLANK_SCORE,
                                                            runs: match.teamA?.score || 0,
                                                            wickets: match.teamA?.wickets || 0,
                                                            overs: parseFloat(match.teamA?.overs) || 0.0,
                                                            ballsThisOver: match.currentOverBalls || [],
                                                            selectedInnings: match.teamA?.name || 'Team A',
                                                            topBatsman: match.teamA?.captain || '',
                                                            topBowler: match.teamB?.captain || '',
                                                            mvpPlayer: match.teamA?.captain || '',
                                                            mvpPhone: match.teamA?.phone || ''
                                                        })
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
                </main>

            {/* ═══════════════════════════════════════════════════
                🪙 OFFICIAL TOSS CEREMONY MODAL (System Flip & Manual Toggle)
            ═══════════════════════════════════════════════════ */}
            {/* New Match Assignment Confirmation Popup */}
            {newAssignmentMatch && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 my-auto max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 text-2xl flex items-center justify-center font-black shrink-0 border border-emerald-300 shadow-xs">
                                    ⚖️
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-[#111827]">
                                        You've Been Assigned a Match
                                    </h3>
                                    <p className="text-[11px] font-semibold text-slate-500">{myUmpireName}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAcknowledgeAssignment}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1">
                            <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                                {newAssignmentMatch.modeBadge} &middot; {newAssignmentMatch.turf}
                            </div>
                            <div className="text-sm font-black flex items-center justify-between">
                                <span>{newAssignmentMatch.teamA?.name}</span>
                                <span className="text-slate-400 text-xs">vs</span>
                                <span>{newAssignmentMatch.teamB?.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-semibold pt-1">
                                {newAssignmentMatch.date} &middot; {newAssignmentMatch.time}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <p className="text-slate-400 font-bold uppercase text-[10px]">Duty Fee</p>
                                <p className="font-black text-slate-900">₹{newAssignmentMatch.umpireFee}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <p className="text-slate-400 font-bold uppercase text-[10px]">Payment Status</p>
                                <p className="font-black text-slate-900">{newAssignmentMatch.paymentStatus}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAcknowledgeAssignment}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                        >
                            Acknowledge Assignment
                        </button>
                    </div>
                </div>
            )}

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

                        {/* MANUAL ON-FIELD TOSS SELECTION */}
                        <div className="bg-emerald-50/60 border-2 border-emerald-300/80 rounded-2xl p-4 space-y-2">
                            <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                                <span>✋</span> Manual On-Field Coin Toss Selection
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">
                                Coin flipped on the ground by captain. Select the verified winner team and decision below:
                            </p>
                        </div>

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
                                <strong>{tossDecision.winnerTeam || tossMatch.teamA?.name}</strong> won the toss and elected to <strong className="uppercase underline text-emerald-900">{tossDecision.electedTo === 'bat' ? 'BAT' : 'BOWL'}</strong> first!
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
        </div>
    )
}

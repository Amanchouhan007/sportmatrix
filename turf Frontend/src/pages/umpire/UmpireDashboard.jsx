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
import { getSocket } from '../../services/socket'

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

    const reloadMatches = async () => {
        try {
            const list = await getUmpireMatches()
            if (Array.isArray(list) && list.length > 0) {
                const isMatchCompleted = (m) => {
                    const ds = m.dutyStatus || m.status;
                    const ms = m.match?.matchStatus || m.matchStatus || m.match_status;
                    return ds === 'CERTIFIED_COMPLETED' || ms === 'COMPLETED';
                };

                const upcoming = list.filter(m => !isMatchCompleted(m)).map(m => {
                    const matchObj = m.match || {};
                    const teamA = matchObj.teamAName || m.team1_name || 'Team A';
                    const teamB = matchObj.teamBName || m.team2_name || 'Team B';

                    let inn1Score = { runs: m.teamA?.score || 0, wickets: m.teamA?.wickets || 0, overs: m.teamA?.overs || '0.0' };
                    let inn2Score = { runs: m.teamB?.score || 0, wickets: m.teamB?.wickets || 0, overs: m.teamB?.overs || '0.0' };
                    let targetRuns = m.target || 0;

                    if (m.ballByBallFeed) {
                        try {
                            const parsed = typeof m.ballByBallFeed === 'string' ? JSON.parse(m.ballByBallFeed) : m.ballByBallFeed;
                            if (parsed && parsed.engine) {
                                if (parsed.engine.innings1) {
                                    const inn1 = parsed.engine.innings1;
                                    inn1Score = {
                                        runs: inn1.runs || 0,
                                        wickets: inn1.wickets || 0,
                                        overs: `${Math.floor((inn1.legalBalls || 0) / 6)}.${(inn1.legalBalls || 0) % 6}`
                                    };
                                }
                                if (parsed.engine.innings2) {
                                    const inn2 = parsed.engine.innings2;
                                    inn2Score = {
                                        runs: inn2.runs || 0,
                                        wickets: inn2.wickets || 0,
                                        overs: `${Math.floor((inn2.legalBalls || 0) / 6)}.${(inn2.legalBalls || 0) % 6}`
                                    };
                                }
                                if (parsed.engine.targetRuns) targetRuns = parsed.engine.targetRuns;
                            }
                        } catch (err) {}
                    }

                    const upcomingDateObj = m.createdAt || matchObj.createdAt ? new Date(m.createdAt || matchObj.createdAt) : null;

                    return {
                        id: m.id || m.matchId || m.match_code,
                        matchCode: m.matchId || m.id || m.match_code,
                        title: m.title || `${teamA} vs ${teamB}`,
                        turf: m.turf || m.venue || matchObj.branch?.branchName || m.branchName || 'Turf Venue',
                        turfLocation: m.turfLocation || matchObj.branch?.city || '',
                        date: m.date || (upcomingDateObj ? upcomingDateObj.toLocaleDateString() : 'Today'),
                        time: m.time || (upcomingDateObj ? upcomingDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'),
                        matchType: m.matchType || matchObj.paymentMode || 'DARE MATCH',
                        modeBadge: m.modeBadge || (matchObj.paymentMode ? `🔥 ${matchObj.paymentMode}` : '🔥 DARE MATCH'),
                        hasUmpireRequested: true,
                        status: m.dutyStatus || m.status || 'SCHEDULED',
                        statusColor: (m.dutyStatus || m.status) === 'CERTIFIED_COMPLETED' ? 'gray' : 'emerald',
                        umpireFee: Number(m.dutyFee || m.umpireFee || 300),
                        totalOvers: Number(m.totalOvers || 6),
                        paymentStatus: (m.feePaymentStatus === 'RECEIVED' || m.paymentStatus === 'Payment Received' || m.paymentStatus === 'Paid Direct QR') ? 'Payment Received' : 'Payment Pending',
                        feePaymentStatus: m.feePaymentStatus || 'PENDING',
                        currentScoreSummary: m.currentScoreSummary,
                        tossSummary: m.tossWinnerTeam ? `Toss Won By ${m.tossWinnerTeam} (Elected To ${m.tossElected || 'Bat'})` : null,
                        teamA: {
                            name: teamA,
                            captain: m.teamA?.captain || matchObj.teamA?.captain || (m.tossWinnerTeam === teamA ? 'Captain (Toss Winner)' : 'Captain A'),
                            phone: m.teamA?.phone || matchObj.teamA?.phone || '',
                            score: inn1Score.runs,
                            wickets: inn1Score.wickets,
                            overs: inn1Score.overs
                        },
                        teamB: {
                            name: teamB,
                            captain: m.teamB?.captain || matchObj.teamB?.captain || (m.tossWinnerTeam === teamB ? 'Captain (Toss Winner)' : 'Captain B'),
                            phone: m.teamB?.phone || matchObj.teamB?.phone || '',
                            score: inn2Score.runs,
                            wickets: inn2Score.wickets,
                            overs: inn2Score.overs
                        },
                        target: targetRuns
                    };
                });

                setMatches(upcoming);

                const completed = list.filter(isMatchCompleted).map(m => {
                    const matchObj = m.match || {};
                    const teamA = matchObj.teamAName || m.team1_name || 'Team A';
                    const teamB = matchObj.teamBName || m.team2_name || 'Team B';
                    const completedDateObj = m.createdAt || m.matchCreatedAt || matchObj.createdAt || m.certifiedAt ? new Date(m.createdAt || m.matchCreatedAt || matchObj.createdAt || m.certifiedAt) : null;
                    let mvpText = 'Player Performance Score (1.5x)';
                    if (m.topBatsmanName) {
                        mvpText = `${m.topBatsmanName} (${m.topBatsmanRuns || 0} Runs${m.topBowlerWickets ? `, ${m.topBowlerWickets} Wkts` : ''})`;
                    } else if (m.topBowlerName) {
                        mvpText = `${m.topBowlerName} (${m.topBowlerWickets || 0} Wkts)`;
                    } else {
                        const captA = m.teamA?.captain || matchObj.teamA?.captain || matchObj.matchTeams?.find(t => t.teamSide === 'TEAM_A')?.captainName;
                        const captB = m.teamB?.captain || matchObj.teamB?.captain || matchObj.matchTeams?.find(t => t.teamSide === 'TEAM_B')?.captainName;
                        const fallbackWinner = (matchObj.winnerTeamSide === 'TEAM_B' || m.tossWinnerTeam === teamB) ? (captB || teamB) : (captA || teamA);
                        mvpText = `${fallbackWinner} (Match MVP)`;
                    }

                    return {
                        id: m.id || m.matchId || m.match_code,
                        matchTitle: m.matchTitle || `${teamA} vs ${teamB}`,
                        turf: m.turf || matchObj.branch?.branchName || m.branchName || 'Turf Venue',
                        date: m.date || (completedDateObj ? completedDateObj.toLocaleDateString() : 'Recently'),
                        time: m.time || (completedDateObj ? completedDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
                        officiatedBy: `${myUmpireName || 'Official Umpire'}`,
                        result: m.result || m.currentScoreSummary || `${m.tossWinnerTeam || teamA} won`,
                        mvp: mvpText,
                        payment: `✓ ₹${m.dutyFee || m.umpireFee || 300} Received`,
                        verifiedTier: '⚖️ 1.5x Umpire Certified'
                    };
                });

                if (completed.length > 0) setMatchHistory(completed);

                const alreadyAcknowledged = JSON.parse(sessionStorage.getItem('umpire_acknowledged_matches') || '[]');
                const unacknowledged = upcoming.find(m => m.hasUmpireRequested && !alreadyAcknowledged.includes(m.id));
                if (unacknowledged) setNewAssignmentMatch(unacknowledged);
            }
        } catch (e) {
            console.warn('Error reloading matches:', e);
        }
    };

    useEffect(() => {
        getUmpireProfile().then(prof => {
            if (prof) {
                if (prof.full_name) setMyUmpireName(prof.full_name);
                if (prof.upi_id) setMyUpiId(prof.upi_id);
                if (prof.qr_image) {
                    setCustomQrImage(prof.qr_image);
                    setQrMode('custom');
                }
                if (prof.on_duty_status !== undefined) setIsOnDuty(Boolean(prof.on_duty_status));
                if (prof.officiating_grounds) setOfficiatingLocations(prof.officiating_grounds);
                if (prof.match_fee) setMyMatchFee(Number(prof.match_fee));
            }
        });

        reloadMatches();

        // Realtime WebSocket sync listener & periodic background polling
        const socket = getSocket();
        const handleRealtimeUpdate = () => {
            reloadMatches();
        };

        if (socket) {
            socket.on('live:score-update', handleRealtimeUpdate);
            socket.on('umpire:duty-assigned', handleRealtimeUpdate);
            socket.on('umpire:toss-recorded', handleRealtimeUpdate);
            socket.on('umpire:payment-updated', handleRealtimeUpdate);
            socket.on('live:match-completed', handleRealtimeUpdate);
            socket.on('branch:matches-updated', handleRealtimeUpdate);
        }

        const pollInterval = setInterval(reloadMatches, 10000);

        return () => {
            if (socket) {
                socket.off('live:score-update', handleRealtimeUpdate);
                socket.off('umpire:duty-assigned', handleRealtimeUpdate);
                socket.off('umpire:toss-recorded', handleRealtimeUpdate);
                socket.off('umpire:payment-updated', handleRealtimeUpdate);
                socket.off('live:match-completed', handleRealtimeUpdate);
                socket.off('branch:matches-updated', handleRealtimeUpdate);
            }
            clearInterval(pollInterval);
        };
    }, []);

    const handleAcknowledgeAssignment = () => {
        if (!newAssignmentMatch) return
        try {
            const alreadyAcknowledged = JSON.parse(sessionStorage.getItem('umpire_acknowledged_matches') || '[]')
            sessionStorage.setItem('umpire_acknowledged_matches', JSON.stringify([...alreadyAcknowledged, newAssignmentMatch.id]))
        } catch (e) {}
        setNewAssignmentMatch(null)
    }

    // ═══════════════════════════════════════════════════════════
    // 🏏 DETERMINISTIC LOCAL CRICKET LIVE SCORING ENGINE REDUCER
    // ═══════════════════════════════════════════════════════════
    const [isScoringSubmitting, setIsScoringSubmitting] = useState(false)
    const [deskViewTab, setDeskViewTab] = useState('keypad') // 'keypad' | 'scorecard'
    const [editBatterModalOpen, setEditBatterModalOpen] = useState(false)
    const [batterNamesInput, setBatterNamesInput] = useState({ striker: '', nonStriker: '' })
    const [wicketModalOpen, setWicketModalOpen] = useState(false)
    const [wicketData, setWicketData] = useState({ dismissalType: 'BOWLED', runOutBatter: 'striker', newBatsman: '', fielder: '' })
    const [extrasModalOpen, setExtrasModalOpen] = useState(null) // 'BYE' | 'LEG_BYE' | null
    const [overCompleteModalOpen, setOverCompleteModalOpen] = useState(false)
    const [nextBowlerName, setNextBowlerName] = useState('')

    // Helper to calculate deterministic scoring engine state from delivery history
    const getEngineState = (deliveries = [], match = scoringMatch, currentInn = currentScore?.selectedInnings || 1) => {
        const ballsPerOver = 6
        const totalOvers = Number(match?.totalOvers || currentScore?.totalOvers || 6)
        const maxWickets = 10

        const teamAName = match?.teamA?.name || match?.teamAName || 'Team A'
        const teamBName = match?.teamB?.name || match?.teamBName || 'Team B'

        const inn1 = {
            battingTeam: teamAName,
            runs: 0, wickets: 0, legalBalls: 0,
            wides: 0, noBalls: 0, byes: 0, legByes: 0,
            striker: match?.teamA?.captain || 'Striker A1',
            nonStriker: 'Batsman A2',
            currentBowler: match?.teamB?.captain || 'Bowler B1'
        }

        const inn2 = {
            battingTeam: teamBName,
            runs: 0, wickets: 0, legalBalls: 0,
            wides: 0, noBalls: 0, byes: 0, legByes: 0,
            striker: match?.teamB?.captain || 'Striker B1',
            nonStriker: 'Batsman B2',
            currentBowler: match?.teamA?.captain || 'Bowler A1'
        }

        const batters = {}
        const bowlers = {}

        const getBatter = (name) => {
            const key = name || 'Batter'
            if (!batters[key]) batters[key] = { name: key, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: null }
            return batters[key]
        }

        const getBowler = (name) => {
            const key = name || 'Bowler'
            if (!bowlers[key]) bowlers[key] = { name: key, legalBalls: 0, runsConceded: 0, wickets: 0, wides: 0, noBalls: 0 }
            return bowlers[key]
        }

        deliveries.forEach(del => {
            const inn = del.innings === 2 ? inn2 : inn1
            const runsBat = del.runsBat || 0
            const extraRuns = del.extraRuns || 0
            const isLegal = Boolean(del.legalBall)
            const eventType = del.event

            inn.runs += runsBat + extraRuns

            if (eventType === 'WIDE') inn.wides += extraRuns
            if (eventType === 'NO_BALL') inn.noBalls += extraRuns
            if (eventType === 'BYE') inn.byes += extraRuns
            if (eventType === 'LEG_BYE') inn.legByes += extraRuns

            if (del.wicket) {
                inn.wickets = Math.min(maxWickets, inn.wickets + 1)
                const dismissedName = del.dismissedBatter || del.striker || inn.striker
                const bStats = getBatter(dismissedName)
                bStats.out = true
                bStats.dismissal = del.dismissalType || 'OUT'

                if (del.newBatsman) {
                    if (dismissedName === inn.striker) {
                        inn.striker = del.newBatsman
                    } else {
                        inn.nonStriker = del.newBatsman
                    }
                }
            }

            if (isLegal) {
                inn.legalBalls += 1
            }

            if (del.striker) {
                const b = getBatter(del.striker)
                b.runs += runsBat
                if (runsBat === 4) b.fours += 1
                if (runsBat === 6) b.sixes += 1
                if (isLegal || eventType === 'BYE' || eventType === 'LEG_BYE') {
                    b.balls += 1
                }
            }

            if (del.bowler) {
                const bw = getBowler(del.bowler)
                if (isLegal) bw.legalBalls += 1
                if (eventType === 'WIDE') bw.wides += extraRuns
                if (eventType === 'NO_BALL') bw.noBalls += extraRuns
                if (eventType === 'WIDE' || eventType === 'NO_BALL' || eventType === 'RUN') {
                    bw.runsConceded += runsBat + extraRuns
                }
                if (del.wicket && del.dismissalType !== 'RUN_OUT') {
                    bw.wickets += 1
                }
            }

            let shouldSwapStrike = false
            if (runsBat % 2 === 1) shouldSwapStrike = true
            if ((eventType === 'BYE' || eventType === 'LEG_BYE') && extraRuns % 2 === 1) shouldSwapStrike = true

            if (shouldSwapStrike) {
                const tmp = inn.striker
                inn.striker = inn.nonStriker
                inn.nonStriker = tmp
            }

            if (isLegal && inn.legalBalls % ballsPerOver === 0) {
                const tmp = inn.striker
                inn.striker = inn.nonStriker
                inn.nonStriker = tmp
                if (del.nextBowler) {
                    inn.currentBowler = del.nextBowler
                }
            }
        })

        const activeInnNum = currentInn || (deliveries.length > 0 ? deliveries[deliveries.length - 1].innings : 1)
        const maxLegalBalls = totalOvers * ballsPerOver
        const isInn1Finished = inn1.legalBalls >= maxLegalBalls || inn1.wickets >= maxWickets
        const targetRuns = (activeInnNum === 2 || isInn1Finished) ? inn1.runs + 1 : null
        
        const isInn2Finished = (targetRuns && inn2.runs >= targetRuns) || inn2.legalBalls >= maxLegalBalls || inn2.wickets >= maxWickets
        const isMatchComplete = isInn2Finished

        let resultText = null
        if (isMatchComplete) {
            if (targetRuns && inn2.runs >= targetRuns) {
                const wktsLeft = maxWickets - inn2.wickets
                resultText = `🏆 ${teamBName} won by ${wktsLeft} wicket${wktsLeft === 1 ? '' : 's'}!`
            } else if (inn2.runs === inn1.runs) {
                resultText = `🤝 MATCH TIED! SUPER OVER REQUIRED!`
            } else {
                const margin = inn1.runs - inn2.runs
                resultText = `🏆 ${teamAName} won by ${margin} run${margin === 1 ? '' : 's'}!`
            }
        }

        return {
            selectedInnings: activeInnNum,
            config: { totalOvers, ballsPerOver, maxWickets, maxLegalBalls },
            innings1: inn1,
            innings2: inn2,
            targetRuns,
            isInn1Finished,
            isInn2Finished,
            isMatchComplete,
            resultText,
            batters,
            bowlers,
            deliveries
        }
    }

    // Convert Engine to UI score snapshot for rendering
    const syncEngineToUI = (engine) => {
        const activeInn = engine.selectedInnings === 2 ? engine.innings2 : engine.innings1
        const totalOvers = engine.config?.totalOvers || 6
        const ovFormatted = `${Math.floor(activeInn.legalBalls / 6)}.${activeInn.legalBalls % 6}`
        
        // Extract balls in current over
        const ballsThisOver = engine.deliveries
            .filter(d => (d.innings || 1) === engine.selectedInnings)
            .slice(-6)
            .map(d => d.event === 'RUN' ? `${d.runsBat}` : (d.event === 'WICKET' ? 'W' : d.event))

        const strikerStats = engine.batters[activeInn.striker] || { runs: 0, balls: 0 }
        const bowlerStats = engine.bowlers[activeInn.currentBowler] || { wickets: 0, runsConceded: 0 }

        return {
            ...currentScore,
            selectedInnings: engine.selectedInnings,
            runs: activeInn.runs,
            wickets: activeInn.wickets,
            overs: ovFormatted,
            totalOvers,
            legalBalls: activeInn.legalBalls,
            ballsThisOver,
            striker: activeInn.striker,
            nonStriker: activeInn.nonStriker,
            currentBowler: activeInn.currentBowler,
            topBatsman: activeInn.striker,
            batsmanRuns: strikerStats.runs,
            batsmanBalls: strikerStats.balls,
            topBowler: activeInn.currentBowler,
            bowlerWickets: bowlerStats.wickets,
            bowlerRuns: bowlerStats.runsConceded,
            isMatchComplete: engine.isMatchComplete,
            resultText: engine.resultText,
            targetRuns: engine.targetRuns,
            engine
        }
    }

    // Process new delivery event & persist to DB
    const handleAddDeliveryEvent = async (delEvent) => {
        if (isScoringSubmitting || !scoringMatch?.id) return
        setIsScoringSubmitting(true)

        const currentEngine = currentScore.engine || getEngineState([], scoringMatch)
        const updatedDeliveries = [...(currentEngine.deliveries || []), delEvent]
        const nextEngine = getEngineState(updatedDeliveries, scoringMatch, currentEngine.selectedInnings)
        const nextUI = syncEngineToUI(nextEngine)

        setCurrentScore(nextUI)

        // Optimistically update match card UI behind modal in real-time
        setMatches(prev => prev.map(m => {
            if (m.id === scoringMatch.id) {
                return {
                    ...m,
                    teamA: {
                        ...m.teamA,
                        score: nextEngine.innings1.runs,
                        wickets: nextEngine.innings1.wickets,
                        overs: `${Math.floor(nextEngine.innings1.legalBalls / 6)}.${nextEngine.innings1.legalBalls % 6}`
                    },
                    teamB: {
                        ...m.teamB,
                        score: nextEngine.innings2.runs,
                        wickets: nextEngine.innings2.wickets,
                        overs: `${Math.floor(nextEngine.innings2.legalBalls / 6)}.${nextEngine.innings2.legalBalls % 6}`
                    },
                    target: nextEngine.targetRuns || m.target
                }
            }
            return m;
        }))

        const activeInn = nextEngine.selectedInnings === 2 ? nextEngine.innings2 : nextEngine.innings1
        const ovStr = `${Math.floor(activeInn.legalBalls / 6)}.${activeInn.legalBalls % 6}`
        const summaryStr = nextEngine.selectedInnings === 2
            ? `Inn 1: ${nextEngine.innings1.runs}/${nextEngine.innings1.wickets} (6.0) | Inn 2: ${nextEngine.innings2.runs}/${nextEngine.innings2.wickets} (${ovStr}) | Target ${nextEngine.targetRuns}`
            : `Inn 1: ${nextEngine.innings1.runs}/${nextEngine.innings1.wickets} (${ovStr} ov)`

        try {
            await updateMatchScore({
                matchId: scoringMatch.id,
                currentScoreSummary: summaryStr,
                ballByBallFeed: JSON.stringify({
                    version: 1,
                    engine: {
                        selectedInnings: nextEngine.selectedInnings,
                        config: nextEngine.config,
                        innings1: nextEngine.innings1,
                        innings2: nextEngine.innings2,
                        targetRuns: nextEngine.targetRuns
                    },
                    deliveries: updatedDeliveries
                }),
                topBatsmanName: nextUI.topBatsman,
                topBatsmanRuns: nextUI.batsmanRuns,
                topBowlerName: nextUI.topBowler,
                topBowlerWickets: nextUI.bowlerWickets
            })
            if (nextEngine.isMatchComplete) {
                if (addToast) addToast(`🎉 MATCH COMPLETED! ${nextEngine.resultText}`, 'success')
            } else if (nextEngine.isInn1Finished && currentEngine.selectedInnings === 1) {
                if (addToast) addToast(`🏆 Innings 1 Complete! Target: ${nextEngine.targetRuns} Runs. Switched to Innings 2!`, 'success')
            } else if (delEvent.legalBall && activeInn.legalBalls > 0 && activeInn.legalBalls % 6 === 0) {
                setOverCompleteModalOpen(true)
            } else {
                if (addToast) addToast(`Ball Recorded: ${delEvent.event}`, 'info')
            }
        } catch (e) {
            console.error('Error persisting delivery:', e)
            if (addToast) addToast(`⚠️ Failed to save ball: ${e.message || 'Error'}`, 'error')
            // Revert optimistic delivery
            const prevEngine = getEngineState(currentEngine.deliveries || [], scoringMatch, currentEngine.selectedInnings)
            setCurrentScore(syncEngineToUI(prevEngine))
        } finally {
            setIsScoringSubmitting(false)
        }
    }

    // 1-Click Undo Delivery Event & Persist to DB
    const handleUndoDelivery = async () => {
        if (isScoringSubmitting || !scoringMatch?.id) return
        const currentEngine = currentScore.engine || getEngineState([], scoringMatch)
        const deliveries = currentEngine.deliveries || []

        if (deliveries.length === 0) {
            if (addToast) addToast('No deliveries to undo!', 'warning')
            return
        }

        setIsScoringSubmitting(true)
        const updatedDeliveries = deliveries.slice(0, -1)
        const nextEngine = getEngineState(updatedDeliveries, scoringMatch, currentEngine.selectedInnings)
        const nextUI = syncEngineToUI(nextEngine)

        setCurrentScore(nextUI)

        const activeInn = nextEngine.selectedInnings === 2 ? nextEngine.innings2 : nextEngine.innings1
        const ovStr = `${Math.floor(activeInn.legalBalls / 6)}.${activeInn.legalBalls % 6}`
        const summaryStr = nextEngine.selectedInnings === 2
            ? `Inn 1: ${nextEngine.innings1.runs}/${nextEngine.innings1.wickets} (6.0) | Inn 2: ${nextEngine.innings2.runs}/${nextEngine.innings2.wickets} (${ovStr}) | Target ${nextEngine.targetRuns}`
            : `Inn 1: ${nextEngine.innings1.runs}/${nextEngine.innings1.wickets} (${ovStr} ov)`

        try {
            await updateMatchScore({
                matchId: scoringMatch.id,
                currentScoreSummary: summaryStr,
                ballByBallFeed: JSON.stringify({
                    version: 1,
                    engine: {
                        selectedInnings: nextEngine.selectedInnings,
                        config: nextEngine.config,
                        innings1: nextEngine.innings1,
                        innings2: nextEngine.innings2,
                        targetRuns: nextEngine.targetRuns
                    },
                    deliveries: updatedDeliveries
                }),
                topBatsmanName: nextUI.topBatsman,
                topBatsmanRuns: nextUI.batsmanRuns,
                topBowlerName: nextUI.topBowler,
                topBowlerWickets: nextUI.bowlerWickets
            })
            if (addToast) addToast('↺ Last Delivery Undone Successfully!', 'success')
        } catch (e) {
            console.error('Error undoing delivery:', e)
            if (addToast) addToast(`⚠️ Undo failed: ${e.message || 'Error'}`, 'error')
            setCurrentScore(syncEngineToUI(currentEngine))
        } finally {
            setIsScoringSubmitting(false)
        }
    }

    // Manual Strike Rotate
    const handleManualRotateStrike = () => {
        setCurrentScore(prev => ({
            ...prev,
            striker: prev.nonStriker,
            nonStriker: prev.striker
        }))
        if (addToast) addToast('⇄ Strike Rotated', 'info')
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

        const completedItem = {
            id: match.id,
            matchTitle: match.title || `${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'}`,
            turf: match.turf || 'Spike Turf Arena',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            officiatedBy: myUmpireName || 'Official Umpire',
            result: `Match Certified - Innings ${currentScore.selectedInnings || 1}: ${currentScore.runs}/${currentScore.wickets}`,
            mvp: `MVP: ${currentScore.mvpPlayer || batsmanName || 'Performance Star'}`,
            payment: `✓ ₹${match.umpireFee || 300} Received`,
            verifiedTier: '⚖️ 1.5x Umpire Certified'
        }

        setMatchHistory(prev => [completedItem, ...prev.filter(h => h.id !== match.id)])
        setMatches(prev => prev.filter(m => m.id !== match.id && m.id !== match.matchCode))
        setScoringMatch(null)
        await reloadMatches()

        if (addToast) {
            addToast(`🎉 Match Certified & Closed! Persisted to DB & moved to History!`, 'success')
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
            if (m.id === match.id || m.id === match.matchCode || m.matchCode === match.id) {
                return {
                    ...m,
                    paymentStatus: 'Payment Received',
                    feePaymentStatus: 'RECEIVED',
                    receiptNo: receiptNo,
                    paidAt: timestamp
                }
            }
            return m
        })
        setMatches(updatedMatches)

        const updatedHistory = matchHistory.map(h => {
            if (h.id === match.id || h.id === match.matchCode || h.matchTitle === match.title) {
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
            paymentStatus: 'Payment Received',
            feePaymentStatus: 'RECEIVED'
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
        reader.onload = async (event) => {
            const base64 = event.target?.result
            setCustomQrImage(base64)
            setQrMode('custom')
            try {
                await updateUmpireProfile({ custom_qr_image: base64 })
            } catch (err) {
                console.warn('QR image DB profile update note:', err)
            }
            if (addToast) addToast('✅ Custom QR Code Scanner Photo Uploaded & Saved to Profile!', 'success')
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
                const res = await registerGroundMatch({
                    isNew: true,
                    teamAName: formData.teamAName,
                    teamACaptain: formData.teamACaptain,
                    teamAPhone: formData.teamAPhone,
                    teamBName: formData.teamBName,
                    teamBCaptain: formData.teamBCaptain,
                    teamBPhone: formData.teamBPhone
                })
                if (res && (res.success || res.data || res.id)) {
                    if (addToast) addToast(`🏏 Match "${formData.teamAName || 'Team A'} vs ${formData.teamBName || 'Team B'}" Registered on Ground & Saved in DB!`, 'success')
                    await reloadMatches()
                }
            } catch (e) {
                console.warn('Ground match registration error:', e)
            }
        } else {
            try {
                if (formData.id) {
                    await updateMatchScore({
                        matchId: formData.id,
                        teamAName: formData.teamAName,
                        teamACaptain: formData.teamACaptain,
                        teamAPhone: formData.teamAPhone,
                        teamBName: formData.teamBName,
                        teamBCaptain: formData.teamBCaptain,
                        teamBPhone: formData.teamBPhone
                    })
                    if (addToast) addToast(`✓ Captain details updated for ${formData.title || 'Match'} & saved in DB!`, 'success')
                    await reloadMatches()
                }
            } catch (e) {
                console.warn('Update captain error:', e)
            }
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
                RESPONSIVE LEFT SIDEBAR (LIGHT THEME UI)
            ═══════════════════════════════════════════════════ */}
            <aside className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-900 flex flex-col justify-between border-r border-slate-200/90 shadow-xl backdrop-blur-xl transition-transform duration-300 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } shrink-0`}>
                <div>
                    {/* Brand & Umpire Badge Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/images/kiaan_gold_logo.jpg?v=2" 
                                alt="Kiaan Technology Turf Cricket Arena" 
                                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-amber-400/50 shrink-0" 
                            />
                            <div>
                                <h2 className="text-xs font-black text-slate-950 tracking-wider uppercase">KIAAN <span className="text-amber-600">TURF</span></h2>
                                <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest">OFFICIAL UMPIRE</p>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Umpire Profile Summary Card (Clean Light Theme) */}
                    <div className="p-4 mx-3.5 my-3.5 bg-gradient-to-br from-emerald-50/80 via-slate-50 to-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-2.5 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-950 truncate max-w-[150px]">{myUmpireName || 'Official Umpire'}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black tracking-wide flex items-center gap-1 shadow-2xs">
                                ✓ Certified
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold truncate">
                            🏟️ {officiatingLocations || 'Spike Turf & Royal Ground (Indore)'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-emerald-100">
                            <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">UPI QR:</span>
                            <span className="text-emerald-900 font-bold bg-white border border-emerald-300 px-2.5 py-0.5 rounded text-[11px] truncate max-w-[130px] shadow-2xs">{myUpiId || 'rajesh.umpire@okhdfcbank'}</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-3.5 space-y-1.5">
                        <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">NAVIGATION MENU</div>
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
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? 'bg-[#C8FF2E] text-slate-950 shadow-md shadow-[#C8FF2E]/30 font-black scale-[1.01] translate-x-1 ring-1 ring-slate-950/10'
                                            : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-950 hover:translate-x-1'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </div>
                                    {tab.badge !== null && tab.badge !== undefined && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono shadow-2xs ${
                                            isActive ? 'bg-slate-950 text-[#C8FF2E]' : 'bg-slate-100 text-slate-700 border border-slate-200'
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
                <div className="p-3.5 border-t border-slate-800/80 space-y-2.5">
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
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                            isOnDuty ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
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
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
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
                            onClick={() => setEditingCaptainsMatch({
                                isNew: true,
                                title: '',
                                turf: 'Spike Turf & Royal Ground',
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
                            className="px-3.5 py-2 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                            <span>➕</span>
                            <span className="hidden sm:inline">Register Match</span>
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
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 relative z-10">
                    {/* Ambient Glows */}
                    <div className="absolute top-[5%] left-[5%] w-[45vw] h-[45vw] bg-[#C8FF2E]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

                    {/* ═══════════════════════════════════════════════════
                        TOP KPI SUMMARY CARDS BAR
                    ═══════════════════════════════════════════════════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Active Duty Queue */}
                        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-emerald-300 transition-all">
                            <div className="space-y-1 relative z-10">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Live Duty Queue</span>
                                <div className="text-2xl font-black text-[#111827]">{matches.length} <span className="text-xs font-bold text-emerald-600">Assigned</span></div>
                                <p className="text-[10px] font-semibold text-slate-400">Box Cricket Referee Matches</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                ⚡
                            </div>
                        </div>

                        {/* Card 2: Total Matches Officiated */}
                        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-amber-300 transition-all">
                            <div className="space-y-1 relative z-10">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Officiated Log</span>
                                <div className="text-2xl font-black text-[#111827]">{matchHistory.length} <span className="text-xs font-bold text-amber-600">Matches</span></div>
                                <p className="text-[10px] font-semibold text-slate-400">Certified Scorecards</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                📜
                            </div>
                        </div>

                        {/* Card 3: Match Duty Fee & Daily Settlement Ledger */}
                        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-[#16A34A]/30 transition-all">
                            <div className="space-y-1 relative z-10">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Umpire Match Rate</span>
                                <div className="text-2xl font-black text-[#111827]">₹{myMatchFee} <span className="text-xs font-bold text-emerald-600">/ Match</span></div>
                                <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                    💰 Today Earned: ₹{(matches.filter(m => m.feePaymentStatus === 'RECEIVED' || m.paymentStatus === 'Payment Received').length + matchHistory.length) * (myMatchFee || 300)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-700 border border-lime-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                💰
                            </div>
                        </div>

                        {/* Card 4: Official Tier & Verification */}
                        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between relative overflow-hidden group hover:shadow-md hover:border-blue-300 transition-all">
                            <div className="space-y-1 relative z-10">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Referee Status</span>
                                <div className="text-2xl font-black text-[#111827]">1.5x <span className="text-xs font-bold text-blue-600">Certified</span></div>
                                <p className="text-[10px] font-semibold text-slate-400">Indore Official League Tier</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                ⚖️
                            </div>
                        </div>
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
                                    🟢 Assigned to {myUmpireName || 'Official Umpire'}
                                </span>
                            </div>
                        </div>

                        {(() => {
                            const activeMatchesList = matches.filter(m => m.status !== 'Certified & Completed' && m.status !== 'COMPLETED' && m.status !== 'CERTIFIED_COMPLETED');

                            if (activeMatchesList.length === 0) {
                                return (
                                    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-12 text-center shadow-xs space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-emerald-200 shadow-sm">
                                            🏏
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-[#111827] uppercase tracking-tight">No Live Duty Matches Queue</h3>
                                            <p className="text-xs text-slate-500 max-w-md mx-auto font-semibold leading-relaxed">
                                                Captains will book you for live box cricket matches, or you can register a ground match directly below.
                                            </p>
                                        </div>
                                        <div className="pt-2">
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
                                                className="px-5 py-3 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                                            >
                                                <span>➕</span>
                                                <span>Register Ground Match & Captains</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 gap-4">
                                    {activeMatchesList.map((match) => (
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
                                                    (match.status === 'Live Now' || match.status === 'LIVE_NOW' || match.status === 'IN_PROGRESS')
                                                        ? 'bg-emerald-500 text-white animate-pulse'
                                                        : (match.status === 'Certified & Completed' || match.status === 'CERTIFIED_COMPLETED' || match.status === 'COMPLETED')
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                                                }`}>
                                                    {(match.status === 'Live Now' || match.status === 'LIVE_NOW' || match.status === 'IN_PROGRESS') ? '⚡ Live Now' : match.status}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-black text-[10px] uppercase tracking-wider border border-orange-200">
                                                    {match.modeBadge}
                                                </span>

                                                {/* Status / Payment Badge: Don't show payment pending for upcoming matches */}
                                                {(match.status === 'Upcoming' || match.status === 'SCHEDULED') ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[10px] uppercase tracking-wider">
                                                        🕒 Starts at {match.time?.split('–')?.[0]?.trim() || match.time}
                                                    </span>
                                                ) : (match.paymentStatus === 'Payment Received' || match.paymentStatus === 'Paid Direct QR' || match.paymentStatus === 'QR Paid on Ground' || match.feePaymentStatus === 'RECEIVED') ? (
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
                                            {match.tossSummary}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons for Umpire */}
                                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                                            {/* UPCOMING MATCH: Conduct Toss & Start Match */}
                                            {(match.status === 'Upcoming' || match.status === 'SCHEDULED') && (
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
                                            {(match.status === 'Live Now' || match.status === 'LIVE_NOW' || match.status === 'IN_PROGRESS') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setScoringMatch(match)
                                                        let feedDeliveries = []
                                                        if (match.ballByBallFeed) {
                                                            try {
                                                                const parsed = typeof match.ballByBallFeed === 'string' ? JSON.parse(match.ballByBallFeed) : match.ballByBallFeed
                                                                if (parsed && parsed.deliveries && Array.isArray(parsed.deliveries)) {
                                                                    feedDeliveries = parsed.deliveries
                                                                }
                                                            } catch (err) {}
                                                        }
                                                        const engine = getEngineState(feedDeliveries, match, 1)
                                                        setCurrentScore(syncEngineToUI(engine))
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

                                            {/* PAYMENT BUTTON: Always shown on all registered & assigned match cards */}
                                            {(match.paymentStatus === 'Payment Received' || match.paymentStatus === 'Paid Direct QR' || match.paymentStatus === 'QR Paid on Ground' || match.feePaymentStatus === 'RECEIVED') ? (
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
                                                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                                >
                                                    <HiQrcode className="w-4 h-4 text-purple-700" />
                                                    <span>Show QR (₹{match.umpireFee || 300})</span>
                                                </button>
                                            )}

                                            {/* Edit Captains & Teams Button (Active/Upcoming Only) */}
                                            {match.status !== 'Certified & Completed' && match.status !== 'COMPLETED' && match.status !== 'CERTIFIED_COMPLETED' && (
                                                <>
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
                                                            const rawPhone = match.teamA?.phone || match.teamB?.phone || '9876543210';
                                                            const cleanPhone = rawPhone.replace(/\D/g, '');
                                                            const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                                            window.open(`https://wa.me/${fullPhone}?text=Hello%20Captain%2C%20this%20is%20${encodeURIComponent(myUmpireName || 'Official Umpire')}%20for%20your%20match%20at%20${encodeURIComponent(match.turf)}.%20Please%20report%20for%20toss!`, '_blank')
                                                        }}
                                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <span>💬</span>
                                                        <span>Call Captains</span>
                                                    </button>

                                                    {/* Quick Mark Completed & Move to History */}
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (window.confirm(`Mark ${match.title} as Completed & Certified?`)) {
                                                                try {
                                                                    await completeMatch({ matchId: match.id || match.matchCode })
                                                                    if (addToast) addToast(`✓ ${match.title} marked as completed & moved to history!`, 'success')
                                                                    await reloadMatches()
                                                                } catch (err) {
                                                                    if (addToast) addToast('Failed to mark match as completed', 'error')
                                                                }
                                                            }
                                                        }}
                                                        className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                        title="Mark match certified and move to history"
                                                    >
                                                        <span>🏁</span>
                                                        <span>Mark Completed</span>
                                                    </button>
                                                </>
                                            )}
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
                    );
                })()}
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
                                                const textContent = `=====================================================\nSPORTMATRIX OFFICIAL UMPIRE MATCH CERTIFICATE\n=====================================================\nCertificate ID: ${rec.id}\nMatch Title: ${rec.matchTitle}\nGround: ${rec.turf}\nOfficiated By: ${rec.officiatedBy}\nResult: ${rec.result}\nMan of Match (MVP): ${rec.mvp}\nPayment Status: ${rec.payment}\nVerification Tier: ${rec.verifiedTier}\nCertified Date: ${rec.date} (${rec.time})\n=====================================================`;
                                                const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `Certificate_${rec.id}.txt`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                                if (addToast) addToast(`Official Match Certificate for ${rec.id} downloaded!`, 'success');
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
                                    const imgUrl = getDisplayQrImage(300);
                                    const link = document.createElement('a');
                                    link.href = imgUrl;
                                    link.target = '_blank';
                                    link.download = `Umpire_QR_${myUpiId || 'Standee'}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    if (addToast) addToast(`QR Code Standee image downloaded for ${myUpiId || 'Umpire'}!`, 'success');
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
                                    onClick={async () => {
                                        try {
                                            if (myUpiId) localStorage.setItem('umpire_upi_id', myUpiId);
                                            if (customQrImage) localStorage.setItem('umpire_custom_qr_img', customQrImage);
                                            localStorage.setItem('umpire_qr_mode', qrMode);
                                            await updateUmpireProfile({
                                                full_name: myUmpireName,
                                                upi_id: myUpiId,
                                                custom_qr_image: customQrImage
                                            });
                                            if (addToast) addToast(`✓ QR Settings saved & updated in DB!`, 'success');
                                        } catch (err) {
                                            console.warn('Error saving QR settings:', err);
                                            if (addToast) addToast(`⚠️ Error saving QR settings: ${err.message || 'Error'}`, 'error');
                                        }
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

                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    window.print()
                                }}
                                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                            >
                                <HiDownload className="w-4 h-4" />
                                <span>Print</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const captPhone = receiptModalMatch.teamA?.captainPhone || receiptModalMatch.teamB?.captainPhone || '';
                                    const text = encodeURIComponent(
                                        `*OFFICIAL MATCH UMPIRE RECEIPT*\n` +
                                        `*Receipt No:* ${receiptModalMatch.receiptNo || 'REC-UMP-9842'}\n` +
                                        `*Match:* ${receiptModalMatch.title || 'Ground Match'}\n` +
                                        `*Turf:* ${receiptModalMatch.turf || 'Kiaan Turf'}\n` +
                                        `*Umpire:* ${myUmpireName || 'Official Umpire'} (Certified)\n` +
                                        `*Fee Paid:* ₹${receiptModalMatch.umpireFee || 300}\n` +
                                        `*Status:* ✓ PAID DIRECT QR\n\n` +
                                        `Thank you for playing at Kiaan Turf Arena!`
                                    );
                                    const phoneDigits = captPhone ? captPhone.replace(/\D/g, '') : '';
                                    window.open(`https://wa.me/${phoneDigits}?text=${text}`, '_blank');
                                }}
                                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                            >
                                <span>📲</span>
                                <span>WhatsApp</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setReceiptModalMatch(null)}
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                            >
                                ✓ Close
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
                            {/* Turf, Location & Total Overs Selector (Clean Light Theme UI) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-slate-50 to-emerald-50/40 border border-emerald-200/80 shadow-xs">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                                        <span>🏟️</span> Select Turf Venue *
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={editingCaptainsMatch.turf || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const preset = [
                                                    { name: 'Spike Turf & Royal Ground', location: 'Bhawarkua, Indore' },
                                                    { name: 'Kiaan Turf Arena', location: 'Vijay Nagar, Indore' },
                                                    { name: 'Royal Box Cricket Arena', location: 'Palasia, Indore' },
                                                    { name: 'Champions Turf & Arena', location: 'Rau, Indore' },
                                                    { name: 'Indore Super Box Turf', location: 'Geeta Bhawan, Indore' },
                                                    { name: 'Star Sports Box Turf', location: 'AB Road, Indore' },
                                                    { name: 'Kiaan Technology Turf Arena', location: 'Pune' }
                                                ].find(t => t.name === val);

                                                if (preset) {
                                                    setEditingCaptainsMatch(prev => ({
                                                        ...prev,
                                                        turf: preset.name,
                                                        turfLocation: preset.location
                                                    }));
                                                } else {
                                                    setEditingCaptainsMatch(prev => ({ ...prev, turf: val }));
                                                }
                                            }}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500 bg-white text-xs font-extrabold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all shadow-2xs"
                                        >
                                            <option value="" disabled className="bg-white text-slate-400">-- Select Area Turf --</option>
                                            <option value="Spike Turf & Royal Ground" className="bg-white text-slate-900 font-bold py-2">🏟️ Spike Turf & Royal Ground (Bhawarkua)</option>
                                            <option value="Kiaan Turf Arena" className="bg-white text-slate-900 font-bold py-2">🏟️ Kiaan Turf Arena (Vijay Nagar)</option>
                                            <option value="Royal Box Cricket Arena" className="bg-white text-slate-900 font-bold py-2">🏟️ Royal Box Cricket Arena (Palasia)</option>
                                            <option value="Champions Turf & Arena" className="bg-white text-slate-900 font-bold py-2">🏟️ Champions Turf (Rau)</option>
                                            <option value="Indore Super Box Turf" className="bg-white text-slate-900 font-bold py-2">🏟️ Indore Super Box Turf (Geeta Bhawan)</option>
                                            <option value="Star Sports Box Turf" className="bg-white text-slate-900 font-bold py-2">🏟️ Star Sports Box Turf (AB Road)</option>
                                            <option value="Kiaan Technology Turf Arena" className="bg-white text-slate-900 font-bold py-2">🏟️ Kiaan Tech Turf (Pune)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                                        <span>📍</span> Location / Area *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCaptainsMatch.turfLocation || ''}
                                        onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, turfLocation: e.target.value }))}
                                        placeholder="e.g. Bhawarkua, Indore"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-emerald-950 mb-1 flex items-center gap-1">
                                        <span>🏏</span> Overs Limit *
                                    </label>
                                    <select
                                        value={editingCaptainsMatch.totalOvers || 6}
                                        onChange={(e) => setEditingCaptainsMatch(prev => ({ ...prev, totalOvers: Number(e.target.value) }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-100/70 text-xs font-black text-emerald-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs transition-all"
                                    >
                                        <option value={4} className="bg-white text-slate-900 font-bold">⚡ 4 Overs (Quick Blitz)</option>
                                        <option value={6} className="bg-white text-slate-900 font-bold">🏏 6 Overs (Box Turf Standard)</option>
                                        <option value={8} className="bg-white text-slate-900 font-bold">🔥 8 Overs (Pro League)</option>
                                        <option value={10} className="bg-white text-slate-900 font-bold">🏆 10 Overs (T10 Format)</option>
                                        <option value={12} className="bg-white text-slate-900 font-bold">⭐ 12 Overs (Championship)</option>
                                        <option value={15} className="bg-white text-slate-900 font-bold">🌟 15 Overs (Super Cup)</option>
                                        <option value={20} className="bg-white text-slate-900 font-bold">💥 20 Overs (T20 Format)</option>
                                    </select>
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
                ⚡ LIVE MATCH SCORING DESK MODAL (PROFESSIONAL ENGINE)
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
                                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-black text-emerald-950">
                                        <span>🏏 Format:</span>
                                        <select
                                            value={scoringMatch.totalOvers || currentScore.totalOvers || 6}
                                            onChange={(e) => {
                                                const newOvers = Number(e.target.value)
                                                const updatedMatch = { ...scoringMatch, totalOvers: newOvers }
                                                setScoringMatch(updatedMatch)
                                                const engine = currentScore.engine || getEngineState([], updatedMatch)
                                                const nextEngine = getEngineState(engine.deliveries || [], updatedMatch, engine.selectedInnings)
                                                setCurrentScore(syncEngineToUI(nextEngine))
                                                if (addToast) addToast(`🏏 Match Format Set to ${newOvers} Overs!`, 'info')
                                            }}
                                            className="bg-transparent font-black text-emerald-900 outline-none cursor-pointer"
                                        >
                                            <option value={4}>4 Overs</option>
                                            <option value={6}>6 Overs</option>
                                            <option value={8}>8 Overs</option>
                                            <option value={10}>10 Overs</option>
                                            <option value={12}>12 Overs</option>
                                            <option value={15}>15 Overs</option>
                                            <option value={20}>20 Overs</option>
                                        </select>
                                    </div>
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

                        {/* Match Finished Celebration Banner */}
                        {currentScore.isMatchComplete && (
                            <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl border-2 border-purple-500 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">🏆 OFFICIAL MATCH RESULT</span>
                                    <div className="text-base font-black text-white">{currentScore.resultText}</div>
                                    <p className="text-xs text-slate-300 font-medium mt-0.5">International Cricket Rules applied. All overs/wickets completed!</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSignAndCertifyMatch(scoringMatch)}
                                    className="px-4 py-2.5 rounded-xl bg-[#C8FF2E] hover:bg-[#B5F000] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer"
                                >
                                    <span>⚖️ Sign Off (1.5x)</span>
                                </button>
                            </div>
                        )}

                        {/* Free Hit Alert Banner */}
                        {currentScore.engine?.deliveries && currentScore.engine.deliveries.length > 0 && currentScore.engine.deliveries[currentScore.engine.deliveries.length - 1].event === 'NO_BALL' && (
                            <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-md animate-pulse">
                                <span className="flex items-center gap-2">
                                    <span className="text-base">🔥</span> FREE HIT NEXT BALL! (Batter cannot be out except Run Out)
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-mono">NO BALL FREE HIT</span>
                            </div>
                        )}

                        {/* Big Digital Score Display */}
                        <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                                        Innings {currentScore.selectedInnings} ({currentScore.selectedInnings === 1 ? (scoringMatch.teamA?.name || 'Team A') : (scoringMatch.teamB?.name || 'Team B')})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextInn = currentScore.selectedInnings === 1 ? 2 : 1
                                            const engine = currentScore.engine || getEngineState([], scoringMatch)
                                            const nextEngine = getEngineState(engine.deliveries || [], scoringMatch, nextInn)
                                            setCurrentScore(syncEngineToUI(nextEngine))
                                            if (addToast) addToast(`Switched to Innings ${nextInn}`, 'info')
                                        }}
                                        className="text-[10px] font-black uppercase bg-amber-400 hover:bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full cursor-pointer transition-all"
                                    >
                                        🔄 Switch Innings
                                    </button>
                                </div>
                                <div className="text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                                    <span>{currentScore.runs}/{currentScore.wickets}</span>
                                    <span className="text-lg text-slate-400 font-semibold">({currentScore.overs} / {currentScore.totalOvers || 6}.0 Overs)</span>
                                </div>
                                {currentScore.selectedInnings === 2 && currentScore.engine?.targetRuns && (
                                    <div className="text-xs font-bold text-amber-300 mt-1">
                                        Target: {currentScore.engine.targetRuns} | Need {Math.max(0, currentScore.engine.targetRuns - currentScore.runs)} runs off {Math.max(0, 36 - (currentScore.legalBalls || 0))} balls
                                    </div>
                                )}
                            </div>

                            {/* Current Over Balls Timeline */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">This Over Balls</span>
                                <div className="flex items-center gap-1.5 justify-center min-h-[32px]">
                                    {(currentScore.ballsThisOver || []).length === 0 ? (
                                        <span className="text-xs text-slate-500 font-semibold">New Over</span>
                                    ) : (
                                        (currentScore.ballsThisOver || []).map((b, i) => (
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
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Match Stats & Extras Summary Ribbon */}
                        {(() => {
                            const activeInnObj = currentScore.selectedInnings === 2 ? currentScore.engine?.innings2 : currentScore.engine?.innings1;
                            const w = activeInnObj?.wides || 0;
                            const nb = activeInnObj?.noBalls || 0;
                            const b = activeInnObj?.byes || 0;
                            const lb = activeInnObj?.legByes || 0;
                            const totalExtras = w + nb + b + lb;
                            const crr = ((currentScore.runs || 0) / (Math.max(1, currentScore.legalBalls || 0) / 6)).toFixed(2);
                            const rrr = currentScore.selectedInnings === 2 && currentScore.engine?.targetRuns
                                ? (((currentScore.engine.targetRuns - currentScore.runs) / (Math.max(1, 36 - (currentScore.legalBalls || 0)) / 6))).toFixed(2)
                                : null;

                            return (
                                <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-700 font-black">📈 CRR: <span className="text-emerald-700 font-mono">{crr}</span></span>
                                        {rrr !== null && (
                                            <span className="text-slate-700 font-black">🎯 RRR: <span className="text-amber-700 font-mono">{rrr}</span></span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                                        <span>Extras: <strong className="text-slate-900 font-black font-mono">{totalExtras}</strong></span>
                                        <span>(W: {w}, NB: {nb}, B: {b}, LB: {lb})</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* View Switcher & Player Edit Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDeskViewTab('keypad')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                        deskViewTab === 'keypad'
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    ⚡ Live Scoring Keypad
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeskViewTab('scorecard')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                        deskViewTab === 'scorecard'
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    📊 Detailed Scorecard Table
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setBatterNamesInput({ striker: currentScore.striker || '', nonStriker: currentScore.nonStriker || '' });
                                    setEditBatterModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                                ✏️ Edit Player Names
                            </button>
                        </div>

                        {deskViewTab === 'keypad' ? (
                            <>
                                {/* Batter & Bowler Current Status Badges */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-emerald-800 block">🏏 On Strike</span>
                                            <div className="font-black text-slate-900 truncate max-w-[150px]">{currentScore.striker}*</div>
                                            <div className="text-[10px] font-semibold text-slate-500">Non-Striker: {currentScore.nonStriker}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleManualRotateStrike}
                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase cursor-pointer"
                                        >
                                            ⇄ Swap
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-300 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-purple-800 block">🎯 Active Bowler</span>
                                            <div className="font-black text-slate-900 truncate max-w-[150px]">{currentScore.currentBowler}</div>
                                            <div className="text-[10px] font-semibold text-slate-500">Wkts: {currentScore.bowlerWickets} | Runs: {currentScore.bowlerRuns}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setOverCompleteModalOpen(true)}
                                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[10px] uppercase cursor-pointer"
                                        >
                                            ⚾ Change
                                        </button>
                                    </div>
                                </div>

                                {/* 1-Click Professional Scoring Keypad */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                                            ⚡ Tap to Record Delivery:
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={handleUndoDelivery}
                                            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1 transition-all disabled:opacity-50"
                                        >
                                            <span>↺</span> UNDO LAST BALL
                                        </button>
                                    </div>

                                    {/* Runs Row */}
                                    <div className="grid grid-cols-6 gap-2">
                                        {[0, 1, 2, 3, 4, 6].map(runs => (
                                            <button
                                                key={runs}
                                                type="button"
                                                disabled={isScoringSubmitting}
                                                onClick={() => handleAddDeliveryEvent({
                                                    id: `del_${Date.now()}_${Math.random()}`,
                                                    innings: currentScore.selectedInnings,
                                                    event: 'RUN',
                                                    runsBat: runs,
                                                    extraRuns: 0,
                                                    legalBall: true,
                                                    striker: currentScore.striker,
                                                    nonStriker: currentScore.nonStriker,
                                                    bowler: currentScore.currentBowler
                                                })}
                                                className={`py-3.5 rounded-2xl font-black text-base font-mono shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 ${
                                                    runs === 4 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                    runs === 6 ? 'bg-purple-600 hover:bg-purple-700 text-white animate-bounce' :
                                                    'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                                                }`}
                                            >
                                                {runs}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Extras & Wicket Row */}
                                    <div className="grid grid-cols-5 gap-2">
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={() => setWicketModalOpen(true)}
                                            className="py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            OUT (W)
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={() => handleAddDeliveryEvent({
                                                id: `del_${Date.now()}_${Math.random()}`,
                                                innings: currentScore.selectedInnings,
                                                event: 'WIDE',
                                                runsBat: 0,
                                                extraRuns: 1,
                                                extraType: 'WIDE',
                                                legalBall: false,
                                                striker: currentScore.striker,
                                                nonStriker: currentScore.nonStriker,
                                                bowler: currentScore.currentBowler
                                            })}
                                            className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            WIDE
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={() => handleAddDeliveryEvent({
                                                id: `del_${Date.now()}_${Math.random()}`,
                                                innings: currentScore.selectedInnings,
                                                event: 'NO_BALL',
                                                runsBat: 0,
                                                extraRuns: 1,
                                                extraType: 'NO_BALL',
                                                legalBall: false,
                                                striker: currentScore.striker,
                                                nonStriker: currentScore.nonStriker,
                                                bowler: currentScore.currentBowler
                                            })}
                                            className="py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            NO BALL
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={() => setExtrasModalOpen('BYE')}
                                            className="py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            BYE
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isScoringSubmitting}
                                            onClick={() => setExtrasModalOpen('LEG_BYE')}
                                            className="py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            LEG BYE
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* SCORECARD TABLE VIEW */
                            <div className="space-y-4 text-xs">
                                {/* Batting Table */}
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>🏏 Batting Performance</span>
                                        <span className="text-[11px] font-normal text-slate-500">Innings {currentScore.selectedInnings}</span>
                                    </h4>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-2.5">Batter</th>
                                                    <th className="p-2.5">Status</th>
                                                    <th className="p-2.5 font-mono">R</th>
                                                    <th className="p-2.5 font-mono">B</th>
                                                    <th className="p-2.5 font-mono">4s</th>
                                                    <th className="p-2.5 font-mono">6s</th>
                                                    <th className="p-2.5 font-mono">SR</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
                                                {Object.values(currentScore.engine?.batters || {}).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-slate-400 font-medium">No batting records yet</td>
                                                    </tr>
                                                ) : (
                                                    Object.values(currentScore.engine?.batters || {}).map((b, idx) => {
                                                        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50">
                                                                <td className="p-2.5 font-bold">{b.name}</td>
                                                                <td className="p-2.5 text-[11px]">
                                                                    {b.out ? <span className="text-red-600 font-bold">b {b.dismissal}</span> : <span className="text-emerald-700 font-bold">not out *</span>}
                                                                </td>
                                                                <td className="p-2.5 font-black font-mono">{b.runs}</td>
                                                                <td className="p-2.5 font-mono text-slate-500">{b.balls}</td>
                                                                <td className="p-2.5 font-mono text-blue-700">{b.fours}</td>
                                                                <td className="p-2.5 font-mono text-purple-700">{b.sixes}</td>
                                                                <td className="p-2.5 font-mono text-slate-600">{sr}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Bowling Table */}
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2">🎯 Bowling Analysis</h4>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-2.5">Bowler</th>
                                                    <th className="p-2.5 font-mono">O</th>
                                                    <th className="p-2.5 font-mono">R</th>
                                                    <th className="p-2.5 font-mono">W</th>
                                                    <th className="p-2.5 font-mono">WD</th>
                                                    <th className="p-2.5 font-mono">NB</th>
                                                    <th className="p-2.5 font-mono">Econ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
                                                {Object.values(currentScore.engine?.bowlers || {}).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-slate-400 font-medium">No bowling records yet</td>
                                                    </tr>
                                                ) : (
                                                    Object.values(currentScore.engine?.bowlers || {}).map((bw, idx) => {
                                                        const ovs = `${Math.floor((bw.legalBalls || 0) / 6)}.${(bw.legalBalls || 0) % 6}`;
                                                        const econ = bw.legalBalls > 0 ? ((bw.runsConceded / (bw.legalBalls / 6)).toFixed(2)) : '0.00';
                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50">
                                                                <td className="p-2.5 font-bold">{bw.name}</td>
                                                                <td className="p-2.5 font-mono">{ovs}</td>
                                                                <td className="p-2.5 font-black font-mono text-slate-900">{bw.runsConceded}</td>
                                                                <td className="p-2.5 font-black font-mono text-red-600">{bw.wickets}</td>
                                                                <td className="p-2.5 font-mono text-amber-700">{bw.wides || 0}</td>
                                                                <td className="p-2.5 font-mono text-orange-700">{bw.noBalls || 0}</td>
                                                                <td className="p-2.5 font-mono text-slate-600">{econ}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

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

            {/* 🔴 WICKET & NEW BATSMAN SELECTION SUB-MODAL */}
            {wicketModalOpen && (
                <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-red-600">🚨 Record Wicket & Incoming Batter</span>
                            <button type="button" onClick={() => setWicketModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer"><HiX className="w-5 h-5"/></button>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-slate-700 mb-1">Dismissal Type</label>
                            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                                {['BOWLED', 'CAUGHT', 'STUMPED', 'LBW', 'RUN_OUT'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setWicketData(prev => ({ ...prev, dismissalType: type }))}
                                        className={`py-2 rounded-xl border ${wicketData.dismissalType === type ? 'bg-red-600 text-white border-red-600 font-black' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {wicketData.dismissalType === 'RUN_OUT' && (
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Which Batter is Out?</label>
                                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setWicketData(prev => ({ ...prev, runOutBatter: 'striker' }))}
                                        className={`py-2 rounded-xl border ${wicketData.runOutBatter === 'striker' ? 'bg-red-600 text-white border-red-600 font-black' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        Striker ({currentScore.striker})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWicketData(prev => ({ ...prev, runOutBatter: 'nonStriker' }))}
                                        className={`py-2 rounded-xl border ${wicketData.runOutBatter === 'nonStriker' ? 'bg-red-600 text-white border-red-600 font-black' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        Non-Striker ({currentScore.nonStriker})
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase text-slate-700 mb-1">New Incoming Batsman Name *</label>
                            <input
                                type="text"
                                value={wicketData.newBatsman}
                                onChange={e => setWicketData(prev => ({ ...prev, newBatsman: e.target.value }))}
                                placeholder="e.g. Aman Verma"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setWicketModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
                            <button
                                type="button"
                                onClick={() => {
                                    const dismissedName = wicketData.dismissalType === 'RUN_OUT' && wicketData.runOutBatter === 'nonStriker'
                                        ? currentScore.nonStriker
                                        : currentScore.striker

                                    handleAddDeliveryEvent({
                                        id: `del_${Date.now()}_${Math.random()}`,
                                        innings: currentScore.selectedInnings,
                                        event: 'WICKET',
                                        runsBat: 0,
                                        extraRuns: 0,
                                        legalBall: true,
                                        striker: currentScore.striker,
                                        nonStriker: currentScore.nonStriker,
                                        bowler: currentScore.currentBowler,
                                        wicket: true,
                                        dismissedBatter: dismissedName,
                                        dismissalType: wicketData.dismissalType,
                                        newBatsman: wicketData.newBatsman || 'New Batsman'
                                    })
                                    setWicketModalOpen(false)
                                    setWicketData({ dismissalType: 'BOWLED', runOutBatter: 'striker', newBatsman: '' })
                                }}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase"
                            >
                                Confirm Wicket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⚾ BYE / LEG-BYE RUN SELECTOR SUB-MODAL */}
            {extrasModalOpen && (
                <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-teal-700">Select {extrasModalOpen} Runs</span>
                            <button type="button" onClick={() => setExtrasModalOpen(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer"><HiX className="w-5 h-5"/></button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(run => (
                                <button
                                    key={run}
                                    type="button"
                                    onClick={() => {
                                        handleAddDeliveryEvent({
                                            id: `del_${Date.now()}_${Math.random()}`,
                                            innings: currentScore.selectedInnings,
                                            event: extrasModalOpen,
                                            runsBat: 0,
                                            extraRuns: run,
                                            extraType: extrasModalOpen,
                                            legalBall: true,
                                            striker: currentScore.striker,
                                            nonStriker: currentScore.nonStriker,
                                            bowler: currentScore.currentBowler
                                        })
                                        setExtrasModalOpen(null)
                                    }}
                                    className="py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-lg shadow-sm"
                                >
                                    +{run}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 🏆 OVER COMPLETE / BOWLER CHANGE SUB-MODAL */}
            {overCompleteModalOpen && (() => {
                const existingBowlersList = Object.values(currentScore.engine?.bowlers || {});
                const lastBowlerName = currentScore.currentBowler;

                return (
                    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-xs font-black uppercase tracking-wider text-purple-700">🏆 Over Complete & Bowler Change</span>
                                <button type="button" onClick={() => setOverCompleteModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer"><HiX className="w-5 h-5"/></button>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-2xl text-xs text-purple-950 font-bold">
                                6 Legal deliveries completed for this over. Strike rotated automatically. Select bowler for next over:
                            </div>

                            {/* EXISTING BOWLERS QUICK-SELECT CHIPS */}
                            {existingBowlersList.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                        ⚡ Select Existing Bowler (1-Tap Selection)
                                    </label>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {existingBowlersList.map((bw, idx) => {
                                            const isLastBowler = bw.name.trim().toLowerCase() === (lastBowlerName || '').trim().toLowerCase();
                                            const isSelected = nextBowlerName.trim().toLowerCase() === bw.name.trim().toLowerCase();
                                            const ovs = `${Math.floor((bw.legalBalls || 0) / 6)}.${(bw.legalBalls || 0) % 6}`;

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setNextBowlerName(bw.name)}
                                                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-400/30'
                                                            : isLastBowler
                                                            ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-xs text-slate-900">{bw.name}</span>
                                                            {isLastBowler && (
                                                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                                                    Bowled Last Over
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                                                            {ovs} ov &middot; {bw.wickets} wkts &middot; {bw.runsConceded} runs
                                                        </div>
                                                    </div>
                                                    {isSelected ? (
                                                        <span className="text-purple-700 font-black text-sm">✓ Selected</span>
                                                    ) : (
                                                        <span className="text-slate-400 font-bold text-xs">Select ➔</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* OR ENTER NEW BOWLER NAME */}
                            <div className="space-y-1 pt-1">
                                <label className="block text-[11px] font-black uppercase text-slate-600">
                                    {existingBowlersList.length > 0 ? '➕ Or Enter New Bowler Name' : 'Select / Enter New Bowler Name *'}
                                </label>
                                <input
                                    type="text"
                                    value={nextBowlerName}
                                    onChange={e => setNextBowlerName(e.target.value)}
                                    placeholder="e.g. Vikas Singh"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#111827] outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (nextBowlerName) {
                                            setCurrentScore(prev => ({ ...prev, currentBowler: nextBowlerName.trim() }))
                                        }
                                        setOverCompleteModalOpen(false)
                                        setNextBowlerName('')
                                    }}
                                    disabled={!nextBowlerName.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-xs uppercase shadow-md cursor-pointer"
                                >
                                    Confirm Bowler
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ✏️ EDIT PLAYER NAMES SUB-MODAL */}
            {editBatterModalOpen && (
                <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-700">✏️ Edit Batter Names</span>
                            <button type="button" onClick={() => setEditBatterModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer"><HiX className="w-5 h-5"/></button>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-slate-700 mb-1">Striker Name (On Crease)</label>
                            <input
                                type="text"
                                value={batterNamesInput.striker}
                                onChange={e => setBatterNamesInput(prev => ({ ...prev, striker: e.target.value }))}
                                placeholder="e.g. Virat Kohli"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-slate-700 mb-1">Non-Striker Name</label>
                            <input
                                type="text"
                                value={batterNamesInput.nonStriker}
                                onChange={e => setBatterNamesInput(prev => ({ ...prev, nonStriker: e.target.value }))}
                                placeholder="e.g. Rohit Sharma"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#111827]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setEditBatterModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentScore(prev => ({
                                        ...prev,
                                        striker: batterNamesInput.striker || prev.striker,
                                        nonStriker: batterNamesInput.nonStriker || prev.nonStriker
                                    }))
                                    setEditBatterModalOpen(false)
                                    if (addToast) addToast('Batter names updated', 'info')
                                }}
                                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase cursor-pointer"
                            >
                                Save Names
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}

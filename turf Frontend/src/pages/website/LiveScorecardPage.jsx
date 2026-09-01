import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { SERVER_URL } from '../../services/api'

const SPORT_ICONS = {
  Cricket: '🏏', Football: '⚽', Basketball: '🏀', Volleyball: '🏐',
  Badminton: '🏸', Tennis: '🎾', default: '🏆'
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
const formatTime = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_CFG = {
  LIVE:      { label: 'LIVE',      color: '#ff2d55', bg: 'rgba(255,45,85,0.18)', pulse: true },
  SCHEDULED: { label: 'SCHEDULED', color: '#636e72', bg: 'rgba(99,110,114,0.12)', pulse: false },
  COMPLETED: { label: 'COMPLETED', color: '#00b894', bg: 'rgba(0,184,148,0.12)', pulse: false },
  ABANDONED: { label: 'ABANDONED', color: '#636e72', bg: 'rgba(99,110,114,0.12)', pulse: false },
}

function MatchCard({ match, highlight }) {
  const [flash, setFlash] = useState(false)
  const prevRef = useRef(`${match.teamAScore}|${match.teamBScore}`)

  useEffect(() => {
    const curr = `${match.teamAScore}|${match.teamBScore}`
    if (curr !== prevRef.current) {
      prevRef.current = curr
      setFlash(true)
      setTimeout(() => setFlash(false), 1400)
    }
  }, [match.teamAScore, match.teamBScore])

  const sc = STATUS_CFG[match.status] || STATUS_CFG.SCHEDULED
  const isLive = match.status === 'LIVE'
  const aWin = match.teamAScore > match.teamBScore
  const bWin = match.teamBScore > match.teamAScore
  const sportIcon = SPORT_ICONS[match.tournament?.sport?.name] || SPORT_ICONS.default
  const shareUrl = `${window.location.origin}/live/${match.id}`

  return (
    <div style={{
      background: highlight ? 'rgba(255,45,85,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(255,45,85,0.5)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 20, overflow: 'hidden',
      transition: 'transform 0.3s,box-shadow 0.3s',
      boxShadow: isLive
        ? '0 6px 36px rgba(255,45,85,0.18)'
        : '0 4px 16px rgba(0,0,0,0.18)',
      transform: flash ? 'scale(1.015)' : 'scale(1)',
    }}>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px',
        background: isLive
          ? 'linear-gradient(90deg,rgba(255,45,85,0.25),rgba(192,57,43,0.15))'
          : 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {sc.pulse && (
            <span style={{
              width: 9, height: 9, borderRadius: '50%', background: '#ff2d55',
              display: 'inline-block', animation: 'pulseD 1.2s infinite'
            }} />
          )}
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 2,
            color: sc.color, background: sc.bg, padding: '2px 10px', borderRadius: 20
          }}>{sc.label}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            {match.roundName || 'Round'} · {match.tournament?.title || 'Tournament'}
          </span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(shareUrl)
            .catch(()=>{})
          }}
          title="Share this match"
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: 'rgba(255,255,255,0.8)', fontSize: 11,
            padding: '3px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}>
          🔗 Share
        </button>
      </div>

      {/* Score section */}
      <div style={{ padding: '22px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', gap: 16, alignItems: 'center' }}>

          {/* Team A */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%', margin: '0 auto 10px',
              background: aWin ? 'linear-gradient(135deg,#f7971e,#ffd200)' : 'rgba(255,255,255,0.06)',
              border: `2px solid ${aWin ? '#ffd200' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: aWin ? '0 0 20px rgba(255,210,0,0.35)' : 'none',
              transition: 'all 0.4s'
            }}>{sportIcon}</div>
            <div style={{
              color: aWin ? '#ffd200' : '#fff', fontWeight: 700, fontSize: 15,
              textShadow: aWin && isLive ? '0 0 10px rgba(255,210,0,0.5)' : 'none'
            }}>{match.teamA?.teamName || 'Team A'}</div>
            {aWin && isLive && <div style={{ fontSize: 10, color: '#ffd200', fontWeight: 700, marginTop: 3, letterSpacing: 1 }}>LEADING</div>}
          </div>

          {/* Score display */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 32, fontWeight: 900, letterSpacing: 3,
              fontFamily: "'Courier New',monospace", color: '#fff',
              background: flash ? 'rgba(255,45,85,0.18)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '8px 10px',
              transition: 'background 0.5s',
              lineHeight: 1.2
            }}>
              {match.teamAScore ?? '–'}<br/>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>vs</span><br/>
              {match.teamBScore ?? '–'}
            </div>
          </div>

          {/* Team B */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%', margin: '0 auto 10px',
              background: bWin ? 'linear-gradient(135deg,#f7971e,#ffd200)' : 'rgba(255,255,255,0.06)',
              border: `2px solid ${bWin ? '#ffd200' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: bWin ? '0 0 20px rgba(255,210,0,0.35)' : 'none',
              transition: 'all 0.4s'
            }}>{sportIcon}</div>
            <div style={{
              color: bWin ? '#ffd200' : '#fff', fontWeight: 700, fontSize: 15,
              textShadow: bWin && isLive ? '0 0 10px rgba(255,210,0,0.5)' : 'none'
            }}>{match.teamB?.teamName || 'Team B'}</div>
            {bWin && isLive && <div style={{ fontSize: 10, color: '#ffd200', fontWeight: 700, marginTop: 3, letterSpacing: 1 }}>LEADING</div>}
          </div>
        </div>

        {match.matchSummary && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10, borderLeft: '3px solid rgba(255,45,85,0.5)',
            color: 'rgba(255,255,255,0.65)', fontSize: 13
          }}>
            📋 {match.matchSummary}
          </div>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.35)', fontSize: 11, gap: 6
        }}>
          <span>📅 {formatDate(match.matchDate)}</span>
          <span>⏱ {formatTime(match.matchDate)}</span>
          <span>📍 {match.tournament?.branch?.city || 'Venue'}</span>
          <Link to={`/live/${match.id}`} style={{
            color: '#ff2d55', textDecoration: 'none', fontWeight: 600, fontSize: 12,
            padding: '3px 10px', border: '1px solid rgba(255,45,85,0.35)', borderRadius: 8
          }}>View →</Link>
        </div>
      </div>
    </div>
  )
}

export default function LiveScorecardPage() {
  const { matchId } = useParams()
  const [matches, setMatches] = useState([])
  const [allMatches, setAllMatches] = useState([])
  const [tab, setTab] = useState('live')
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [connected, setConnected] = useState(false)

  const fetchLive = useCallback(async () => {
    try {
      const r = await fetch(`${SERVER_URL}/api/v1/tournaments/matches/live`)
      const j = await r.json()
      setMatches(j.data || [])
    } catch { /* offline */ }
    setLoading(false)
    setLastUpdate(new Date())
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const r = await fetch(`${SERVER_URL}/api/v1/tournaments/matches/all`)
      const j = await r.json()
      setAllMatches(j.data || [])
    } catch { /* offline */ }
  }, [])

  useEffect(() => { fetchLive(); fetchAll() }, [fetchLive, fetchAll])

  // Real-time socket (public, no auth needed)
  useEffect(() => {
    const s = io(SERVER_URL, { autoConnect: true, reconnection: true })
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('live:score-update', (p) => {
      setLastUpdate(new Date())
      setMatches(prev => {
        if (prev.find(m => m.id === p.matchId)) {
          return prev.map(m => m.id === p.matchId
            ? { ...m, teamAScore: p.teamAScore, teamBScore: p.teamBScore, matchSummary: p.matchSummary, status: p.status }
            : m)
        }
        fetchLive(); return prev
      })
      if (p.status === 'COMPLETED' || p.status === 'ABANDONED') {
        setTimeout(() => { fetchLive(); fetchAll() }, 800)
      }
    })
    const poll = setInterval(() => { fetchLive(); fetchAll() }, 15000)
    return () => { s.disconnect(); clearInterval(poll) }
  }, [fetchLive, fetchAll])

  const list = tab === 'live' ? matches : allMatches
  const sorted = matchId
    ? [...list].sort((a, b) => (b.id === matchId ? 1 : 0))
    : list

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg,#080812 0%,#0d1117 50%,#0a1423 100%)',
      fontFamily: "'Inter','Segoe UI',sans-serif", color: '#fff',
      paddingBottom: 80
    }}>
      <style>{`
        @keyframes pulseD {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:.35;transform:scale(1.5)}
        }
        @keyframes liveGlow {
          0%{box-shadow:0 0 0 0 rgba(255,45,85,.5)}
          70%{box-shadow:0 0 0 14px rgba(255,45,85,0)}
          100%{box-shadow:0 0 0 0 rgba(255,45,85,0)}
        }
        .mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
        @media(max-width:600px){.mg{grid-template-columns:1fr!important}}
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#ff2d55 0%,#a71d2a 100%)',
        padding: '16px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, animation: 'liveGlow 2s infinite'
          }}>🏏</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19 }}>KIAAN TURF — Live Scores</div>
            <div style={{ fontSize: 12, opacity: .8 }}>Real-time scorecards · Open to everyone · No login needed</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: connected ? 'rgba(0,184,148,0.18)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${connected ? 'rgba(0,184,148,.4)' : 'rgba(255,255,255,.2)'}`,
            borderRadius: 20, padding: '5px 14px', fontSize: 12
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#00b894' : '#ff7675',
              animation: connected ? 'pulseD 1.5s infinite' : 'none'
            }}/>
            {connected ? 'Live' : 'Reconnecting…'}
          </div>
          <Link to="/" style={{
            color: 'rgba(255,255,255,.85)', textDecoration: 'none',
            fontSize: 12, padding: '6px 16px',
            border: '1px solid rgba(255,255,255,.3)', borderRadius: 20
          }}>🏠 Home</Link>
        </div>
      </div>

      {lastUpdate && (
        <div style={{
          textAlign: 'center', padding: '6px', fontSize: 11,
          background: 'rgba(255,45,85,0.05)', borderBottom: '1px solid rgba(255,45,85,0.08)',
          color: 'rgba(255,255,255,0.35)'
        }}>
          Last synced: {lastUpdate.toLocaleTimeString('en-IN')} · Updates live via WebSocket + polls every 15s
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: '18px 22px 0', display: 'flex', gap: 10 }}>
        {[
          { k: 'live', l: `🔴 Live Now (${matches.length})` },
          { k: 'all',  l: `📋 All Matches (${allMatches.length})` }
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '8px 20px', borderRadius: 24, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 13, transition: 'all .2s',
            background: tab === t.k ? 'linear-gradient(135deg,#ff2d55,#c0392b)' : 'rgba(255,255,255,0.06)',
            color: tab === t.k ? '#fff' : 'rgba(255,255,255,.55)',
            boxShadow: tab === t.k ? '0 4px 14px rgba(255,45,85,.3)' : 'none'
          }}>{t.l}</button>
        ))}
      </div>

      {/* Matches */}
      <div style={{ padding: '18px 22px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 72, color: 'rgba(255,255,255,.4)' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>⏳</div>
            Loading scores…
          </div>
        ) : sorted.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 72,
            border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 22,
            color: 'rgba(255,255,255,.4)'
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏟️</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {tab === 'live' ? 'No Live Matches Right Now' : 'No Matches Found'}
            </div>
            <div style={{ fontSize: 13 }}>
              {tab === 'live'
                ? 'Umpire will start the next match soon. Check back!'
                : 'No tournament fixtures created yet.'}
            </div>
            {tab === 'live' && allMatches.length > 0 && (
              <button onClick={() => setTab('all')} style={{
                marginTop: 18, padding: '10px 24px',
                background: 'linear-gradient(135deg,#ff2d55,#c0392b)',
                border: 'none', borderRadius: 20, color: '#fff',
                fontWeight: 600, cursor: 'pointer', fontSize: 13
              }}>View All Matches →</button>
            )}
          </div>
        ) : (
          <div className="mg">
            {sorted.map(m => (
              <MatchCard key={m.id} match={m} highlight={m.id === matchId} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,8,18,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '10px 22px',
        display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
        color: 'rgba(255,255,255,0.3)', fontSize: 11
      }}>
        <span>🔴 Scores auto-update via WebSocket</span>
        <span>📱 Share the 🔗 button to send match link to friends</span>
        <span>🏆 Powered by KIAAN Turf</span>
      </div>
    </div>
  )
}

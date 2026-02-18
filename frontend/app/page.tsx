'use client'

import { useEffect, useState } from 'react'
import { Mail, FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({
    needs_action: 0,
    plans: 0,
    done: 0,
    pending_approval: 0
  })
  const [tick, setTick] = useState(0)
  const [time, setTime] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
      setTick(t => t + 1)
    }
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const navLinks = [
    { href: '/tasks',      label: 'TASKS',      accent: '#FF3B00' },
    { href: '/approvals',  label: 'APPROVALS',  accent: '#FFD600' },
    { href: '/chat',       label: 'AI CHAT',    accent: '#00FF88' },
    { href: '/linkedin',   label: 'LINKEDIN',   accent: '#0088FF' },
    { href: '/audit',      label: 'CEO AUDIT',  accent: '#FF3B00' },
    { href: '/email',      label: 'EMAIL',      accent: '#0088FF' },
    { href: '/autonomous', label: 'AUTONOMOUS', accent: '#FF00AA' },
    { href: '/social',     label: 'SOCIAL',     accent: '#FF00AA' },
  ]

  const statCards = [
    { value: stats.needs_action,    label: 'PENDING TASKS',   icon: Mail,        accent: '#FF3B00', id: '01' },
    { value: stats.plans,           label: 'ACTIVE PLANS',    icon: FileText,    accent: '#FFD600', id: '02' },
    { value: stats.done,            label: 'COMPLETED',       icon: CheckCircle, accent: '#00FF88', id: '03' },
    { value: stats.pending_approval,label: 'AWAITING APPRVL', icon: Clock,       accent: '#0088FF', id: '04' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Bebas+Neue&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0A0A0A;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          min-height: 100vh;
        }

        .mgr-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .mgr-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: stretch;
          height: 72px;
        }
        .mgr-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
          text-decoration: none;
          border-right: 1px solid #333;
          padding-right: 32px;
        }
        .mgr-logo-dot {
          width: 10px;
          height: 10px;
          background: #FF3B00;
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .mgr-status-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #555;
          padding: 0 24px;
        }
        .mgr-status-online {
          color: #00FF88;
          font-weight: 700;
        }
        .mgr-time {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
          border-left: 1px solid #333;
          padding-left: 32px;
        }

        /* ── MAIN GRID ── */
        .mgr-main {
          display: grid;
          grid-template-columns: 280px 1fr;
          grid-template-rows: 1fr;
          min-height: calc(100vh - 72px);
        }

        /* ── SIDEBAR ── */
        .mgr-sidebar {
          border-right: 2px solid #E8E8E0;
          display: flex;
          flex-direction: column;
          padding: 32px 0;
        }
        .mgr-sidebar-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #444;
          padding: 0 28px 16px;
          text-transform: uppercase;
        }
        .mgr-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: #666;
          text-decoration: none;
          border-top: 1px solid #1A1A1A;
          transition: color 0.15s, background 0.15s;
          position: relative;
          overflow: hidden;
        }
        .mgr-nav-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 0;
          background: var(--accent);
          opacity: 0.15;
          transition: width 0.2s ease;
        }
        .mgr-nav-item:hover {
          color: #E8E8E0;
        }
        .mgr-nav-item:hover::before {
          width: 100%;
        }
        .mgr-nav-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.15s, transform 0.15s;
          font-size: 14px;
        }
        .mgr-nav-item:hover .mgr-nav-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .mgr-nav-accent {
          width: 4px;
          height: 100%;
          position: absolute;
          left: 0; top: 0;
          background: var(--accent);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.2s ease;
        }
        .mgr-nav-item:hover .mgr-nav-accent {
          transform: scaleY(1);
        }
        .mgr-sidebar-bottom {
          margin-top: auto;
          padding: 24px 28px 0;
          border-top: 1px solid #1A1A1A;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: #333;
          line-height: 1.8;
        }

        /* ── CONTENT ── */
        .mgr-content {
          display: grid;
          grid-template-rows: auto 1fr;
          overflow: hidden;
        }

        /* ── STATS ROW ── */
        .mgr-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 2px solid #E8E8E0;
        }
        .mgr-stat-card {
          padding: 32px 28px 24px;
          border-right: 1px solid #1E1E1E;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }
        .mgr-stat-card:last-child { border-right: none; }
        .mgr-stat-card:hover {
          background: #0F0F0F;
        }
        .mgr-stat-id {
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #333;
          margin-bottom: 20px;
        }
        .mgr-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px;
          line-height: 1;
          color: #E8E8E0;
          margin-bottom: 12px;
          transition: color 0.3s;
        }
        .mgr-stat-card:hover .mgr-stat-value {
          color: var(--accent);
        }
        .mgr-stat-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mgr-stat-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #555;
          font-weight: 500;
        }
        .mgr-stat-icon {
          opacity: 0.2;
          transition: opacity 0.2s;
        }
        .mgr-stat-card:hover .mgr-stat-icon {
          opacity: 0.7;
        }
        .mgr-stat-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .mgr-stat-card:hover .mgr-stat-bar {
          transform: scaleX(1);
        }

        /* ── LOWER AREA ── */
        .mgr-lower {
          display: grid;
          grid-template-columns: 1fr 320px;
          overflow: hidden;
        }

        /* ── STATUS PANEL ── */
        .mgr-status-panel {
          padding: 40px 40px;
          border-right: 1px solid #1E1E1E;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .mgr-panel-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #444;
          text-transform: uppercase;
          margin-bottom: -16px;
        }
        .mgr-panel-tag::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: #444;
        }
        .mgr-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6vw, 96px);
          line-height: 0.92;
          letter-spacing: -0.01em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .mgr-headline .mgr-hl-accent {
          color: #FF3B00;
          display: block;
        }
        .mgr-headline .mgr-hl-ok {
          color: #00FF88;
          display: block;
        }
        .mgr-subline {
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #555;
          line-height: 1.7;
          max-width: 420px;
        }
        .mgr-subline code {
          color: #FFD600;
          font-family: 'IBM Plex Mono', monospace;
        }

        /* ── LOG / TICKER ── */
        .mgr-log {
          border-top: 1px solid #1A1A1A;
          padding: 24px 40px;
        }
        .mgr-log-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #333;
          margin-bottom: 12px;
        }
        .mgr-log-lines {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mgr-log-line {
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #3A3A3A;
          display: flex;
          gap: 16px;
        }
        .mgr-log-line.active {
          color: #555;
        }
        .mgr-log-line.active .mgr-ll-status {
          color: #00FF88;
        }
        .mgr-ll-time { color: #FF3B00; min-width: 80px; }
        .mgr-ll-status { min-width: 60px; }

        /* ── RIGHT PANEL ── */
        .mgr-right {
          border-left: 1px solid #1A1A1A;
          display: flex;
          flex-direction: column;
        }
        .mgr-right-header {
          padding: 24px 28px;
          border-bottom: 1px solid #1A1A1A;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #333;
        }
        .mgr-meters {
          padding: 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }
        .mgr-meter {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mgr-meter-head {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          letter-spacing: 0.16em;
          color: #444;
        }
        .mgr-meter-val {
          color: #E8E8E0;
        }
        .mgr-meter-track {
          height: 2px;
          background: #1A1A1A;
          position: relative;
          overflow: hidden;
        }
        .mgr-meter-fill {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: var(--accent);
          transition: width 0.6s ease;
        }
        .mgr-right-footer {
          padding: 20px 28px;
          border-top: 1px solid #1A1A1A;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #2A2A2A;
          line-height: 2;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .mgr-main { grid-template-columns: 1fr; }
          .mgr-sidebar { display: none; }
          .mgr-stats { grid-template-columns: repeat(2, 1fr); }
          .mgr-lower { grid-template-columns: 1fr; }
          .mgr-right { display: none; }
        }
        @media (max-width: 640px) {
          .mgr-stats { grid-template-columns: 1fr 1fr; }
          .mgr-header { padding: 0 20px; }
          .mgr-status-center { display: none; }
        }

        /* ── SCANLINE OVERLAY ── */
        .mgr-root::after {
          content: '';
          pointer-events: none;
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.04) 2px,
            rgba(0,0,0,0.04) 4px
          );
          z-index: 100;
        }

        /* ── FADE IN ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mgr-stats, .mgr-status-panel, .mgr-sidebar {
          animation: fadeUp 0.5s ease both;
        }
        .mgr-stat-card:nth-child(1) { animation: fadeUp 0.4s 0.05s ease both; }
        .mgr-stat-card:nth-child(2) { animation: fadeUp 0.4s 0.10s ease both; }
        .mgr-stat-card:nth-child(3) { animation: fadeUp 0.4s 0.15s ease both; }
        .mgr-stat-card:nth-child(4) { animation: fadeUp 0.4s 0.20s ease both; }
      `}</style>

      <div className="mgr-root">
        {/* ── HEADER ── */}
        <header className="mgr-header">
          <div className="mgr-logo">
            <span className="mgr-logo-dot" />
            AI MANAGER
          </div>
          <div className="mgr-status-center">
            <span>SYS:</span>
            <span className="mgr-status-online">ONLINE</span>
            <span style={{ color: '#222' }}>·</span>
            <span>CYCLE: {tick}</span>
          </div>
          <div className="mgr-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <div className="mgr-main">
          {/* ── SIDEBAR ── */}
          <aside className="mgr-sidebar">
            <div className="mgr-sidebar-label">Navigation</div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mgr-nav-item"
                style={{ '--accent': link.accent } as React.CSSProperties}
              >
                <span className="mgr-nav-accent" />
                {link.label}
                <span className="mgr-nav-arrow" style={{ color: link.accent }}>→</span>
              </Link>
            ))}
            <div className="mgr-sidebar-bottom">
              BUILD: v1.0.0<br />
              ENV: PRODUCTION<br />
              UPTIME: NOMINAL
            </div>
          </aside>

          {/* ── CONTENT ── */}
          <div className="mgr-content">
            {/* Stats Row */}
            <div className="mgr-stats">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.id}
                    className="mgr-stat-card"
                    style={{ '--accent': card.accent } as React.CSSProperties}
                  >
                    <div className="mgr-stat-id">{card.id} ——</div>
                    <div className="mgr-stat-value">{String(card.value).padStart(2, '0')}</div>
                    <div className="mgr-stat-meta">
                      <span className="mgr-stat-label">{card.label}</span>
                      <Icon className="mgr-stat-icon" size={18} color={card.accent} />
                    </div>
                    <div className="mgr-stat-bar" />
                  </div>
                )
              })}
            </div>

            {/* Lower */}
            <div className="mgr-lower">
              {/* Status Panel */}
              <div className="mgr-status-panel">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="mgr-panel-tag">System Status</span>
                  <h2 className="mgr-headline">
                    {stats.needs_action === 0
                      ? <><span className="mgr-hl-ok">ALL</span>CLEAR</>
                      : <><span className="mgr-hl-accent">ACTION</span>NEEDED</>
                    }
                  </h2>
                </div>
                <p className="mgr-subline">
                  Monitoring active. AI polling every <code>5s</code>.
                  {stats.pending_approval > 0 && (
                    <> <code style={{ color: '#FF3B00' }}>{stats.pending_approval}</code> item{stats.pending_approval > 1 ? 's' : ''} awaiting your approval.</>
                  )}
                  {stats.needs_action === 0 && stats.pending_approval === 0 && (
                    <> All queues nominal. No intervention required.</>
                  )}
                </p>

                {/* Log */}
                <div className="mgr-log">
                  <div className="mgr-log-label">// ACTIVITY LOG</div>
                  <div className="mgr-log-lines">
                    {[
                      { t: time, msg: 'Heartbeat OK', s: 'PASS', active: true },
                      { t: '—', msg: 'Stats fetched', s: 'OK', active: true },
                      { t: '—', msg: 'Queue scanned', s: 'OK', active: false },
                      { t: '—', msg: 'Agent idle', s: '...', active: false },
                    ].map((l, i) => (
                      <div key={i} className={`mgr-log-line ${l.active ? 'active' : ''}`}>
                        <span className="mgr-ll-time">{l.t}</span>
                        <span className="mgr-ll-status">[{l.s}]</span>
                        <span>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="mgr-right">
                <div className="mgr-right-header">// QUEUE METERS</div>
                <div className="mgr-meters">
                  {[
                    { label: 'TASKS', val: stats.needs_action, max: 20, accent: '#FF3B00' },
                    { label: 'PLANS',    val: stats.plans, max: 10, accent: '#FFD600' },
                    { label: 'DONE',     val: stats.done, max: 50, accent: '#00FF88' },
                    { label: 'APPROVAL', val: stats.pending_approval, max: 10, accent: '#0088FF' },
                  ].map((m) => (
                    <div key={m.label} className="mgr-meter">
                      <div className="mgr-meter-head">
                        <span>{m.label}</span>
                        <span className="mgr-meter-val" style={{ color: m.accent }}>
                          {m.val}/{m.max}
                        </span>
                      </div>
                      <div className="mgr-meter-track">
                        <div
                          className="mgr-meter-fill"
                          style={{
                            '--accent': m.accent,
                            width: `${Math.min(100, (m.val / m.max) * 100)}%`
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mgr-right-footer">
                  NODE: localhost:8000<br />
                  POLL: 5000ms<br />
                  STATE: LIVE<br />
                  © AI MANAGER v1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
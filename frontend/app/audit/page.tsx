'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuditPage() {
  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    fetchLatestAudit()
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const fetchLatestAudit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/audit/latest')
      if (res.ok) {
        const data = await res.json()
        setAudit(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewAudit = async () => {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:8000/api/audit/generate', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.status === 'success') {
        setAudit(data)
        alert('✅ New audit generated!')
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('❌ Failed to generate audit')
    } finally {
      setGenerating(false)
    }
  }

  const formatMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="audit-h1">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="audit-h2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="audit-h3">$1</h3>')
      .replace(/^\*\*(.+?)\*\*/gm, '<strong class="audit-strong">$1</strong>')
      .replace(/^- (.+$)/gm, '<li class="audit-li">• $1</li>')
      .replace(/^\d+\. (.+$)/gm, '<li class="audit-li audit-li-num">$1</li>')
      .replace(/---/g, '<hr class="audit-hr" />')
  }

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

        .audit-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .audit-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .audit-back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: 1px solid #333;
          color: #666;
          text-decoration: none;
          transition: all 0.2s;
        }
        .audit-back:hover {
          border-color: #00FF88;
          color: #00FF88;
          background: #00FF88/5;
        }
        .audit-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .audit-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .audit-tag {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #00FF88;
          padding: 4px 12px;
          border: 1px solid #00FF88;
          background: #00FF88/10;
        }
        .audit-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }
        .audit-gen-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border: 2px solid #FF3B00;
          background: transparent;
          color: #FF3B00;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .audit-gen-btn:hover:not(:disabled) {
          background: #FF3B00;
          color: #0A0A0A;
        }
        .audit-gen-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }
        .audit-gen-icon {
          transition: transform 0.3s;
        }
        .audit-gen-btn:disabled .audit-gen-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── MAIN ── */
        .audit-main {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── LOADING STATE ── */
        .audit-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }
        .audit-loading-icon {
          animation: spin 1.2s linear infinite;
        }
        .audit-loading-text {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── STATS GRID ── */
        .audit-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
          margin-bottom: 40px;
        }
        .audit-stat {
          background: #0A0A0A;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }
        .audit-stat:hover {
          background: #0F0F0F;
        }
        .audit-stat::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .audit-stat:hover::before {
          transform: scaleX(1);
        }
        .audit-stat-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .audit-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          line-height: 1;
          color: #E8E8E0;
          margin-bottom: 8px;
        }
        .audit-stat-meta {
          font-size: 9px;
          letter-spacing: 0.08em;
          color: #555;
        }

        /* ── REPORT CONTAINER ── */
        .audit-report {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
        }
        .audit-report-header {
          padding: 24px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .audit-report-label {
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #555;
          text-transform: uppercase;
        }
        .audit-report-id {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: #333;
        }
        .audit-report-content {
          padding: 40px 32px;
        }

        /* ── MARKDOWN STYLES ── */
        .audit-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: #E8E8E0;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .audit-h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          line-height: 1.2;
          letter-spacing: 0.04em;
          color: #E8E8E0;
          margin-top: 48px;
          margin-bottom: 20px;
          padding-left: 16px;
          border-left: 3px solid #FF3B00;
        }
        .audit-h3 {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #00FF88;
          margin-top: 32px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .audit-strong {
          color: #FFD600;
          font-weight: 700;
        }
        .audit-li {
          font-size: 13px;
          line-height: 1.8;
          color: #999;
          margin-bottom: 8px;
          padding-left: 24px;
        }
        .audit-li-num {
          counter-increment: list;
        }
        .audit-li-num::before {
          content: counter(list) '. ';
          color: #FF3B00;
          margin-left: -24px;
          margin-right: 8px;
        }
        .audit-hr {
          border: none;
          border-top: 1px solid #1A1A1A;
          margin: 40px 0;
        }

        /* ── FOOTER ── */
        .audit-report-footer {
          padding: 24px 32px;
          border-top: 1px solid #1E1E1E;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .audit-download-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border: 1px solid #0088FF;
          background: transparent;
          color: #0088FF;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .audit-download-btn:hover {
          background: #0088FF;
          color: #0A0A0A;
        }
        .audit-footer-meta {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #333;
        }

        /* ── EMPTY STATE ── */
        .audit-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          gap: 24px;
          border: 1px solid #1E1E1E;
        }
        .audit-empty-icon {
          color: #FFD600;
        }
        .audit-empty-text {
          font-size: 11px;
          letter-spacing: 0.14em;
          color: #555;
          text-transform: uppercase;
        }
        .audit-empty-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border: 2px solid #FF3B00;
          background: transparent;
          color: #FF3B00;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .audit-empty-btn:hover {
          background: #FF3B00;
          color: #0A0A0A;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .audit-stats { grid-template-columns: 1fr; }
          .audit-header { 
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .audit-time { display: none; }
          .audit-gen-btn { padding: 12px 20px; font-size: 9px; }
        }

        /* ── SCANLINE ── */
        .audit-root::after {
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
        .audit-stats, .audit-report, .audit-empty {
          animation: fadeUp 0.5s ease both;
        }
      `}</style>

      <div className="audit-root">
        {/* ── HEADER ── */}
        <header className="audit-header">
          <Link href="/" className="audit-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="audit-title-area">
            <h1 className="audit-title">CEO AUDIT REPORT</h1>
            <span className="audit-tag">WEEKLY</span>
          </div>

          <div className="audit-time">{time}</div>

          <button
            onClick={generateNewAudit}
            disabled={generating}
            className="audit-gen-btn"
          >
            <RefreshCw size={16} className="audit-gen-icon" />
            {generating ? 'GENERATING...' : 'NEW AUDIT'}
          </button>
        </header>

        {/* ── MAIN ── */}
        <main className="audit-main">
          {loading ? (
            <div className="audit-loading">
              <RefreshCw className="audit-loading-icon" size={48} color="#0088FF" />
              <p className="audit-loading-text">Loading Audit Data...</p>
            </div>
          ) : audit ? (
            <>
              {/* Stats Grid */}
              <div className="audit-stats">
                <div className="audit-stat" style={{ '--accent': '#00FF88' } as React.CSSProperties}>
                  <div className="audit-stat-label">Revenue This Week</div>
                  <div className="audit-stat-value">$2,450</div>
                  <div className="audit-stat-meta">+16.7% vs last week</div>
                </div>
                
                <div className="audit-stat" style={{ '--accent': '#0088FF' } as React.CSSProperties}>
                  <div className="audit-stat-label">Tasks Completed</div>
                  <div className="audit-stat-value">12</div>
                  <div className="audit-stat-meta">This week</div>
                </div>
                
                <div className="audit-stat" style={{ '--accent': '#FF00AA' } as React.CSSProperties}>
                  <div className="audit-stat-label">Social Posts</div>
                  <div className="audit-stat-value">3</div>
                  <div className="audit-stat-meta">LinkedIn</div>
                </div>
              </div>

              {/* Report */}
              <div className="audit-report">
                <div className="audit-report-header">
                  <span className="audit-report-label">// Executive Summary</span>
                  <span className="audit-report-id">ID: {audit.filename?.replace('.md', '') || 'AUDIT-001'}</span>
                </div>

                <div 
                  className="audit-report-content"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(audit.content) 
                  }}
                />

                <div className="audit-report-footer">
                  <button
                    onClick={() => {
                      const blob = new Blob([audit.content], { type: 'text/markdown' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = audit.filename
                      a.click()
                    }}
                    className="audit-download-btn"
                  >
                    <FileText size={16} />
                    Download Report
                  </button>
                  <div className="audit-footer-meta">
                    GENERATED: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }).toUpperCase()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="audit-empty">
              <AlertTriangle className="audit-empty-icon" size={56} />
              <p className="audit-empty-text">No Audit Reports Found</p>
              <button onClick={generateNewAudit} className="audit-empty-btn">
                Generate First Audit
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

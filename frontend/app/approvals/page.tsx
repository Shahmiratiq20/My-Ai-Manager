'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Approval {
  id: string
  name: string
  content: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/approvals')
        const data = await res.json()
        setApprovals(data)
      } catch (error) {
        console.error('Failed to fetch approvals:', error)
      }
    }

    fetchApprovals()
    const interval = setInterval(fetchApprovals, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/approve/${id}`, { method: 'POST' })
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/reject/${id}`, { method: 'POST' })
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to reject:', error)
    }
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

        .approvals-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .approvals-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .approvals-back {
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
        .approvals-back:hover {
          border-color: #FFD600;
          color: #FFD600;
          background: #FFD600/5;
        }
        .approvals-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .approvals-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .approvals-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          background: #FFD600;
          color: #0A0A0A;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          line-height: 1;
        }
        .approvals-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .approvals-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── EMPTY STATE ── */
        .approvals-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          gap: 24px;
          border: 1px solid #1E1E1E;
        }
        .approvals-empty-icon {
          font-size: 64px;
        }
        .approvals-empty-text {
          font-size: 14px;
          letter-spacing: 0.12em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── APPROVAL CARDS ── */
        .approvals-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .approval-card {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          position: relative;
          overflow: hidden;
          animation: slideIn 0.4s ease both;
        }
        .approval-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #FFD600;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ── CARD HEADER ── */
        .approval-header {
          padding: 24px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .approval-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .approval-id {
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #333;
        }

        /* ── CARD CONTENT ── */
        .approval-content {
          padding: 32px;
          background: #0F0F0F;
        }
        .approval-pre {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          line-height: 1.8;
          color: #888;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
          padding: 20px;
          background: #0A0A0A;
          border: 1px solid #1A1A1A;
        }
        .approval-pre::-webkit-scrollbar {
          width: 8px;
        }
        .approval-pre::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        .approval-pre::-webkit-scrollbar-thumb {
          background: #1E1E1E;
          border: 2px solid #0A0A0A;
        }
        .approval-pre::-webkit-scrollbar-thumb:hover {
          background: #2A2A2A;
        }

        /* ── CARD ACTIONS ── */
        .approval-actions {
          padding: 24px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border-top: 1px solid #1E1E1E;
        }
        .approval-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border: 2px solid;
          background: transparent;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        .approval-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: currentColor;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .approval-btn:hover::before {
          opacity: 0.1;
        }
        .approval-btn > * {
          position: relative;
          z-index: 1;
        }
        
        .approval-btn-approve {
          border-color: #00FF88;
          color: #00FF88;
        }
        .approval-btn-approve:hover {
          background: #00FF88;
          color: #0A0A0A;
        }
        
        .approval-btn-reject {
          border-color: #FF3B00;
          color: #FF3B00;
        }
        .approval-btn-reject:hover {
          background: #FF3B00;
          color: #0A0A0A;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .approvals-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .approvals-time { display: none; }
          .approvals-main { padding: 20px; }
          .approval-actions {
            grid-template-columns: 1fr;
          }
        }

        /* ── SCANLINE ── */
        .approvals-root::after {
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
      `}</style>

      <div className="approvals-root">
        {/* ── HEADER ── */}
        <header className="approvals-header">
          <Link href="/" className="approvals-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="approvals-title-area">
            <h1 className="approvals-title">PENDING APPROVALS</h1>
            <div className="approvals-count">{approvals.length}</div>
          </div>

          <div className="approvals-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="approvals-main">
          {approvals.length === 0 ? (
            <div className="approvals-empty">
              <div className="approvals-empty-icon">✓</div>
              <p className="approvals-empty-text">All Clear — No Pending Approvals</p>
            </div>
          ) : (
            <div className="approvals-grid">
              {approvals.map((approval, index) => (
                <div
                  key={approval.id}
                  className="approval-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="approval-header">
                    <div className="approval-name">{approval.name}</div>
                    <div className="approval-id">ID: {approval.id}</div>
                  </div>

                  <div className="approval-content">
                    <pre className="approval-pre">{approval.content}</pre>
                  </div>

                  <div className="approval-actions">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="approval-btn approval-btn-approve"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="approval-btn approval-btn-reject"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

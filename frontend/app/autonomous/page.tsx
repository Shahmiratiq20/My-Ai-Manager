'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Activity, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  content: string
}

export default function AutonomousPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<any>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    fetchTasks()
    fetchStatus()
    
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tasks')
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/autonomous/status')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const startAutonomous = async (taskId: string) => {
    setProcessing(taskId)
    
    try {
      const res = await fetch('http://localhost:8000/api/autonomous/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task_id: taskId,
          max_iterations: 5
        })
      })
      
      const data = await res.json()
      
      if (data.status === 'completed') {
        alert('✅ Task completed autonomously!')
      } else {
        alert('⚠️ Task needs manual review')
      }
      
      fetchTasks()
      fetchStatus()
      
    } catch (error) {
      console.error('Autonomous processing error:', error)
      alert('❌ Processing failed')
    } finally {
      setProcessing(null)
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

        .auto-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .auto-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .auto-back {
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
        .auto-back:hover {
          border-color: #FF00AA;
          color: #FF00AA;
          background: #FF00AA/5;
        }
        .auto-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .auto-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .auto-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #FF00AA;
          padding: 4px 12px;
          border: 1px solid #FF00AA;
          background: #FF00AA/10;
        }
        .auto-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .auto-main {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── STATS GRID ── */
        .auto-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
          margin-bottom: 40px;
        }
        .auto-stat {
          background: #0A0A0A;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }
        .auto-stat:hover {
          background: #0F0F0F;
        }
        .auto-stat::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .auto-stat:hover::before {
          transform: scaleX(1);
        }
        .auto-stat-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .auto-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          line-height: 1;
          color: #E8E8E0;
          margin-bottom: 10px;
        }
        .auto-stat-meta {
          font-size: 9px;
          letter-spacing: 0.08em;
          color: #555;
        }

        /* ── INFO PANEL ── */
        .auto-info {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          margin-bottom: 40px;
        }
        .auto-info-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auto-info-icon {
          font-size: 18px;
        }
        .auto-info-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .auto-info-content {
          padding: 32px;
        }
        .auto-info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auto-info-item {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 16px;
          font-size: 12px;
          line-height: 1.7;
          color: #888;
        }
        .auto-info-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #FF00AA;
          color: #FF00AA;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
        }

        /* ── ACTIVE PROCESSING ── */
        .auto-active {
          border: 1px solid #FF6B00;
          background: #0A0A0A;
          margin-bottom: 40px;
          animation: fadeUp 0.5s ease both;
        }
        .auto-active-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auto-active-icon {
          color: #FF6B00;
        }
        .auto-active-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .auto-active-content {
          padding: 24px 32px;
        }
        .auto-active-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auto-active-task {
          padding: 16px 20px;
          border: 1px solid #1E1E1E;
          background: #0F0F0F;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .auto-pulse {
          width: 8px;
          height: 8px;
          background: #FF6B00;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
        .auto-active-name {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          color: #E8E8E0;
        }
        .auto-active-status {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #666;
        }

        /* ── TASKS SECTION ── */
        .auto-tasks {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
        }
        .auto-tasks-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .auto-tasks-content {
          padding: 24px 32px;
        }

        /* ── EMPTY STATE ── */
        .auto-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 20px;
        }
        .auto-empty-icon {
          color: #00FF88;
        }
        .auto-empty-text {
          font-size: 11px;
          letter-spacing: 0.14em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── TASK CARDS ── */
        .auto-task-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auto-task-card {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: start;
          transition: border-color 0.2s;
          animation: slideIn 0.4s ease both;
        }
        .auto-task-card:hover {
          border-color: #FF00AA;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auto-task-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auto-task-name {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #E8E8E0;
        }
        .auto-task-content {
          font-size: 11px;
          line-height: 1.7;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .auto-task-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border: 2px solid #FF00AA;
          background: transparent;
          color: #FF00AA;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .auto-task-btn:hover:not(:disabled) {
          background: #FF00AA;
          color: #0A0A0A;
        }
        .auto-task-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }
        .auto-task-btn-icon {
          transition: transform 0.3s;
        }
        .auto-task-btn:disabled .auto-task-btn-icon {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .auto-stats { grid-template-columns: 1fr; }
          .auto-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .auto-time { display: none; }
          .auto-main { padding: 20px; }
          .auto-task-card {
            grid-template-columns: 1fr;
          }
        }

        /* ── SCANLINE ── */
        .auto-root::after {
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

        /* ── FADE UP ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auto-stats, .auto-info, .auto-tasks {
          animation: fadeUp 0.5s ease both;
        }
      `}</style>

      <div className="auto-root">
        {/* ── HEADER ── */}
        <header className="auto-header">
          <Link href="/" className="auto-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="auto-title-area">
            <h1 className="auto-title">AUTONOMOUS PROCESSING</h1>
            <span className="auto-badge">AI AGENT</span>
          </div>

          <div className="auto-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="auto-main">
          {/* Stats Grid */}
          <div className="auto-stats">
            <div className="auto-stat" style={{ '--accent': '#FF00AA' } as React.CSSProperties}>
              <div className="auto-stat-label">Active Processing</div>
              <div className="auto-stat-value">{String(status?.active || 0).padStart(2, '0')}</div>
              <div className="auto-stat-meta">Tasks in progress</div>
            </div>
            
            <div className="auto-stat" style={{ '--accent': '#0088FF' } as React.CSSProperties}>
              <div className="auto-stat-label">Available Tasks</div>
              <div className="auto-stat-value">{String(tasks.length).padStart(2, '0')}</div>
              <div className="auto-stat-meta">Ready for processing</div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="auto-info">
            <div className="auto-info-header">
              <span className="auto-info-icon">🤖</span>
              <h2 className="auto-info-title">How Autonomous Processing Works</h2>
            </div>
            <div className="auto-info-content">
              <div className="auto-info-list">
                <div className="auto-info-item">
                  <div className="auto-info-num">1</div>
                  <div>AI analyzes the task and creates an action plan</div>
                </div>
                <div className="auto-info-item">
                  <div className="auto-info-num">2</div>
                  <div>Iteratively works on the task (up to 5 iterations)</div>
                </div>
                <div className="auto-info-item">
                  <div className="auto-info-num">3</div>
                  <div>Marks task complete when finished or flags for review</div>
                </div>
                <div className="auto-info-item">
                  <div className="auto-info-num">4</div>
                  <div>Generates detailed execution report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Tasks */}
          {status?.tasks && status.tasks.length > 0 && (
            <div className="auto-active">
              <div className="auto-active-header">
                <Clock className="auto-active-icon" size={20} />
                <h2 className="auto-active-title">Currently Processing</h2>
              </div>
              <div className="auto-active-content">
                <div className="auto-active-list">
                  {status.tasks.map((task: any) => (
                    <div key={task.id} className="auto-active-task">
                      <div className="auto-pulse" />
                      <div className="auto-active-name">{task.name}</div>
                      <div className="auto-active-status">PROCESSING...</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Tasks */}
          <div className="auto-tasks">
            <div className="auto-tasks-header">Available Tasks</div>
            
            <div className="auto-tasks-content">
              {tasks.length === 0 ? (
                <div className="auto-empty">
                  <CheckCircle className="auto-empty-icon" size={56} />
                  <p className="auto-empty-text">No Tasks Available for Processing</p>
                </div>
              ) : (
                <div className="auto-task-grid">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="auto-task-card"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="auto-task-info">
                        <div className="auto-task-name">{task.name}</div>
                        <div className="auto-task-content">{task.content}</div>
                      </div>
                      
                      <button
                        onClick={() => startAutonomous(task.id)}
                        disabled={processing === task.id}
                        className="auto-task-btn"
                      >
                        {processing === task.id ? (
                          <>
                            <Activity className="auto-task-btn-icon" size={16} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Start Auto
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  )
}

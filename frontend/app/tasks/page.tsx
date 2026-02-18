'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, File } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  content: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/tasks')
        const data = await res.json()
        setTasks(data)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

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

        .tasks-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .tasks-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .tasks-back {
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
        .tasks-back:hover {
          border-color: #FF3B00;
          color: #FF3B00;
          background: #FF3B00/5;
        }
        .tasks-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .tasks-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .tasks-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          background: #FF3B00;
          color: #0A0A0A;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          line-height: 1;
        }
        .tasks-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .tasks-main {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── EMPTY STATE ── */
        .tasks-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          gap: 24px;
          border: 1px solid #1E1E1E;
        }
        .tasks-empty-icon {
          font-size: 64px;
        }
        .tasks-empty-text {
          font-size: 14px;
          letter-spacing: 0.12em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── TASK GRID ── */
        .tasks-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── TASK CARD ── */
        .task-card {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
          animation: slideIn 0.4s ease both;
        }
        .task-card:hover {
          border-color: #FF3B00;
        }
        .task-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ── CARD HEADER ── */
        .task-header {
          padding: 24px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .task-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          border-color: var(--accent);
          background: var(--accent-bg);
        }
        .task-icon {
          color: var(--accent);
        }
        .task-meta {
          flex: 1;
        }
        .task-name {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #E8E8E0;
          margin-bottom: 6px;
        }
        .task-id {
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #444;
        }

        /* ── CARD CONTENT ── */
        .task-content {
          padding: 28px 32px;
          background: #0F0F0F;
        }
        .task-text {
          font-size: 12px;
          line-height: 1.8;
          color: #888;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
        .task-text::-webkit-scrollbar {
          width: 6px;
        }
        .task-text::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        .task-text::-webkit-scrollbar-thumb {
          background: #1E1E1E;
        }
        .task-text::-webkit-scrollbar-thumb:hover {
          background: #2A2A2A;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .tasks-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .tasks-time { display: none; }
          .tasks-main { padding: 20px; }
        }

        /* ── SCANLINE ── */
        .tasks-root::after {
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
      `}</style>

      <div className="tasks-root">
        {/* ── HEADER ── */}
        <header className="tasks-header">
          <Link href="/" className="tasks-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="tasks-title-area">
            <h1 className="tasks-title">PENDING TASKS</h1>
            <div className="tasks-count">{tasks.length}</div>
          </div>

          <div className="tasks-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="tasks-main">
          {tasks.length === 0 ? (
            <div className="tasks-empty">
              <div className="tasks-empty-icon">✓</div>
              <p className="tasks-empty-text">All Clear — No Pending Tasks</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task, index) => {
                const isEmail = task.name.toUpperCase().includes('EMAIL')
                const accent = isEmail ? '#0088FF' : '#FF00AA'
                const Icon = isEmail ? Mail : File
                
                return (
                  <div
                    key={task.id}
                    className="task-card"
                    style={{ 
                      '--accent': accent,
                      '--accent-bg': `${accent}10`,
                      animationDelay: `${index * 0.05}s`
                    } as React.CSSProperties}
                  >
                    <div className="task-header">
                      <div className="task-icon-wrapper">
                        <Icon className="task-icon" size={24} />
                      </div>
                      <div className="task-meta">
                        <div className="task-name">{task.name}</div>
                        <div className="task-id">ID: {task.id}</div>
                      </div>
                    </div>

                    <div className="task-content">
                      <div className="task-text">{task.content}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

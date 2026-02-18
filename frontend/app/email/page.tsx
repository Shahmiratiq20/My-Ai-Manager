'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function EmailPage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Please fill all fields')
      return
    }

    setSending(true)
    try {
      const res = await fetch('http://localhost:8000/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
      })
      const data = await res.json()

      if (data.status === 'success') {
        alert('✅ Email sent successfully!')
        setTo('')
        setSubject('')
        setBody('')
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('❌ Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const handleGenerateReply = async () => {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:8000/api/email/reply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: body,
          tone: 'professional'
        })
      })
      const data = await res.json()

      if (data.reply) {
        setBody(data.reply)
      }
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const templates = [
    {
      name: 'Invoice Request',
      desc: 'Ask for invoice',
      subject: 'Invoice Request',
      body: 'Hi,\n\nCould you please send me the invoice for our recent project?\n\nThank you!'
    },
    {
      name: 'Meeting Follow-up',
      desc: 'Summarize meeting',
      subject: 'Meeting Follow-up',
      body: 'Hi,\n\nThank you for the productive meeting today. Here are the action items we discussed:\n\n1. [Action 1]\n2. [Action 2]\n\nLooking forward to our next steps.'
    },
    {
      name: 'Thank You',
      desc: 'Express gratitude',
      subject: 'Thank You',
      body: 'Hi,\n\nI wanted to take a moment to thank you for your help with [project/task]. Your expertise made a significant difference.\n\nBest regards'
    },
    {
      name: 'Project Update',
      desc: 'Status report',
      subject: 'Project Update',
      body: 'Hi,\n\nHere\'s the latest update on our project:\n\nCompleted:\n- [Task 1]\n- [Task 2]\n\nNext Steps:\n- [Task 3]\n\nLet me know if you have any questions.'
    }
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

        .email-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .email-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .email-back {
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
        .email-back:hover {
          border-color: #0088FF;
          color: #0088FF;
          background: #0088FF/5;
        }
        .email-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .email-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .email-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #0088FF;
          padding: 4px 12px;
          border: 1px solid #0088FF;
          background: #0088FF/10;
        }
        .email-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .email-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── COMPOSE FORM ── */
        .email-compose {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          margin-bottom: 40px;
          animation: fadeUp 0.5s ease both;
        }
        .email-compose-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .email-compose-content {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── FIELD GROUP ── */
        .email-field {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .email-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #666;
          text-transform: uppercase;
        }
        .email-input {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 14px 20px;
          outline: none;
          transition: border-color 0.2s;
        }
        .email-input::placeholder {
          color: #444;
        }
        .email-input:focus {
          border-color: #0088FF;
        }
        .email-textarea {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 20px;
          outline: none;
          resize: vertical;
          min-height: 280px;
          transition: border-color 0.2s;
          line-height: 1.8;
        }
        .email-textarea::placeholder {
          color: #444;
        }
        .email-textarea:focus {
          border-color: #0088FF;
        }

        /* ── FIELD HEADER ── */
        .email-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .email-ai-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #FF00AA;
          background: transparent;
          color: #FF00AA;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .email-ai-btn:hover:not(:disabled) {
          background: #FF00AA;
          color: #0A0A0A;
        }
        .email-ai-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }

        /* ── ACTION BUTTONS ── */
        .email-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          padding-top: 8px;
        }
        .email-send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border: 2px solid #00FF88;
          background: transparent;
          color: #00FF88;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .email-send-btn:hover:not(:disabled) {
          background: #00FF88;
          color: #0A0A0A;
        }
        .email-send-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }
        .email-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          border: 1px solid #FF3B00;
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
        .email-clear-btn:hover {
          background: #FF3B00;
          color: #0A0A0A;
        }

        /* ── TEMPLATES ── */
        .email-templates {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .email-templates-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .email-templates-content {
          padding: 24px 32px;
        }
        .email-templates-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .email-template-card {
          padding: 20px;
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .email-template-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: #0088FF;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .email-template-card:hover {
          background: #0F0F0F;
          border-color: #0088FF;
        }
        .email-template-card:hover::before {
          transform: scaleX(1);
        }
        .email-template-name {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #E8E8E0;
          margin-bottom: 8px;
        }
        .email-template-desc {
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #666;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .email-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .email-time { display: none; }
          .email-main { padding: 20px; }
          .email-templates-grid { grid-template-columns: 1fr; }
          .email-actions { grid-template-columns: 1fr; }
        }

        /* ── SCANLINE ── */
        .email-root::after {
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

      <div className="email-root">
        {/* ── HEADER ── */}
        <header className="email-header">
          <Link href="/" className="email-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="email-title-area">
            <h1 className="email-title">SEND EMAIL</h1>
            <span className="email-badge">COMPOSE</span>
          </div>

          <div className="email-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="email-main">
          {/* Compose Form */}
          <div className="email-compose">
            <div className="email-compose-header">// New Message</div>
            
            <div className="email-compose-content">
              {/* To Field */}
              <div className="email-field">
                <label className="email-label">To:</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="email-input"
                />
              </div>

              {/* Subject Field */}
              <div className="email-field">
                <label className="email-label">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="email-input"
                />
              </div>

              {/* Body Field */}
              <div className="email-field">
                <div className="email-field-header">
                  <label className="email-label">Message:</label>
                  <button
                    onClick={handleGenerateReply}
                    disabled={generating || !body}
                    className="email-ai-btn"
                  >
                    <Sparkles size={14} />
                    {generating ? 'Generating...' : 'AI Polish'}
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message or paste an email to generate AI reply..."
                  className="email-textarea"
                />
              </div>

              {/* Actions */}
              <div className="email-actions">
                <button
                  onClick={handleSend}
                  disabled={sending || !to || !subject || !body}
                  className="email-send-btn"
                >
                  <Send size={18} />
                  {sending ? 'Sending...' : 'Send Email'}
                </button>

                <button
                  onClick={() => {
                    setTo('')
                    setSubject('')
                    setBody('')
                  }}
                  className="email-clear-btn"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="email-templates">
            <div className="email-templates-header">// Quick Templates</div>
            
            <div className="email-templates-content">
              <div className="email-templates-grid">
                {templates.map((template, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSubject(template.subject)
                      setBody(template.body)
                    }}
                    className="email-template-card"
                  >
                    <div className="email-template-name">{template.name}</div>
                    <div className="email-template-desc">{template.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Bot, User } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')

  useState(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  })

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages([...messages, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error connecting to AI' }])
    } finally {
      setLoading(false)
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

        .chat-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .chat-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .chat-back {
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
        .chat-back:hover {
          border-color: #00FF88;
          color: #00FF88;
          background: #00FF88/5;
        }
        .chat-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .chat-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .chat-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #00FF88;
          padding: 4px 12px;
          border: 1px solid #00FF88;
          background: #00FF88/10;
        }
        .chat-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .chat-main {
          display: grid;
          grid-template-rows: 1fr auto;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          height: calc(100vh - 72px);
        }

        /* ── MESSAGES AREA ── */
        .chat-messages {
          overflow-y: auto;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #1E1E1E;
          border: 2px solid #0A0A0A;
        }
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #2A2A2A;
        }

        /* ── EMPTY STATE ── */
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 24px;
        }
        .chat-empty-icon {
          color: #00FF88;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .chat-empty-text {
          font-size: 11px;
          letter-spacing: 0.14em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── MESSAGE BUBBLE ── */
        .chat-msg {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          animation: slideIn 0.3s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg-user {
          flex-direction: row-reverse;
        }

        .chat-msg-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }
        .chat-msg-icon-assistant {
          border-color: #00FF88;
          color: #00FF88;
          background: #00FF88/5;
        }
        .chat-msg-icon-user {
          border-color: #0088FF;
          color: #0088FF;
          background: #0088FF/5;
        }

        .chat-msg-bubble {
          max-width: 70%;
          padding: 20px 24px;
          font-size: 13px;
          line-height: 1.7;
          position: relative;
        }
        .chat-msg-bubble-assistant {
          border: 1px solid #1E1E1E;
          background: #0F0F0F;
          color: #CCC;
        }
        .chat-msg-bubble-assistant::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #00FF88;
        }
        .chat-msg-bubble-user {
          border: 1px solid #0088FF;
          background: #0088FF/10;
          color: #E8E8E0;
        }
        .chat-msg-bubble-user::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #0088FF;
        }

        /* ── LOADING ── */
        .chat-loading {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .chat-loading-bubble {
          padding: 20px 24px;
          border: 1px solid #1E1E1E;
          background: #0F0F0F;
          display: flex;
          gap: 8px;
        }
        .chat-loading-dot {
          width: 6px;
          height: 6px;
          background: #00FF88;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }
        .chat-loading-dot:nth-child(1) { animation-delay: 0s; }
        .chat-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }

        /* ── INPUT AREA ── */
        .chat-input-area {
          border-top: 2px solid #E8E8E0;
          padding: 24px 40px;
          background: #0A0A0A;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
        }
        .chat-input {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 18px 24px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input::placeholder {
          color: #444;
        }
        .chat-input:focus {
          border-color: #00FF88;
        }
        .chat-send-btn {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #00FF88;
          background: transparent;
          color: #00FF88;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-send-btn:hover:not(:disabled) {
          background: #00FF88;
          color: #0A0A0A;
        }
        .chat-send-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .chat-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .chat-time { display: none; }
          .chat-messages { padding: 20px; }
          .chat-input-area { padding: 16px 20px; }
          .chat-msg-bubble { max-width: 85%; }
        }

        /* ── SCANLINE ── */
        .chat-root::after {
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

      <div className="chat-root">
        {/* ── HEADER ── */}
        <header className="chat-header">
          <Link href="/" className="chat-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="chat-title-area">
            <h1 className="chat-title">AI CHAT</h1>
            <span className="chat-badge">LIVE</span>
          </div>

          <div className="chat-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="chat-main">
          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <Bot className="chat-empty-icon" size={64} />
                <p className="chat-empty-text">Start a conversation with your AI Employee</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : ''}`}
                  >
                    <div className={`chat-msg-icon ${msg.role === 'assistant' ? 'chat-msg-icon-assistant' : 'chat-msg-icon-user'}`}>
                      {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div className={`chat-msg-bubble ${msg.role === 'assistant' ? 'chat-msg-bubble-assistant' : 'chat-msg-bubble-user'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="chat-loading">
                    <div className="chat-msg-icon chat-msg-icon-assistant">
                      <Bot size={20} />
                    </div>
                    <div className="chat-loading-bubble">
                      <div className="chat-loading-dot" />
                      <div className="chat-loading-dot" />
                      <div className="chat-loading-dot" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your AI Employee..."
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="chat-send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        </main>
      </div>
    </>
  )
}

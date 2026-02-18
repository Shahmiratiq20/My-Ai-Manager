'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, Send, Facebook, Instagram, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function SocialMediaPage() {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'twitter'>('facebook')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:8000/api/facebook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })
      const data = await res.json()
      setContent(data.content || data.error)
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handlePost = async () => {
    setPosting(true)
    
    try {
      let endpoint = ''
      let body: any = {}

      if (platform === 'facebook') {
        endpoint = 'http://localhost:8000/api/facebook/post'
        body = { message: content, image_url: imageUrl || undefined, link: link || undefined }
      } else if (platform === 'instagram') {
        if (!imageUrl) {
          alert('❌ Instagram requires an image!')
          setPosting(false)
          return
        }
        endpoint = 'http://localhost:8000/api/instagram/post'
        body = { image_url: imageUrl, caption: content }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()

      if (data.status === 'success') {
        alert(`✅ Posted to ${platform}!`)
        setContent('')
        setImageUrl('')
        setLink('')
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Post error:', error)
      alert('❌ Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const platforms = [
    { id: 'facebook' as const, name: 'Facebook', icon: Facebook, color: '#0088FF', available: true },
    { id: 'instagram' as const, name: 'Instagram', icon: Instagram, color: '#FF00AA', available: true },
    { id: 'twitter' as const, name: 'Twitter', icon: Twitter, color: '#666', available: false },
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

        .social-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .social-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .social-back {
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
        .social-back:hover {
          border-color: #FF00AA;
          color: #FF00AA;
          background: #FF00AA/5;
        }
        .social-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .social-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .social-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #FF00AA;
          padding: 4px 12px;
          border: 1px solid #FF00AA;
          background: #FF00AA/10;
        }
        .social-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .social-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── SECTION ── */
        .social-section {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both;
        }
        .social-section-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .social-section-content {
          padding: 32px;
        }

        /* ── PLATFORM SELECTOR ── */
        .social-platforms {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .social-platform {
          padding: 28px 20px;
          border: 2px solid #1E1E1E;
          background: #0A0A0A;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .social-platform::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--color);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .social-platform:hover:not(:disabled)::before {
          transform: scaleX(1);
        }
        .social-platform.active {
          border-color: var(--color);
          background: var(--color-bg);
        }
        .social-platform.active::before {
          transform: scaleX(1);
        }
        .social-platform:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .social-platform-icon {
          color: var(--color);
        }
        .social-platform-name {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #E8E8E0;
        }
        .social-platform-status {
          font-size: 8px;
          letter-spacing: 0.12em;
          color: #444;
          text-transform: uppercase;
        }

        /* ── GENERATE BUTTON ── */
        .social-gen-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border: 2px solid #FF00AA;
          background: transparent;
          color: #FF00AA;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .social-gen-btn:hover:not(:disabled) {
          background: #FF00AA;
          color: #0A0A0A;
        }
        .social-gen-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }

        /* ── FIELD ── */
        .social-field {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .social-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #666;
          text-transform: uppercase;
        }
        .social-textarea {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 20px;
          outline: none;
          resize: vertical;
          min-height: 200px;
          transition: border-color 0.2s;
          line-height: 1.8;
        }
        .social-textarea::placeholder {
          color: #444;
        }
        .social-textarea:focus {
          border-color: var(--platform-color);
        }
        .social-input {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 14px 20px;
          outline: none;
          transition: border-color 0.2s;
        }
        .social-input::placeholder {
          color: #444;
        }
        .social-input:focus {
          border-color: var(--platform-color);
        }

        /* ── ACTIONS ── */
        .social-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
        }
        .social-post-btn {
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
        .social-post-btn:hover:not(:disabled) {
          background: #00FF88;
          color: #0A0A0A;
        }
        .social-post-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }
        .social-clear-btn {
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
        .social-clear-btn:hover {
          background: #FF3B00;
          color: #0A0A0A;
        }

        /* ── INFO BOX ── */
        .social-info {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .social-info-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .social-info-icon {
          font-size: 18px;
        }
        .social-info-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .social-info-content {
          padding: 32px;
        }
        .social-info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .social-info-item {
          display: flex;
          gap: 16px;
          font-size: 12px;
          line-height: 1.7;
          color: #888;
        }
        .social-info-bullet {
          color: var(--color);
          font-size: 16px;
          line-height: 1;
        }
        .social-info-platform {
          color: #E8E8E0;
          font-weight: 700;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .social-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .social-time { display: none; }
          .social-main { padding: 20px; }
          .social-platforms { grid-template-columns: 1fr; }
          .social-actions { grid-template-columns: 1fr; }
        }

        /* ── SCANLINE ── */
        .social-root::after {
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
        .social-section:nth-child(1) { animation-delay: 0s; }
        .social-section:nth-child(2) { animation-delay: 0.1s; }
        .social-section:nth-child(3) { animation-delay: 0.2s; }
      `}</style>

      <div className="social-root" style={{ '--platform-color': platforms.find(p => p.id === platform)?.color } as React.CSSProperties}>
        {/* ── HEADER ── */}
        <header className="social-header">
          <Link href="/" className="social-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="social-title-area">
            <h1 className="social-title">SOCIAL MEDIA HUB</h1>
            <span className="social-badge">MULTI-PLATFORM</span>
          </div>

          <div className="social-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="social-main">
          {/* Platform Selector */}
          <div className="social-section">
            <div className="social-section-header">Select Platform</div>
            <div className="social-section-content">
              <div className="social-platforms">
                {platforms.map((p) => {
                  const Icon = p.icon
                  return (
                    <button
                      key={p.id}
                      onClick={() => p.available && setPlatform(p.id)}
                      disabled={!p.available}
                      className={`social-platform ${platform === p.id ? 'active' : ''}`}
                      style={{ 
                        '--color': p.color,
                        '--color-bg': `${p.color}10`
                      } as React.CSSProperties}
                    >
                      <Icon className="social-platform-icon" size={40} />
                      <div className="social-platform-name">{p.name}</div>
                      {!p.available && (
                        <div className="social-platform-status">Coming Soon</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Generate Section */}
          <div className="social-section">
            <div className="social-section-header">✨ AI Content Generator</div>
            <div className="social-section-content">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="social-gen-btn"
              >
                <Sparkles size={18} />
                {generating ? 'Generating...' : `Generate ${platform} Post`}
              </button>
            </div>
          </div>

          {/* Content Editor */}
          {content && (
            <div className="social-section">
              <div className="social-section-header">📝 Post Content</div>
              <div className="social-section-content">
                {/* Content Textarea */}
                <div className="social-field">
                  <label className="social-label">Content:</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Your post content..."
                    className="social-textarea"
                  />
                </div>

                {/* Image URL - Required for Instagram */}
                {platform === 'instagram' && (
                  <div className="social-field">
                    <label className="social-label">Image URL (Required):</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="social-input"
                    />
                  </div>
                )}

                {/* Facebook Optional Fields */}
                {platform === 'facebook' && (
                  <>
                    <div className="social-field">
                      <label className="social-label">Image URL (Optional):</label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="social-input"
                      />
                    </div>

                    <div className="social-field">
                      <label className="social-label">Link (Optional):</label>
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="social-input"
                      />
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="social-actions">
                  <button
                    onClick={handlePost}
                    disabled={posting}
                    className="social-post-btn"
                  >
                    <Send size={18} />
                    {posting ? 'Posting...' : `Post to ${platform}`}
                  </button>

                  <button
                    onClick={() => {
                      setContent('')
                      setImageUrl('')
                      setLink('')
                    }}
                    className="social-clear-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="social-info">
            <div className="social-info-header">
              <span className="social-info-icon">ℹ️</span>
              <h3 className="social-info-title">Platform Requirements</h3>
            </div>
            <div className="social-info-content">
              <div className="social-info-list">
                <div className="social-info-item">
                  <span className="social-info-bullet" style={{ '--color': '#0088FF' } as React.CSSProperties}>●</span>
                  <div>
                    <span className="social-info-platform">Facebook:</span> Text, images, and links supported
                  </div>
                </div>
                <div className="social-info-item">
                  <span className="social-info-bullet" style={{ '--color': '#FF00AA' } as React.CSSProperties}>●</span>
                  <div>
                    <span className="social-info-platform">Instagram:</span> Image required, caption optional (Business account needed)
                  </div>
                </div>
                <div className="social-info-item">
                  <span className="social-info-bullet" style={{ '--color': '#666' } as React.CSSProperties}>●</span>
                  <div>
                    <span className="social-info-platform">Twitter:</span> Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, Send, Linkedin, Upload, X } from 'lucide-react'
import Link from 'next/link'

export default function LinkedInPage() {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })
      const data = await res.json()
      setContent(data.content)
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/linkedin/auth')
      const data = await res.json()
      window.open(data.auth_url, '_blank', 'width=600,height=700')
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  const handlePost = async () => {
    if (!content) return
    
    setPosting(true)
    try {
      let finalImageUrl = imageUrl
      
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        
        const uploadRes = await fetch('http://localhost:8000/api/social/upload-image', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        
        if (uploadData.status === 'success') {
          finalImageUrl = uploadData.filepath
        }
      }
      
      const res = await fetch('http://localhost:8000/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          image_url: finalImageUrl || undefined
        })
      })
      const data = await res.json()
      
      if (data.status === 'success') {
        alert('✅ Posted to LinkedIn!')
        setContent('')
        setTopic('')
        handleRemoveImage()
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

        .linkedin-root {
          min-height: 100vh;
          background: #0A0A0A;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        /* ── HEADER ── */
        .linkedin-header {
          border-bottom: 2px solid #E8E8E0;
          padding: 0 40px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: 32px;
        }
        .linkedin-back {
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
        .linkedin-back:hover {
          border-color: #0088FF;
          color: #0088FF;
          background: #0088FF/5;
        }
        .linkedin-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .linkedin-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 0.08em;
          color: #E8E8E0;
        }
        .linkedin-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #0088FF;
          padding: 4px 12px;
          border: 1px solid #0088FF;
          background: #0088FF/10;
        }
        .linkedin-time {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: #555;
        }

        /* ── MAIN ── */
        .linkedin-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── SECTION ── */
        .linkedin-section {
          border: 1px solid #1E1E1E;
          background: #0A0A0A;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both;
        }
        .linkedin-section-header {
          padding: 20px 32px;
          border-bottom: 1px solid #1E1E1E;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .linkedin-section-icon {
          font-size: 18px;
        }
        .linkedin-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #E8E8E0;
          text-transform: uppercase;
        }
        .linkedin-section-content {
          padding: 32px;
        }

        /* ── AUTH BUTTON ── */
        .linkedin-auth-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          border: 2px solid #0088FF;
          background: transparent;
          color: #0088FF;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .linkedin-auth-btn:hover {
          background: #0088FF;
          color: #0A0A0A;
        }

        /* ── INPUT FIELD ── */
        .linkedin-field {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .linkedin-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #666;
          text-transform: uppercase;
        }
        .linkedin-input {
          background: #0F0F0F;
          border: 1px solid #1E1E1E;
          color: #E8E8E0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 14px 20px;
          outline: none;
          transition: border-color 0.2s;
        }
        .linkedin-input::placeholder {
          color: #444;
        }
        .linkedin-input:focus {
          border-color: #0088FF;
        }
        .linkedin-textarea {
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
        .linkedin-textarea::placeholder {
          color: #444;
        }
        .linkedin-textarea:focus {
          border-color: #0088FF;
        }

        /* ── GENERATE BUTTON ── */
        .linkedin-gen-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
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
        .linkedin-gen-btn:hover:not(:disabled) {
          background: #FF00AA;
          color: #0A0A0A;
        }
        .linkedin-gen-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }

        /* ── IMAGE UPLOAD ── */
        .linkedin-upload-area {
          border: 2px dashed #1E1E1E;
          background: #0F0F0F;
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
        }
        .linkedin-upload-area:hover {
          border-color: #0088FF;
          background: #0088FF/5;
        }
        .linkedin-upload-icon {
          color: #555;
          margin: 0 auto 16px;
        }
        .linkedin-upload-text {
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #666;
          margin-bottom: 8px;
        }
        .linkedin-upload-hint {
          font-size: 9px;
          letter-spacing: 0.06em;
          color: #444;
        }
        .linkedin-upload-input {
          display: none;
        }

        /* ── IMAGE PREVIEW ── */
        .linkedin-image-preview {
          position: relative;
          margin-bottom: 16px;
        }
        .linkedin-preview-img {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border: 1px solid #1E1E1E;
        }
        .linkedin-remove-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FF3B00;
          border: none;
          color: #FFF;
          cursor: pointer;
          transition: all 0.2s;
        }
        .linkedin-remove-btn:hover {
          background: #FF5520;
        }

        /* ── URL INPUT ── */
        .linkedin-url-hint {
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #555;
          margin-bottom: 8px;
        }

        /* ── ACTION BUTTONS ── */
        .linkedin-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          margin-top: 24px;
        }
        .linkedin-post-btn {
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
        .linkedin-post-btn:hover:not(:disabled) {
          background: #00FF88;
          color: #0A0A0A;
        }
        .linkedin-post-btn:disabled {
          border-color: #333;
          color: #333;
          cursor: not-allowed;
        }
        .linkedin-clear-btn {
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
        .linkedin-clear-btn:hover {
          background: #FF3B00;
          color: #0A0A0A;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .linkedin-header {
            grid-template-columns: auto 1fr;
            padding: 0 20px;
          }
          .linkedin-time { display: none; }
          .linkedin-main { padding: 20px; }
          .linkedin-actions { grid-template-columns: 1fr; }
        }

        /* ── SCANLINE ── */
        .linkedin-root::after {
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
        .linkedin-section:nth-child(1) { animation-delay: 0s; }
        .linkedin-section:nth-child(2) { animation-delay: 0.1s; }
        .linkedin-section:nth-child(3) { animation-delay: 0.2s; }
      `}</style>

      <div className="linkedin-root">
        {/* ── HEADER ── */}
        <header className="linkedin-header">
          <Link href="/" className="linkedin-back">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="linkedin-title-area">
            <h1 className="linkedin-title">LINKEDIN AUTO-POST</h1>
            <span className="linkedin-badge">SOCIAL</span>
          </div>

          <div className="linkedin-time">{time}</div>
        </header>

        {/* ── MAIN ── */}
        <main className="linkedin-main">
          {/* Auth Section */}
          <div className="linkedin-section">
            <div className="linkedin-section-header">
              <span className="linkedin-section-icon">🔐</span>
              <h2 className="linkedin-section-title">Authentication</h2>
            </div>
            <div className="linkedin-section-content">
              <button onClick={handleAuth} className="linkedin-auth-btn">
                <Linkedin size={18} />
                Connect LinkedIn
              </button>
            </div>
          </div>

          {/* Generate Section */}
          <div className="linkedin-section">
            <div className="linkedin-section-header">
              <span className="linkedin-section-icon">✨</span>
              <h2 className="linkedin-section-title">Generate Post</h2>
            </div>
            <div className="linkedin-section-content">
              <div className="linkedin-field">
                <label className="linkedin-label">Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI automation for restaurants"
                  className="linkedin-input"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="linkedin-gen-btn"
              >
                <Sparkles size={18} />
                {loading ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>

          {/* Content Section */}
          {content && (
            <div className="linkedin-section">
              <div className="linkedin-section-header">
                <span className="linkedin-section-icon">📝</span>
                <h2 className="linkedin-section-title">Post Content</h2>
              </div>
              <div className="linkedin-section-content">
                {/* Content Textarea */}
                <div className="linkedin-field">
                  <label className="linkedin-label">Content:</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="linkedin-textarea"
                  />
                </div>

                {/* Image Upload */}
                <div className="linkedin-field">
                  <label className="linkedin-label">Image (Optional):</label>
                  
                  {!imagePreview ? (
                    <label className="linkedin-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="linkedin-upload-input"
                      />
                      <Upload className="linkedin-upload-icon" size={48} />
                      <div className="linkedin-upload-text">Click to upload image</div>
                      <div className="linkedin-upload-hint">JPG, PNG, GIF (Max 5MB)</div>
                    </label>
                  ) : (
                    <div className="linkedin-image-preview">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="linkedin-preview-img"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="linkedin-remove-btn"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  <div className="linkedin-url-hint">Or paste image URL:</div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="linkedin-input"
                  />
                </div>

                {/* Actions */}
                <div className="linkedin-actions">
                  <button
                    onClick={handlePost}
                    disabled={posting}
                    className="linkedin-post-btn"
                  >
                    <Send size={18} />
                    {posting ? 'Posting...' : 'Post to LinkedIn'}
                  </button>

                  <button
                    onClick={() => {
                      setContent('')
                      handleRemoveImage()
                    }}
                    className="linkedin-clear-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}

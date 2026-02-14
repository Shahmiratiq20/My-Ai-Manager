'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, Send, Facebook, Instagram, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function SocialMediaPage() {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'twitter'>('facebook')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">📱 Social Media Hub</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Platform Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-semibold mb-4">Select Platform</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setPlatform('facebook')}
              className={`p-4 rounded-lg border-2 transition ${
                platform === 'facebook'
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-white/5 border-white/20 hover:border-blue-400'
              }`}
            >
              <Facebook className="mx-auto text-white mb-2" size={32} />
              <p className="text-white font-semibold">Facebook</p>
            </button>

            <button
              onClick={() => setPlatform('instagram')}
              className={`p-4 rounded-lg border-2 transition ${
                platform === 'instagram'
                  ? 'bg-pink-600 border-pink-400'
                  : 'bg-white/5 border-white/20 hover:border-pink-400'
              }`}
            >
              <Instagram className="mx-auto text-white mb-2" size={32} />
              <p className="text-white font-semibold">Instagram</p>
            </button>

            <button
              onClick={() => setPlatform('twitter')}
              className={`p-4 rounded-lg border-2 transition opacity-50 cursor-not-allowed`}
              disabled
            >
              <Twitter className="mx-auto text-white mb-2" size={32} />
              <p className="text-white font-semibold">Twitter</p>
              <p className="text-gray-400 text-xs mt-1">Coming soon</p>
            </button>
          </div>
        </div>

        {/* Generate Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-semibold mb-4">✨ AI Content Generator</h2>
          
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Sparkles size={20} />
            {generating ? 'Generating...' : `Generate ${platform} Post`}
          </button>
        </div>

        {/* Content Editor */}
        {content && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-white font-semibold mb-4">📝 Post Content</h2>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Your post content..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-blue-400"
            />

            {platform === 'instagram' && (
              <div className="mb-4">
                <label className="text-white font-semibold mb-2 block">Image URL (Required for Instagram)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                />
              </div>
            )}

            {platform === 'facebook' && (
              <>
                <div className="mb-4">
                  <label className="text-white font-semibold mb-2 block">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-white font-semibold mb-2 block">Link (Optional)</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={handlePost}
                disabled={posting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Send size={20} />
                {posting ? 'Posting...' : `Post to ${platform}`}
              </button>

              <button
                onClick={() => {
                  setContent('')
                  setImageUrl('')
                  setLink('')
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-3">ℹ️ Platform Requirements</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>Facebook:</strong> Text, images, and links supported</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span><strong>Instagram:</strong> Image required, caption optional (Business account needed)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span><strong>Twitter:</strong> Coming soon</span>
            </li>
          </ul>
        </div>

      </main>
    </div>
  )
}
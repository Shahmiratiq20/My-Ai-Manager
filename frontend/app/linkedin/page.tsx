'use client'

import { useState } from 'react'
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
      
      // Upload image if file selected
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Linkedin className="text-blue-500" size={32} />
            LinkedIn Auto-Post
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Auth Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-semibold mb-4">🔐 Authentication</h2>
          <button
            onClick={handleAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Linkedin size={20} />
            Connect LinkedIn
          </button>
        </div>

        {/* Generate Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-semibold mb-4">✨ Generate Post</h2>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g., AI automation for restaurants)"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-blue-400"
          />
          
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Sparkles size={20} />
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>

        {/* Content Section */}
        {content && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-white font-semibold mb-4">📝 Post Content</h2>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-blue-400"
            />
            
            {/* Image Upload */}
            <div className="mb-4">
              <label className="text-white font-semibold mb-2 block">📸 Add Image (Optional)</label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-400">Click to upload image</p>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG, GIF (Max 5MB)</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <p className="text-gray-400 text-sm mt-2">Or paste image URL:</p>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 mt-1 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handlePost}
                disabled={posting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Send size={20} />
                {posting ? 'Posting...' : 'Post to LinkedIn'}
              </button>
              
              <button
                onClick={() => {
                  setContent('')
                  handleRemoveImage()
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
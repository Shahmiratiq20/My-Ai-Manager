'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function EmailPage() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Mail className="text-blue-400" size={32} />
            Send Email
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          
          {/* To Field */}
          <div className="mb-4">
            <label className="text-white font-semibold mb-2 block">To:</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Subject Field */}
          <div className="mb-4">
            <label className="text-white font-semibold mb-2 block">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Body Field */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-semibold">Message:</label>
              <button
                onClick={handleGenerateReply}
                disabled={generating || !body}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Sparkles size={16} />
                {generating ? 'Generating...' : 'AI Polish'}
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Type your message or paste an email to generate AI reply..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Send Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSend}
              disabled={sending || !to || !subject || !body}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Send size={20} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>

            <button
              onClick={() => {
                setTo('')
                setSubject('')
                setBody('')
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg transition"
            >
              Clear
            </button>
          </div>

        </div>

        {/* Quick Templates */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-semibold mb-4">📝 Quick Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSubject('Invoice Request')
                setBody('Hi,\n\nCould you please send me the invoice for our recent project?\n\nThank you!')
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-left text-white transition"
            >
              <p className="font-semibold">Invoice Request</p>
              <p className="text-sm text-gray-400">Ask for invoice</p>
            </button>

            <button
              onClick={() => {
                setSubject('Meeting Follow-up')
                setBody('Hi,\n\nThank you for the productive meeting today. Here are the action items we discussed:\n\n1. [Action 1]\n2. [Action 2]\n\nLooking forward to our next steps.')
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-left text-white transition"
            >
              <p className="font-semibold">Meeting Follow-up</p>
              <p className="text-sm text-gray-400">Summarize meeting</p>
            </button>

            <button
              onClick={() => {
                setSubject('Thank You')
                setBody('Hi,\n\nI wanted to take a moment to thank you for your help with [project/task]. Your expertise made a significant difference.\n\nBest regards')
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-left text-white transition"
            >
              <p className="font-semibold">Thank You</p>
              <p className="text-sm text-gray-400">Express gratitude</p>
            </button>

            <button
              onClick={() => {
                setSubject('Project Update')
                setBody('Hi,\n\nHere\'s the latest update on our project:\n\nCompleted:\n- [Task 1]\n- [Task 2]\n\nNext Steps:\n- [Task 3]\n\nLet me know if you have any questions.')
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-left text-white transition"
            >
              <p className="font-semibold">Project Update</p>
              <p className="text-sm text-gray-400">Status report</p>
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
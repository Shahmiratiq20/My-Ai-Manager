'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuditPage() {
  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchLatestAudit()
  }, [])

  const fetchLatestAudit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/audit/latest')
      if (res.ok) {
        const data = await res.json()
        setAudit(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewAudit = async () => {
    setGenerating(true)
    try {
      const res = await fetch('http://localhost:8000/api/audit/generate', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.status === 'success') {
        setAudit(data)
        alert('✅ New audit generated!')
      }
    } catch (error) {
      console.error('Generate error:', error)
      alert('❌ Failed to generate audit')
    } finally {
      setGenerating(false)
    }
  }

  const formatMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/^\*\*(.+?)\*\*/gm, '<strong class="text-white">$1</strong>')
      .replace(/^- (.+$)/gm, '<li class="text-gray-300 ml-4">$1</li>')
      .replace(/^\d+\. (.+$)/gm, '<li class="text-gray-300 ml-4">$1</li>')
      .replace(/---/g, '<hr class="border-white/20 my-6" />')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-blue-400 transition">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-green-400" size={32} />
              Weekly CEO Audit
            </h1>
          </div>
          
          <button
            onClick={generateNewAudit}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Generate New Audit'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="animate-spin mx-auto text-blue-400 mb-4" size={48} />
            <p className="text-gray-400">Loading audit...</p>
          </div>
        ) : audit ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4">
                <h3 className="text-green-400 text-sm font-semibold mb-1">Revenue This Week</h3>
                <p className="text-white text-2xl font-bold">$2,450</p>
                <p className="text-green-300 text-sm">+16.7% vs last week</p>
              </div>
              
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                <h3 className="text-blue-400 text-sm font-semibold mb-1">Tasks Completed</h3>
                <p className="text-white text-2xl font-bold">12</p>
                <p className="text-blue-300 text-sm">This week</p>
              </div>
              
              <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                <h3 className="text-purple-400 text-sm font-semibold mb-1">Social Posts</h3>
                <p className="text-white text-2xl font-bold">3</p>
                <p className="text-purple-300 text-sm">LinkedIn</p>
              </div>
            </div>

            {/* Report Content */}
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(audit.content) 
              }}
            />

            {/* Download Button */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <button
                onClick={() => {
                  const blob = new Blob([audit.content], { type: 'text/markdown' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = audit.filename
                  a.click()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
              >
                <FileText size={20} />
                Download Report
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
            <p className="text-gray-400 mb-6">No audit reports found</p>
            <button
              onClick={generateNewAudit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg"
            >
              Generate First Audit
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
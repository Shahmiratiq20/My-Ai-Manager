'use client'

import { useEffect, useState } from 'react'
import { Mail, FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({
    needs_action: 0,
    plans: 0,
    done: 0,
    pending_approval: 0
  })

  useEffect(() => {
    // Fetch stats every 5 seconds
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🤖 AI Employee
            <span className="text-sm font-normal text-gray-400">v1.0</span>
          </h1>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Needs Action Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400 transition">
            <div className="flex items-center justify-between mb-4">
              <Mail className="text-blue-400" size={32} />
              <span className="text-4xl font-bold text-white">{stats.needs_action}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Pending Tasks</h3>
          </div>

          {/* Plans Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-purple-400" size={32} />
              <span className="text-4xl font-bold text-white">{stats.plans}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Active Plans</h3>
          </div>

          {/* Done Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400 transition">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-400" size={32} />
              <span className="text-4xl font-bold text-white">{stats.done}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Completed</h3>
          </div>

          {/* Approvals Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400 transition">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-yellow-400" size={32} />
              <span className="text-4xl font-bold text-white">{stats.pending_approval}</span>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Pending Approval</h3>
          </div>

        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-2">
            {stats.needs_action === 0 ? '✅ All Clear!' : '⚠️ Tasks Need Attention'}
          </h2>
          <p className="text-gray-300">
            System is running smoothly. AI monitoring active.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link href="/tasks" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400 transition text-center">
            <h3 className="text-white font-semibold">View Tasks →</h3>
          </Link>
          <Link href="/approvals" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-yellow-400 transition text-center">
            <h3 className="text-white font-semibold">Approvals →</h3>
          </Link>
          <Link href="/chat" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-green-400 transition text-center">
            <h3 className="text-white font-semibold">AI Chat →</h3>
          </Link>
          <Link href="/linkedin" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500 transition text-center">
             <h3 className="text-white font-semibold">LinkedIn Post →</h3>
          </Link>
          <Link href="/audit" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-green-400 transition text-center">
            <h3 className="text-white font-semibold">CEO Audit →</h3>
          </Link>
          <Link href="/email" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500 transition text-center">
            <h3 className="text-white font-semibold">Send Email →</h3>
          </Link>
          <Link href="/autonomous" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-400 transition text-center">
           <h3 className="text-white font-semibold">Autonomous Mode →</h3>
          </Link>
          <Link href="/social" className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-pink-400 transition text-center">
           <h3 className="text-white font-semibold">Social Media →</h3>
          </Link>
        </div>
      </main>
    </div>
  )
}
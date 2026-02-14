'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Approval {
  id: string
  name: string
  content: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/approvals')
        const data = await res.json()
        setApprovals(data)
      } catch (error) {
        console.error('Failed to fetch approvals:', error)
      }
    }

    fetchApprovals()
    const interval = setInterval(fetchApprovals, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/approve/${id}`, { method: 'POST' })
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/reject/${id}`, { method: 'POST' })
      setApprovals(approvals.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">⏳ Pending Approvals</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {approvals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">✅ No pending approvals</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white font-semibold mb-4">{approval.name}</h3>
                <pre className="text-gray-400 text-sm whitespace-pre-wrap mb-6 max-h-40 overflow-y-auto">
                  {approval.content}
                </pre>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
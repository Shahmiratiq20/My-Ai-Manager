'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Activity, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  content: string
}

export default function AutonomousPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<any>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
    fetchStatus()
    
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tasks')
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/autonomous/status')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const startAutonomous = async (taskId: string) => {
    setProcessing(taskId)
    
    try {
      const res = await fetch('http://localhost:8000/api/autonomous/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task_id: taskId,
          max_iterations: 5
        })
      })
      
      const data = await res.json()
      
      if (data.status === 'completed') {
        alert('✅ Task completed autonomously!')
      } else {
        alert('⚠️ Task needs manual review')
      }
      
      fetchTasks()
      fetchStatus()
      
    } catch (error) {
      console.error('Autonomous processing error:', error)
      alert('❌ Processing failed')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="text-purple-400" size={32} />
            Autonomous Task Processing
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-purple-400 text-sm font-semibold mb-1">Active Processing</h3>
            <p className="text-white text-3xl font-bold">{status?.active || 0}</p>
            <p className="text-purple-300 text-sm mt-1">Tasks in progress</p>
          </div>
          
          <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-6">
            <h3 className="text-blue-400 text-sm font-semibold mb-1">Available Tasks</h3>
            <p className="text-white text-3xl font-bold">{tasks.length}</p>
            <p className="text-blue-300 text-sm mt-1">Ready for processing</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-semibold mb-3">🤖 How Autonomous Processing Works</h2>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">1.</span>
              <span>AI analyzes the task and creates an action plan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">2.</span>
              <span>Iteratively works on the task (up to 5 iterations)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">3.</span>
              <span>Marks task complete when finished or flags for review</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">4.</span>
              <span>Generates detailed execution report</span>
            </li>
          </ul>
        </div>

        {/* Active Tasks */}
        {status?.tasks && status.tasks.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-orange-400/30 mb-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-orange-400" size={20} />
              Currently Processing
            </h2>
            <div className="space-y-2">
              {status.tasks.map((task: any) => (
                <div key={task.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-medium">{task.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="animate-pulse w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Processing...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Tasks */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-semibold mb-4">📋 Available Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
              <p className="text-gray-400">No tasks available for processing</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/20 hover:border-purple-400 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{task.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {task.content}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => startAutonomous(task.id)}
                      disabled={processing === task.id}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
                    >
                      {processing === task.id ? (
                        <>
                          <Activity className="animate-spin" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          Start Auto
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
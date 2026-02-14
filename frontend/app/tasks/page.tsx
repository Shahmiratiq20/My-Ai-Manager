'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, File } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  content: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/tasks')
        const data = await res.json()
        setTasks(data)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">📋 Pending Tasks</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">✅ No pending tasks</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400 transition"
              >
                <div className="flex items-start gap-4">
                  {task.name.includes('EMAIL') ? (
                    <Mail className="text-blue-400 mt-1" size={24} />
                  ) : (
                    <File className="text-purple-400 mt-1" size={24} />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{task.name}</h3>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">
                      {task.content}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
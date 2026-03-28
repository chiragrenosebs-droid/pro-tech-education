// app/admin/page.tsx
'use client'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import GlassCard from '@/components/GlassCard'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { user, isAdmin } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin && user) router.push('/dashboard')
  }, [isAdmin, user])

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage platform content and users.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <GlassCard className="text-center">
          <div className="text-4xl font-bold text-green-600">0</div>
          <div className="text-gray-500 dark:text-gray-400 mt-2">Active Students</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-4xl font-bold text-blue-600">0</div>
          <div className="text-gray-500 dark:text-gray-400 mt-2">Total Courses</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-4xl font-bold text-purple-600">0</div>
          <div className="text-gray-500 dark:text-gray-400 mt-2">Pending Enrollments</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">Add New Course</button>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">Upload PDF</button>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">Manage Users</button>
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </GlassCard>
      </div>
    </div>
  )
}
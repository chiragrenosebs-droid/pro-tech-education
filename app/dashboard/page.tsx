'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import ProgressBar from '@/components/ProgressBar'
import { motion } from 'framer-motion'

export default function StudentDashboard() {
  const { user, isAdmin } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (isAdmin) {
      router.push('/admin')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch approved enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)
          .eq('status', 'approved')

        const enrolledIds = enrollments?.map(e => e.course_id) || []

        // Fetch all courses
        const { data: courses } = await supabase.from('courses').select('*')
        
        if (courses) {
          const enrolled = courses.filter(c => enrolledIds.includes(c.id))
          const available = courses.filter(c => !enrolledIds.includes(c.id))
          setEnrolledCourses(enrolled)
          setAvailableCourses(available)

          // Fetch progress for enrolled courses
          if (enrolled.length > 0) {
            const { data: pdfs } = await supabase
              .from('pdfs')
              .select('id, course_id')
              .in('course_id', enrolled.map(c => c.id))
            
            const { data: views } = await supabase
              .from('progress')
              .select('pdf_id')
              .eq('student_id', user.id)

            const viewedPdfIds = new Set(views?.map(v => v.pdf_id) || [])
            
            // Count total PDFs per course
            const totalPerCourse: Record<string, number> = {}
            pdfs?.forEach(pdf => {
              totalPerCourse[pdf.course_id] = (totalPerCourse[pdf.course_id] || 0) + 1
            })
            
            // Count viewed PDFs per course
            const viewedPerCourse: Record<string, number> = {}
            pdfs?.forEach(pdf => {
              if (viewedPdfIds.has(pdf.id)) {
                viewedPerCourse[pdf.course_id] = (viewedPerCourse[pdf.course_id] || 0) + 1
              }
            })
            
            // Calculate percentages
            const progress: Record<string, number> = {}
            enrolled.forEach(course => {
              const total = totalPerCourse[course.id] || 0
              const viewed = viewedPerCourse[course.id] || 0
              progress[course.id] = total > 0 ? (viewed / total) * 100 : 0
            })
            
            setProgressMap(progress)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAdmin, router])

  const requestEnrollment = async (courseId: string) => {
    const { error } = await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: courseId,
      status: 'pending',
    })
    if (error) {
      alert('Failed to request enrollment')
    } else {
      alert('Enrollment request sent to admin')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Continue learning where you left off.
        </p>
      </motion.div>

      {/* Active Courses Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Your Active Courses
        </h2>
        {enrolledCourses.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              You are not enrolled in any courses yet. Explore available courses below.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-t-2xl -mt-6 -mx-6 mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(progressMap[course.id] || 0)}%
                      </span>
                    </div>
                    <ProgressBar percentage={progressMap[course.id] || 0} />
                  </div>
                  <button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Continue Learning
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Available Courses Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Discover New Courses
        </h2>
        {availableCourses.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              All courses are currently in progress. Check back later for new content!
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-t-2xl -mt-6 -mx-6 mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <button
                    onClick={() => requestEnrollment(course.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Request Enrollment
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
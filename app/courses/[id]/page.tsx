'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useUser } from '@/hooks/useUser'
import GlassCard from '@/components/GlassCard'
import { motion } from 'framer-motion'

export default function CoursePage() {
  const { id } = useParams()
  const { user } = useUser()
  const supabase = createClient()
  const [course, setCourse] = useState<any>(null)
  const [pdfs, setPdfs] = useState<any[]>([])
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Check enrollment
      const { data: enroll } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user?.id)
        .eq('course_id', id)
        .eq('status', 'approved')
        .single()
      setEnrollment(enroll)

      // Course details
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single()
      setCourse(courseData)

      if (enroll) {
        // Fetch PDFs
        const { data: pdfData } = await supabase.from('pdfs').select('*').eq('course_id', id).order('order')
        setPdfs(pdfData || [])
      }

      setLoading(false)
    }

    if (user) fetchData()
  }, [user, id])

  const recordView = async (pdfId: string) => {
    await supabase.from('progress').upsert({
      student_id: user.id,
      pdf_id: pdfId,
      view_count: 1,
      last_viewed_at: new Date().toISOString(),
    }, { onConflict: 'student_id, pdf_id' })
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!enrollment) return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <GlassCard>
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">You are not enrolled in this course. Request enrollment from the admin.</p>
        <button
          onClick={() => supabase.from('enrollments').insert({ student_id: user.id, course_id: id, status: 'pending' })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Request Enrollment
        </button>
      </GlassCard>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {course?.thumbnail_url && (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course?.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{course?.description}</p>
      </motion.div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Course Materials</h2>
      {pdfs.length === 0 ? (
        <GlassCard>
          <p className="text-gray-500 dark:text-gray-400">No materials uploaded yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {pdfs.map(pdf => (
            <GlassCard key={pdf.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{pdf.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">PDF document</p>
              </div>
              <a
                href={pdf.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordView(pdf.id)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                View
              </a>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
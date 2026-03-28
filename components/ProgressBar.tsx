'use client'

import { motion } from 'framer-motion'

export default function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
      />
    </div>
  )
}
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/providers/ThemeProvider'
import { useUser } from '@/hooks/useUser'

const studentNav = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Courses', path: '/courses', icon: '📚' },
  { name: 'Profile', path: '/profile', icon: '👤' },
]

const adminNav = [
  { name: 'Dashboard', path: '/admin', icon: '📊' },
  { name: 'Users', path: '/admin/users', icon: '👥' },
  { name: 'Courses', path: '/admin/courses', icon: '📚' },
  { name: 'Reports', path: '/admin/reports', icon: '📈' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { user, isAdmin } = useUser()

  // Don't show navigation on login/signup pages or pending page
  if (pathname === '/login' || pathname === '/signup' || pathname === '/pending') {
    return null
  }

  const navItems = isAdmin ? adminNav : studentNav

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 glass rounded-t-2xl border-t border-white/20">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center text-sm transition-all duration-200 hover:scale-110 ${
              pathname === item.path ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center text-sm transition-all duration-200 hover:scale-110 text-gray-500 dark:text-gray-400"
        >
          <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>Theme</span>
        </button>
      </div>
    </div>
  )
}
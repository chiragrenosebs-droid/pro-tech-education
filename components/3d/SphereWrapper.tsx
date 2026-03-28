'use client'

import dynamic from 'next/dynamic'

// Dynamically import the sphere with SSR disabled
const Sphere = dynamic(() => import('./Sphere'), { ssr: false })

export default function SphereWrapper() {
  return <Sphere />
}
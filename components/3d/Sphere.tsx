'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Component for each course marker
function CourseMarker({ position, title, id, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
    } else if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={() => onClick(id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={hovered ? '#ffaa00' : '#4caf50'} emissive={hovered ? '#ffaa33' : '#228833'} />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/70 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
            {title}
          </div>
        </Html>
      )}
    </mesh>
  )
}

// Main sphere with markers
function SphereWithMarkers({ courses, onCourseClick }: any) {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (sphereRef.current) {
      // Rotate slowly
      sphereRef.current.rotation.y += 0.002
    }
  })

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.3} metalness={0.7} wireframe={false} transparent opacity={0.6} />
      </mesh>
      {courses.map((course: any) => {
        let pos = course.marker_position
        if (!pos) {
          // Default random distribution on sphere surface
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const x = 2 * Math.sin(phi) * Math.cos(theta)
          const y = 2 * Math.sin(phi) * Math.sin(theta)
          const z = 2 * Math.cos(phi)
          pos = { x, y, z }
        } else {
          // Ensure it's on the sphere surface (normalize)
          const len = Math.sqrt(pos.x**2 + pos.y**2 + pos.z**2)
          pos = { x: pos.x * 2 / len, y: pos.y * 2 / len, z: pos.z * 2 / len }
        }
        return (
          <CourseMarker
            key={course.id}
            position={pos}
            title={course.title}
            id={course.id}
            onClick={onCourseClick}
          />
        )
      })}
    </group>
  )
}

// Main component
export default function ThreeSphere() {
  const [courses, setCourses] = useState([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (!error && data) setCourses(data)
    }
    fetchCourses()
  }, [])

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <SphereWithMarkers courses={courses} onCourseClick={handleCourseClick} />
      </Canvas>
    </div>
  )
}
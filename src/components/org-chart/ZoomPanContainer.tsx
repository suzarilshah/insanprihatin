'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ZoomPanContainerProps {
  children: React.ReactNode
  initialScale?: number
  minScale?: number
  maxScale?: number
}

export default function ZoomPanContainer({
  children,
  initialScale = 1,
  minScale = 0.5,
  maxScale = 2,
}: ZoomPanContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(initialScale)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY * -0.01
      const newScale = Math.min(Math.max(scale + delta, minScale), maxScale)
      setScale(newScale)
    } else {
      // Pan on scroll
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow left click drag
    if (e.button !== 0) return
    setIsDragging(true)
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y })
    e.currentTarget.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false)
    e.currentTarget.style.cursor = 'grab'
  }

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, maxScale))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, minScale))
  const handleReset = () => {
    setScale(initialScale)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-50/50 rounded-3xl overflow-hidden border border-gray-100 shadow-inner group">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          transform: `scale(${scale}) translate(${position.x % 20}px, ${position.y % 20}px)`
        }}
      />

      {/* Controls Toolbar */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all active:scale-95"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all active:scale-95"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all active:scale-95"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center origin-center"
          animate={{
            scale,
            x: position.x,
            y: position.y,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      </div>
      
      {/* Overlay Instructions */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-500 shadow-sm border border-gray-100">
          Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  )
}
